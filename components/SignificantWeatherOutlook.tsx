
import React from 'react';
import { SignificantWeatherEvent } from '../types';
import { ShieldCheck, CloudLightning, AlertTriangle, CloudSun } from 'lucide-react';

interface SignificantWeatherOutlookProps {
  events: SignificantWeatherEvent[];
}

const SignificantWeatherOutlook: React.FC<SignificantWeatherOutlookProps> = ({ events }) => {
  const displayEvents = (events && events.length > 0) 
    ? events.slice(0, 5) 
    : Array.from({ length: 5 }).map((_, i) => ({ 
        day: `Day ${i + 1}`, 
        severity: 'None' as 'None', 
        description: 'Awaiting data...' 
      }));

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5 h-full">
      <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6"><CloudSun className="w-4 h-4" /> 5-Day Outlook</h3>
      <div className="space-y-3">
        {displayEvents.map((event, idx) => (
          <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
            {event.severity === 'High' ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            <div className="flex-1"><p className="font-bold text-xs text-slate-200">{event.day}</p></div>
            <p className="text-xs font-semibold text-slate-400">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignificantWeatherOutlook;
