
import React from 'react';
import { Map as MapIcon } from 'lucide-react';

interface WeatherRadarProps {
  lat: number;
  lon: number;
  cityName: string;
}

const WeatherRadar: React.FC<WeatherRadarProps> = ({ lat, lon, cityName }) => {
  const radarUrl = `https://www.rainviewer.com/map.html?loc=${lat},${lon},7&oFa=0&oFC=0&oU=0&oCS=1&oF=0&oAP=1&c=3&o=83&lm=1&layer=radar&sm=1&sn=1&l=1&lng=en&d=1&h=1`;
  return (
    <div className="bg-slate-900/50 rounded-[2.5rem] p-8 border border-white/5 h-[500px] flex flex-col">
      <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6"><MapIcon className="w-4 h-4" /> Live Weather Radar</h3>
      <div className="flex-grow rounded-3xl overflow-hidden border border-white/5">
        <iframe key={cityName} src={radarUrl} width="100%" height="100%" frameBorder="0" allowFullScreen title={`Radar ${cityName}`}></iframe>
      </div>
    </div>
  );
};

export default React.memo(WeatherRadar);
