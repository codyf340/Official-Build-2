
import React from 'react';
import { Moon, Sunrise, Sunset, Clock, Sparkles } from 'lucide-react';
import { AstroData } from '../types';

const AstroBureau: React.FC<{ data: AstroData }> = ({ data }) => {
  return (
    <div className="glass-panel rounded-[2.5rem] p-8 border border-white/5 space-y-8 h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Astro-Temporal Bureau</h3>
          </div>
          <h4 className="text-xl font-extrabold text-white">Lunar & Solar Cycles</h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="glass-card rounded-3xl p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 mb-3">
            <Sunrise className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sunrise</p>
          <p className="text-xl font-black text-white">{data.sunrise}</p>
        </div>
        <div className="glass-card rounded-3xl p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-3">
            <Sunset className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sunset</p>
          <p className="text-xl font-black text-white">{data.sunset}</p>
        </div>
      </div>

      <div className="p-6 rounded-[2rem] bg-indigo-950/20 border border-indigo-500/20 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-indigo-300" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Lunar Phase</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-[9px] font-black text-indigo-400 border border-indigo-500/20 uppercase">
            {data.moonIllumination}% Illum
          </span>
        </div>
        
        <div className="flex items-center justify-center mb-6">
           <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-indigo-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <div 
                className="absolute inset-0 bg-indigo-100 transition-all duration-1000"
                style={{ 
                  left: `${100 - data.moonIllumination}%`,
                  borderRadius: '100%' 
                }}
              ></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,0,0,0.1)_0%,transparent_50%)] pointer-events-none"></div>
           </div>
        </div>
        <p className="text-center text-lg font-black text-white uppercase tracking-tight mb-2">{data.moonPhase}</p>
      </div>

      <div className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 relative z-10">
        <Clock className="w-5 h-5 text-slate-500" />
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Daylight Duration</p>
          <p className="text-sm font-bold text-slate-200">{data.dayLength}</p>
        </div>
      </div>
    </div>
  );
};

export default AstroBureau;
