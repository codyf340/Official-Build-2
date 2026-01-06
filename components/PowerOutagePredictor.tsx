
import React from 'react';
import { ZapOff } from 'lucide-react';

interface PowerOutagePredictorProps {
  probability: number;
  reasoning: string;
}

const PowerOutagePredictor: React.FC<PowerOutagePredictorProps> = ({ probability, reasoning }) => {
  const getCircleColor = (p: number) => {
    if (p > 60) return '#f87171';
    if (p > 30) return '#facc15';
    return '#34d399';
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (probability / 100) * circumference;

  return (
    <div className={`p-6 rounded-2xl border glass-panel transition-all duration-500`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><ZapOff className="w-5 h-5 text-amber-500" />Power Outage Risk</h3>
          <p className="text-sm text-slate-400">Grid stability forecast</p>
        </div>
        <div className="relative flex items-center justify-center">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle cx="40" cy="40" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
            <circle cx="40" cy="40" r={radius} stroke={getCircleColor(probability)} strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
          </svg>
          <span className="absolute text-lg font-bold">{probability}%</span>
        </div>
      </div>
      <p className="text-sm leading-relaxed font-medium text-slate-300">{reasoning || "Grid conditions appear stable."}</p>
    </div>
  );
};

export default PowerOutagePredictor;
