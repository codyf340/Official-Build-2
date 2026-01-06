
import React from 'react';
import { WeatherAlert } from '../types';
import { Radio, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface LiveAlertTickerProps {
  alerts: WeatherAlert[];
  lastUpdated: string;
}

const LiveAlertTicker: React.FC<LiveAlertTickerProps> = ({ alerts, lastUpdated }) => {
  const hasAlerts = alerts && alerts.length > 0;

  if (!hasAlerts) {
    return (
      <div className="mb-8 block bg-gradient-to-r from-emerald-900/80 to-slate-900 rounded-2xl border border-emerald-500/30 shadow-lg overflow-hidden transition-all">
        <div className="flex items-center">
          <div className="bg-emerald-600 px-4 py-3 self-stretch flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="text-white text-xs font-black uppercase tracking-widest">All Clear</span>
          </div>
          <div className="px-6 py-2">
             <p className="text-sm font-medium text-slate-200">No active warnings.</p>
             <p className="text-[10px] text-slate-400 font-mono">Synced: {lastUpdated}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 block bg-gradient-to-r from-red-900 via-red-800 to-slate-900 rounded-2xl border border-red-500/50 shadow-lg overflow-hidden transition-all">
      <div className="flex items-center">
        <div className="bg-red-600 px-4 py-3 self-stretch flex items-center gap-2">
          <Radio className="w-5 h-5 text-white animate-pulse" />
          <span className="text-white text-xs font-black uppercase tracking-widest">Live Alert</span>
        </div>
        <div className="relative flex-1 overflow-hidden h-12 flex items-center">
            <div className="flex animate-marquee-fast whitespace-nowrap">
                {alerts.map((alert, index) => (
                  <div key={index} className="mx-6 text-sm flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/10 text-[9px] font-black uppercase tracking-tighter text-white">
                      {alert.verified ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <Activity className="w-3 h-3 text-blue-400" />}
                      {alert.verified ? 'EC' : 'BC'}
                    </span>
                    <span className="font-bold text-red-300 uppercase italic">{alert.severity}</span>
                    <span className="text-slate-100 font-semibold">{alert.title}</span>
                    <span className="text-red-500 mx-4 opacity-50">|</span>
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {alerts.map((alert, index) => (
                  <div key={`dup-${index}`} className="mx-6 text-sm flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/10 text-[9px] font-black uppercase tracking-tighter text-white">
                      {alert.verified ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <Activity className="w-3 h-3 text-blue-400" />}
                      {alert.verified ? 'EC' : 'BC'}
                    </span>
                    <span className="font-bold text-red-300 uppercase italic">{alert.severity}</span>
                    <span className="text-slate-100 font-semibold">{alert.title}</span>
                    <span className="text-red-500 mx-4 opacity-50">|</span>
                  </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAlertTicker;
