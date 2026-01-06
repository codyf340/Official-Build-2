
import React from 'react';
import { Wind, ShieldCheck, Eye, Sun } from 'lucide-react';
import { AtmosphericDetails } from '../types';

const AtmosphericHealth: React.FC<{ details: AtmosphericDetails }> = ({ details }) => {
  const getUVColor = (index: number) => {
    if (index >= 8) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (index >= 6) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (index >= 3) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  const getAQIColor = (aqi: number) => {
    if (aqi > 100) return 'text-red-500';
    if (aqi > 50) return 'text-yellow-500';
    return 'text-emerald-500';
  };

  return (
    <div className="glass-panel rounded-[2.5rem] p-8 border border-white/5 space-y-8 h-full">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Health & Biosphere</h3>
          </div>
          <h4 className="text-xl font-extrabold text-white">Atmospheric Bureau</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className={`p-5 rounded-3xl border transition-all ${getUVColor(details.uvIndex)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">UV Exposure</span>
            </div>
            <span className="text-2xl font-black">{details.uvIndex}</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-tight opacity-80">{details.uvDescription}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wind className="w-5 h-5 text-sky-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Air Quality Index</span>
            </div>
            <span className={`text-xl font-black ${getAQIColor(details.airQuality)}`}>{details.airQuality} AQI</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500" 
              style={{ width: `${Math.min(100, details.airQuality)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{details.airQualityDescription}</p>
        </div>

        <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Visibility</p>
              <p className="text-lg font-black text-white">{details.visibility}</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pressure</p>
             <p className="text-xs font-bold text-slate-300">{details.pressure}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtmosphericHealth;
