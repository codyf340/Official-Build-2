
import React, { useMemo } from 'react';
import { MinuteCastEntry } from '../types';

const PrecipitationGraph: React.FC<{ data: MinuteCastEntry[] }> = ({ data }) => {
  const chartData = useMemo(() => data?.slice(0, 60) || Array.from({ length: 60 }, () => ({ intensity: 0, type: 'none' })), [data]);
  const getColor = (type: string, intensity: number) => {
    if (intensity === 0) return 'transparent';
    if (type === 'snow') return '#60a5fa';
    if (type === 'rain') return '#fbbf24';
    return '#818cf8';
  };

  return (
    <div className="h-32 flex items-end gap-0.5 border-b border-white/10 pt-4">
      {chartData.map((entry, idx) => (
        <div key={idx} className="flex-1 group relative h-full flex flex-col justify-end">
          <div className="w-full rounded-t transition-all duration-500" style={{ height: `${entry.intensity * 100}%`, backgroundColor: getColor(entry.type, entry.intensity) }}></div>
          {idx % 15 === 0 && <span className="absolute -bottom-6 left-0 text-[8px] font-black text-slate-600 uppercase">+{idx}m</span>}
        </div>
      ))}
    </div>
  );
};

export default PrecipitationGraph;
