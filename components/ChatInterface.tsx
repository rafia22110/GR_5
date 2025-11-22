import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, ModelType } from '../types';
import { getGenAI } from '../services/gemini';
import { useLanguage } from '../contexts/LanguageContext';

const ChatInterface: React.FC = () => {
  const { t, dir } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.Pro);
  const [useSearch, setUseSearch] = useState(false);
  const [thinkingBudget, setThinkingBudget] = useState(0); // 0 = disabled

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getGenAI();
      const modelName = selectedModel;
      
      const config: any = {
        thinkingConfig: thinkingBudget > 0 ? { thinkingBudget } : undefined,
      };

      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      // We will create a new chat for each turn to simplify this demo, 
      // but in a real app, you'd persist the `Chat` object.
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const chat = ai.chats.create({
        model: modelName,
        config: config,
        history: history
      });

      const resultStream = await chat.sendMessageStream({ message: userMsg.text });
      
      const aiMsgId = (Date.now() + 1).toString();
      let fullText = '';
      let groundingChunks: Array<{title: string, uri: string}> = [];

      setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '' }]);

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        
        // Accumulate text
        if (c.text) {
          fullText += c.text;
        }

        // Check for grounding
        if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) {
           c.candidates[0].groundingMetadata.groundingChunks.forEach((gc: any) => {
             if (gc.web) {
               groundingChunks.push({ title: gc.web.title, uri: gc.web.uri });
             }
           });
        }

        setMessages(prev => 
          prev.map(m => m.id === aiMsgId ? { ...m, text: fullText, groundingUrls: groundingChunks } : m)
        );
      }

    } catch (error: any) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: `Error: ${error.message || 'Something went wrong.'}`,
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gemini-bg text-gray-200" dir={dir}>
      {/* Header / Config Bar */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-800 bg-gemini-surface/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelType)}
            className="bg-gray-800 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={ModelType.Flash}>{t.chat.modelFlash}</option>
            <option value={ModelType.Pro}>{t.chat.modelPro}</option>
          </select>

          {selectedModel === ModelType.Pro && (
            <div className="flex items-center gap-2 text-xs">
               <label className="text-gray-400">{t.chat.thinking}:</label>
               <input 
                 type="range" 
                 min="0" 
                 max="16000" 
                 step="1024" 
                 value={thinkingBudget}
                 onChange={(e) => setThinkingBudget(Number(e.target.value))}
                 className="w-24 accent-blue-500"
               />
               <span className="w-12">{thinkingBudget > 0 ? `${thinkingBudget/1024}k` : t.chat.off}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
             onClick={() => setUseSearch(!useSearch)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
               useSearch 
                 ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                 : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
             }`}
          >
             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             {useSearch ? t.chat.groundingOn : t.chat.groundingOff}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
             </div>
             <p className="text-lg font-medium">{t.chat.startMessage}</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 ${
              msg.role === 'user' 
                ? `bg-blue-600 text-white ${dir === 'rtl' ? 'rounded-br-sm' : 'rounded-br-sm'}` 
                : `bg-gray-800 text-gray-200 ${dir === 'rtl' ? 'rounded-bl-sm' : 'rounded-bl-sm'}`
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed" dir={dir === 'rtl' && msg.role === 'model' ? 'rtl' : 'auto'}>
                {msg.text || <span className="animate-pulse">{t.chat.thinkingProcess}</span>}
              </div>
              
              {/* Grounding Sources */}
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-700/50">
                  <p className="text-xs font-semibold text-gray-400 mb-2">{t.chat.sources}</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, idx) => (
                      <a 
                        key={idx}
                        href={url.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-900/50 hover:bg-gray-700 px-2 py-1 rounded border border-gray-700 text-blue-300 truncate max-w-[200px]"
                      >
                        {url.title || new URL(url.uri).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gemini-surface border-t border-gray-800">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-gray-900/50 border border-gray-700 rounded-3xl p-2 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t.chat.placeholder}
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 resize-none max-h-32 min-h-[44px] py-2.5 px-3"
            rows={1}
            dir="auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors mb-0.5 ${
              !input.trim() || isLoading
                ? 'bg-gray-800 text-gray-600'
                : 'bg-white text-gray-900 hover:bg-gray-200'
            }`}
          >
            {isLoading ? (
               <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <svg className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            )}
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-2 text-center text-xs text-gray-500">
          {t.chat.disclaimer}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
