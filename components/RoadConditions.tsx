
import React from 'react';
import { Car, AlertTriangle, CheckCircle2, Eye, Wind, Droplets, Info } from 'lucide-react';
import { RoadConditions as RoadConditionsType } from '../types';

const RoadConditions: React.FC<RoadConditionsType> = ({ status, summary }) => {
  const getConditionConfig = (s: string) => {
    const statusLower = s.toLowerCase();
    if (statusLower.includes('good')) return { 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/30', 
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      icon: <CheckCircle2 className="w-8 h-8" />,
    };
    if (statusLower.includes('fair')) return { 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/30', 
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      icon: <AlertTriangle className="w-8 h-8" />,
    };
    if (statusLower.includes('poor') || statusLower.includes('danger') || statusLower.includes('closed')) return { 
      color: 'text-red-400', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/30', 
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      icon: <AlertTriangle className="w-8 h-8 animate-pulse" />,
    };
    return { 
      color: 'text-slate-400', 
      bg: 'bg-slate-900/40', 
      border: 'border-white/5', 
      glow: '',
      icon: <Car className="w-8 h-8" />,
    };
  };

  const config = getConditionConfig(status || 'Unknown');
  const summaryLower = (summary || "").toLowerCase();

  const hazards = [
    { label: 'Visibility', active: summaryLower.includes('fog') || summaryLower.includes('snow') || summaryLower.includes('limited'), icon: <Eye className="w-3.5 h-3.5" /> },
    { label: 'Traction', active: summaryLower.includes('ice') || summaryLower.includes('slippery') || summaryLower.includes('snow'), icon: <Wind className="w-3.5 h-3.5" /> },
    { label: 'Hydroplaning', active: summaryLower.includes('rain') || summaryLower.includes('slush') || summaryLower.includes('wet'), icon: <Droplets className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className={`p-8 rounded-[2.5rem] border ${config.bg} ${config.border} ${config.glow} transition-all duration-700 glass-card flex flex-col justify-between group`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Car className={`w-4 h-4 ${config.color}`} />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Travel Advisory</h3>
            </div>
            <h4 className="text-xl font-extrabold text-white tracking-tight">Road Conditions</h4>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NB-511 Feed</span>
          </div>
        </div>

        <div className="flex items-center gap-6 p-4 rounded-2xl bg-black/20 border border-white/5">
          <div className={`${config.color} p-1`}>
            {config.icon}
          </div>
          <div>
            <p className={`text-2xl font-black uppercase tracking-tight ${config.color}`}>{status}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Zone Status Rating</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {hazards.map((hazard) => (
            <div key={hazard.label} className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${hazard.active ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/5 text-slate-600'}`}>
              {hazard.icon}
              <span className="text-[8px] font-black uppercase tracking-widest mt-2">{hazard.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 relative">
        <div className="absolute -top-3 left-3 px-2 bg-slate-950 text-[8px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Summary</div>
        <div className="p-5 rounded-2xl bg-black/30 border border-white/5 min-h-[80px] flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs leading-relaxed font-medium text-slate-300 italic">
            {summary || "Syncing with regional transportation sensors for real-time travel telemetry..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoadConditions;
