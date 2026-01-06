
import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Maximize2, Crosshair, Clock } from 'lucide-react';
import { CameraFeed } from '../types';

interface CameraFeedsProps {
  feeds: CameraFeed[];
  cityName: string;
}

const CameraFeeds: React.FC<CameraFeedsProps> = ({ feeds, cityName }) => {
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [selectedFeed, setSelectedFeed] = useState<CameraFeed | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(Date.now());
    }, 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (!feeds || feeds.length === 0) return null;

  const getProxiedUrl = (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}&cb=${refreshKey}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Camera className="w-4 h-4 text-red-500 animate-pulse" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Live Visual Telemetry</h3>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> LIVE</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Sync: 60s</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feeds.map((feed) => (
          <div 
            key={feed.id} 
            className="group relative glass-panel rounded-[2rem] overflow-hidden border-white/5 hover:border-red-500/30 transition-all duration-500 cursor-crosshair"
            onClick={() => setSelectedFeed(feed)}
          >
            {/* Camera Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-md">
                  <p className="text-[8px] font-black text-white uppercase tracking-widest">{feed.title}</p>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <div className="px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-md">
                  <p className="text-[8px] font-mono text-emerald-500 tracking-tighter">
                    {new Date().toLocaleTimeString('en-US', { hour12: false })}
                  </p>
                </div>
              </div>
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,128,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity"></div>
              {/* Target Reticles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <Crosshair className="w-12 h-12 text-red-500/40" strokeWidth={1} />
              </div>
            </div>

            <img 
              src={getProxiedUrl(feed.url)} 
              alt={feed.title}
              className="w-full aspect-video object-cover filter brightness-[0.8] contrast-[1.2] group-hover:scale-105 transition-transform duration-1000"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800'; // Placeholder
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex items-end justify-between">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">{feed.location}</p>
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Overlay */}
      {selectedFeed && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedFeed(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-4"
          >
            <Maximize2 className="w-8 h-8 rotate-45" />
          </button>
          <div className="max-w-6xl w-full relative">
            <div className="absolute -top-12 left-0 space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedFeed.title}</h2>
              <p className="text-xs font-bold text-red-500 uppercase tracking-[0.3em]">Sector: {cityName} Bureau Visual</p>
            </div>
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={getProxiedUrl(selectedFeed.url)}
                alt={selectedFeed.title}
                className="w-full aspect-video object-contain bg-slate-900"
              />
              <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraFeeds;
