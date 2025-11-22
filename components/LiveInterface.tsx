import React, { useState, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { getGenAI, decodeAudioData, createPcmBlob } from '../services/gemini';
import { useLanguage } from '../contexts/LanguageContext';

const LiveInterface: React.FC = () => {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Audio Context Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Visualizer animation
  const animationRef = useRef<number>(0);

  const stopAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    setIsConnected(false);
    setStatus('disconnected');
    setVolume(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const startLive = async () => {
    setError(null);
    setStatus('connecting');

    try {
      const ai = getGenAI();
      
      // Setup Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setStatus('connected');
            setIsConnected(true);

            const source = inputCtx.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
               const inputData = e.inputBuffer.getChannelData(0);
               let sum = 0;
               for(let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
               setVolume(Math.min((sum / (inputData.length/100)) * 5, 1)); 

               const pcmBlob = createPcmBlob(inputData);
               sessionPromise.then(session => {
                 session.sendRealtimeInput({ media: pcmBlob });
               });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
             const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio) {
                if (outputCtx.state === 'suspended') await outputCtx.resume();
                
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                
                const audioBuf = await decodeAudioData(
                  base64ToUint8Array(base64Audio),
                  outputCtx,
                  24000,
                  1
                );
                
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuf;
                source.connect(outputNode);
                source.onended = () => sourcesRef.current.delete(source);
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuf.duration;
                sourcesRef.current.add(source);
             }

             if (msg.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
            console.log("Live Session Closed");
            stopAudio();
          },
          onerror: (e) => {
            console.error("Live Session Error", e);
            setError(t.live.error);
            stopAudio();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        }
      });
      
      sessionPromise.then(sess => {
         sessionRef.current = sess;
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start live session.");
      setStatus('disconnected');
    }
  };

  function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gemini-bg text-white relative overflow-hidden">
      {isConnected && (
         <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
            <div className={`w-64 h-64 bg-blue-500/20 rounded-full blur-3xl transition-transform duration-100`} style={{ transform: `scale(${1 + volume})` }}></div>
            <div className={`absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-transform duration-300 delay-75`} style={{ transform: `scale(${1 + volume * 0.5})` }}></div>
         </div>
      )}

      <div className="z-10 text-center space-y-8">
        <div className="relative">
           <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
             status === 'connected' ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]' : 
             status === 'connecting' ? 'border-yellow-500 animate-pulse' : 'border-gray-700'
           }`}>
              <svg className={`w-12 h-12 transition-colors ${status === 'connected' ? 'text-white' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
           </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2">{t.live.title}</h2>
          <p className="text-gray-400">
            {status === 'disconnected' && t.live.ready}
            {status === 'connecting' && t.live.connecting}
            {status === 'connected' && t.live.listening}
          </p>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>

        <button
          onClick={status === 'connected' ? stopAudio : startLive}
          disabled={status === 'connecting'}
          className={`px-8 py-3 rounded-full font-semibold text-lg transition-all transform hover:scale-105 ${
            status === 'connected' 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
              : 'bg-white text-gray-900 hover:bg-gray-200'
          }`}
        >
          {status === 'connected' ? t.live.end : t.live.start}
        </button>
      </div>
    </div>
  );
};

export default LiveInterface;
