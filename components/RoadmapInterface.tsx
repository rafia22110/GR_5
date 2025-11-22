import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const RoadmapInterface: React.FC = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="h-full bg-gemini-bg text-gray-200 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-12">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-start">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            {t.roadmap.title}
          </h2>
          <p className="text-gray-400 mt-3 text-lg max-w-2xl">
            {t.roadmap.subtitle}
          </p>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
              <span className="text-gray-300">{t.roadmap.legend.completed}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-gray-500 border-dashed"></div>
              <span className="text-gray-400">{t.roadmap.legend.planned}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className={`absolute top-0 bottom-0 w-px bg-gradient-to-b from-green-500 via-gray-700 to-gray-800 ${dir === 'rtl' ? 'right-[22px]' : 'left-[22px]'}`}></div>

          <div className="space-y-12">
            {(t.roadmap.phases as any[]).map((phase, index) => {
              const isCompleted = phase.status === 'completed';
              
              return (
                <div key={phase.id} className="relative flex gap-8 group">
                  
                  {/* Status Indicator */}
                  <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-gray-900 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                      : 'bg-gray-900 border-gray-700 border-dashed grayscale opacity-60'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="text-gray-500 font-mono font-bold">{phase.id}</span>
                    )}
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 bg-gemini-surface border transition-all duration-300 rounded-2xl p-6 ${
                    isCompleted 
                      ? 'border-gray-700 hover:border-gray-500 hover:shadow-lg' 
                      : 'border-gray-800 opacity-70'
                  }`}>
                    <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                      {phase.title}
                      {isCompleted && <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded border border-green-500/30">{t.roadmap.legend.completed}</span>}
                      {!isCompleted && <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded border border-gray-700">{t.roadmap.legend.planned}</span>}
                    </h3>
                    
                    <ul className="space-y-3">
                      {phase.items.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          {isCompleted ? (
                             <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          ) : (
                             <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                          <span className={`${isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Bottom Fade */}
          <div className="h-24 mt-8 bg-gradient-to-t from-gemini-bg to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapInterface;