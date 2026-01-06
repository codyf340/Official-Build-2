
import React from 'react';
import { WeatherAlert } from '../types';
import { AlertTriangle, CloudSnow, Wind, CloudRain, Thermometer, CloudLightning, ShieldAlert, ExternalLink, ShieldCheck } from 'lucide-react';

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
  }

  if (severity === 'extreme' || severity === 'severe') {
    badgeColor = 'bg-red-600 text-white animate-pulse';
    borderColor = 'border-red-600/50';
    glowStyle = 'alert-glow-red shadow-[0_0_40px_rgba(239,68,68,0.4)]';
    iconColor = 'text-red-500';
    if (severity === 'extreme') icon = <ShieldAlert className="w-8 h-8" />;
  }

  return { icon, glowStyle, borderColor, badgeColor, iconColor };
};

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const config = getAlertConfig(alert);
  const isTWN = alert.sourceUrl?.includes('theweathernetwork.com');
  const isOfficial = alert.sourceUrl?.includes('weather.gc.ca');

  return (
    <div className={`glass-panel p-6 rounded-[2.5rem] border ${config.borderColor} ${config.glowStyle} relative overflow-hidden group transition-all duration-500`}>
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <AlertTriangle className="w-32 h-32" />
      </div>
      
      <div className="flex flex-col sm:flex-row items-start gap-8 relative z-10">
        <div className={`p-5 rounded-3xl bg-white/5 flex-shrink-0 ${config.iconColor} shadow-inner`}>
          {config.icon}
        </div>
        
        <div className="flex-grow space-y-4">
          <div className="flex items-center flex-wrap gap-4">
            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${config.badgeColor} shadow-lg`}>
              {alert.severity}
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10">
               <ShieldCheck className="w-3 h-3 text-emerald-500" />
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Source: {isOfficial ? 'Environment Canada (Official)' : 'Bureau Network Advisory'}
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="text-2xl font-black text-white tracking-tight mb-2">{alert.title}</h4>
            <p className="text-xs leading-relaxed font-medium text-slate-400 max-w-2xl">{alert.description}</p>
          </div>

          {alert.sourceUrl && (
            <a 
              href={alert.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-all pt-2"
            >
              Verify on {isOfficial ? 'Weather.gc.ca' : 'Weather Network'} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
