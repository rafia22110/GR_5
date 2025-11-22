import React, { useState } from 'react';
import { getGenAI } from '../services/gemini';
import { useLanguage } from '../contexts/LanguageContext';

const ImageInterface: React.FC = () => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: '1K'
          }
        }
      });

      const images: string[] = [];
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          }
        }
      }

      if (images.length === 0) {
        throw new Error("No images returned.");
      }

      setGeneratedImages(images);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full bg-gemini-bg text-gray-200 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            {t.image.title}
          </h2>
          <p className="text-gray-400 mt-2">{t.image.subtitle}</p>
        </div>

        <div className="flex gap-4 items-start">
           <div className="flex-1 bg-gemini-surface border border-gray-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-green-500 transition-all">
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder={t.image.placeholder}
               className="w-full bg-transparent border-none outline-none text-gray-200 p-3 resize-none h-24"
             />
             <div className="flex justify-between items-center px-3 pb-2">
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="bg-gray-800 text-xs rounded px-2 py-1 border border-gray-600 text-gray-300 outline-none"
                >
                  <option value="1:1">{t.image.aspectRatio.square}</option>
                  <option value="16:9">{t.image.aspectRatio.landscape169}</option>
                  <option value="9:16">{t.image.aspectRatio.portrait916}</option>
                  <option value="3:4">{t.image.aspectRatio.portrait34}</option>
                  <option value="4:3">{t.image.aspectRatio.landscape43}</option>
                </select>
                <button
                   onClick={handleGenerate}
                   disabled={isGenerating || !prompt}
                   className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                     isGenerating 
                       ? 'bg-gray-700 text-gray-400' 
                       : 'bg-white text-gray-900 hover:bg-gray-200'
                   }`}
                >
                  {isGenerating ? t.image.creating : t.image.generate}
                </button>
             </div>
           </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {generatedImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedImages.map((img, idx) => (
              <div key={idx} className="group relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-xl">
                 <img src={img} alt={`Generated ${idx}`} className="w-full h-auto object-cover" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <a href={img} download={`gemini-image-${Date.now()}.png`} className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold">
                      {t.image.download}
                    </a>
                 </div>
              </div>
            ))}
          </div>
        )}
        
        {!isGenerating && generatedImages.length === 0 && !error && (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 pointer-events-none">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-square bg-gray-800/50 rounded-xl border border-gray-700/50 flex items-center justify-center">
                   <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default ImageInterface;
