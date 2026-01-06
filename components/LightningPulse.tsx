
import React from 'react';
import { CloudLightning, Zap, Sparkles } from 'lucide-react';
import { LightningPulse as LightningPulseType } from '../types';

const LightningPulse: React.FC<{ data: LightningPulseType }> = ({ data }) => {
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Moderate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className={`glass-panel rounded-[2.5rem] p-8 border border-white/5 h-full flex flex-col justify-between group overflow-hidden relative`}>
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.03]">
         <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 blur-[100px]"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CloudLightning className="w-4 h-4 text-slate-500" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Storm Pulse Network</h3>
            </div>
            <h4 className="text-xl font-extrabold text-white tracking-tight">Lightning Tracker</h4>
          </div>
          <div className="px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 flex items-center gap-2">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Spring 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 opacity-40 grayscale">
           <div className="glass-card p-5 rounded-3xl text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Strike Distance</p>
              <p className="text-xl font-black text-white">-- km</p>
           </div>
           <div className={`p-5 rounded-3xl text-center border bg-white/5 border-white/5`}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Energy Class</p>
              <p className="text-xl font-black text-slate-500">Standby</p>
           </div>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="p-5 rounded-2xl bg-black/30 border border-white/5 flex items-start gap-3">
          <Zap className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-600" />
          <p className="text-xs leading-relaxed font-medium text-slate-400 italic">
            "Hardware synchronization for convective discharge tracking scheduled for Spring 2026 deployment."
          </p>
        </div>
      </div>
    </div>
  );
};

export default LightningPulse;
