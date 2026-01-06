
import React from 'react';
import { WeatherAlert } from '../types';
import { 
  AlertTriangle, CloudSnow, Wind, CloudRain, Thermometer, 
  CloudLightning, ShieldAlert, ExternalLink, ShieldCheck, Activity, Info
} from 'lucide-react';

interface AlertCardProps {
  alert: WeatherAlert;
}

const getAlertConfig = (alert: WeatherAlert) => {
  const severity = (alert.severity || 'Moderate').toLowerCase();
  const type = alert.type || 'General';

  let icon = <AlertTriangle className="w-8 h-8" />;
  let glowStyle = 'alert-glow-amber';
  let borderColor = 'border-amber-500/30';
  let badgeColor = 'bg-amber-500 text-slate-900';
  let iconColor = 'text-amber-400';

  // Type-specific branding
  if (type === 'Thunderstorm') {
    icon = <CloudLightning className="w-8 h-8" />;
    glowStyle = 'shadow-[0_0_30px_rgba(234,179,8,0.3)]';
    iconColor = 'text-yellow-400';
    borderColor = 'border-yellow-500/40';
  } else if (type === 'Snow') {
    icon = <CloudSnow className="w-8 h-8" />;
    glowStyle = 'shadow-[0_0_30px_rgba(255,255,255,0.15)]';
    iconColor = 'text-white';
    borderColor = 'border-white/20';
  } else if (type === 'Cold') {
    icon = <Thermometer className="w-8 h-8" />;
    glowStyle = 'shadow-[0_0_30px_rgba(56,189,248,0.3)]';
    iconColor = 'text-sky-400';
    borderColor = 'border-sky-500/40';
  } else if (type === 'Wind') {
    icon = <Wind className="w-8 h-8" />;
    iconColor = 'text-slate-300';
  } else if (type === 'Rain') {
    icon = <CloudRain className="w-8 h-8" />;
    iconColor = 'text-blue-400';
  }

  // Override by Severity
  if (severity === 'extreme' || severity === 'severe') {
    badgeColor = 'bg-red-600 text-white animate-pulse';
    borderColor = 'border-red-600/50';
    glowStyle = 'alert-glow-red shadow-[0_0_40px_rgba(239,68,68,0.4)]';
    iconColor = 'text-red-500';
    if (severity === 'extreme') icon = <ShieldAlert className="w-8 h-8" />;
  } else if (severity === 'moderate') {
    badgeColor = 'bg-orange-500 text-white';
    borderColor = 'border-orange-500/40';
    glowStyle = 'alert-glow-orange';
    iconColor = 'text-orange-400';
  } else if (severity === 'minor' || alert.title.toLowerCase().includes('statement')) {
    badgeColor = 'bg-sky-600 text-white';
    borderColor = 'border-sky-500/40';
    glowStyle = 'shadow-[0_0_25px_rgba(14,165,233,0.15)]';
    iconColor = 'text-sky-400';
    icon = <Info className="w-8 h-8" />;
  }

  return { icon, glowStyle, borderColor, badgeColor, iconColor };
};

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const config = getAlertConfig(alert);
  const isOfficial = alert.verified;

  return (
    <div className={`glass-panel p-6 rounded-[2.5rem] border ${config.borderColor} ${config.glowStyle} relative overflow-hidden group transition-all duration-500`}>
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <AlertTriangle className="w-32 h-32" />
      </div>
      
      <div className="flex flex-col sm:flex-row items-start gap-8 relative z-10">
        <div className={`p-5 rounded-3xl bg-white/5 flex-shrink-0 ${config.iconColor} shadow-inner border border-white/5`}>
          {config.icon}
        </div>
        
        <div className="flex-grow space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${config.badgeColor} shadow-lg`}>
                {alert.severity}
              </span>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isOfficial ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                 {isOfficial ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Activity className="w-3.5 h-3.5 text-blue-500" />}
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isOfficial ? 'text-emerald-500' : 'text-blue-500'}`}>
                  {isOfficial ? 'Environment Canada' : 'Network Advisory'}
                </span>
              </div>
            </div>
            
            {alert.sourceUrl && (
              <a 
                href={alert.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all group"
              >
                <span>Full Bulletin</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
          
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors uppercase italic">
              {alert.title}
            </h4>
            <div className="p-5 rounded-2xl bg-black/20 border border-white/5">
              <p className="text-sm leading-relaxed font-medium text-slate-300">
                {alert.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
