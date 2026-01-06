import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchWeatherForCity, isCurrentlyRateLimited, getRateLimitResetTime } from './services/geminiService';
import { CityWeatherData, CityKey, AppID } from './types';
import WeatherIcon from './components/WeatherIcon';
import HourlyForecast from './components/HourlyForecast';
import GlobalAlertStatus from './components/GlobalAlertStatus';
import WeatherRadar from './components/WeatherRadar';
import CountdownTimer from './components/CountdownTimer';
import AlertCard from './components/AlertCard';
import LiveAlertTicker from './components/LiveAlertTicker';

// Analytical Components
import SnowDayPredictor from './components/SnowDayPredictor';
import PowerOutagePredictor from './components/PowerOutagePredictor';
import RoadConditions from './components/RoadConditions';
import SignificantWeatherOutlook from './components/SignificantWeatherOutlook';
import OutlookSummary from './components/OutlookSummary';
import AtmosphericHealth from './components/AtmosphericHealth';
import AstroBureau from './components/AstroBureau';
import LightningPulse from './components/LightningPulse';
import NextHourOutlook from './components/NextHourOutlook';

import { 
  MapPin, Activity, Calendar,
  LayoutDashboard, CarFront, Moon, Radio, RefreshCw,
  AlertTriangle, ShieldAlert, ExternalLink
} from 'lucide-react';

const cities: CityKey[] = ['Fredericton', 'Moncton', 'McGivney'];
const launchDate = '2026-01-07T09:00:00-04:00';

const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityKey>(cities[0]);
  const [activeApp, setActiveApp] = useState<AppID>('dashboard');
  const [weatherData, setWeatherData] = useState<Record<CityKey, CityWeatherData | null>>({ 
    Fredericton: null, Moncton: null, McGivney: null 
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [globalStatus, setGlobalStatus] = useState<{ status: 'idle' | 'checking' | 'success' | 'error', lastChecked: string | null }>({ 
    status: 'idle', lastChecked: null 
  });
  const [countdown, setCountdown] = useState<number | null>(null);

  const loadData = useCallback(async (city: CityKey, isManual: boolean = false) => {
    if (isManual) setRefreshing(true);
    else if (!weatherData[city]) setLoading(true);
    
    setGlobalStatus(prev => ({ ...prev, status: 'checking' }));
    
    try {
      const data = await fetchWeatherForCity(city, isManual);
      setWeatherData(prev => ({ ...prev, [city]: data }));
      setGlobalStatus({ status: 'success', lastChecked: new Date().toLocaleTimeString() });
    } catch (err) {
      setGlobalStatus({ status: 'error', lastChecked: null });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [weatherData]);

  useEffect(() => { 
    loadData(selectedCity); 
  }, [selectedCity]);

  useEffect(() => {
    let timer: any;
    if (isCurrentlyRateLimited()) {
      const resetTime = getRateLimitResetTime();
      timer = setInterval(() => {
        const rem = Math.max(0, Math.round((resetTime - Date.now()) / 1000));
        setCountdown(rem);
        if (rem <= 0) {
          clearInterval(timer);
          setCountdown(null);
        }
      }, 1000);
    } else {
      setCountdown(null);
    }
    return () => clearInterval(timer);
  }, [weatherData]);

  const currentData = weatherData[selectedCity];
  
  const activeWarnings = useMemo(() => {
    if (!currentData?.alerts) return [];
    return currentData.alerts.filter(alert => 
      ['Extreme', 'Severe', 'Moderate', 'Minor'].includes(alert.severity)
    );
  }, [currentData]);

  const isCurrentlyNight = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 6;
  }, []);

  const NavItem = ({ id, icon: Icon, label }: { id: AppID, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveApp(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
        activeApp === id 
        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:block">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-[100] bg-slate-950/95 backdrop-blur-md border-b border-white/5">
        <div className="bg-red-600 text-white py-1.5 px-4 text-center text-[9px] font-black tracking-[0.25em] uppercase flex items-center justify-center gap-2">
          <Radio className="w-3 h-3 animate-pulse" /> BETA PREVIEW - ACTIVE NODE
        </div>
        <CountdownTimer targetDate={launchDate} />
        
        <div className="py-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4">
            <div className="w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center font-black text-white italic text-xl shadow-xl shadow-red-600/20">BC</div>
                <div className="hidden xs:block">
                  <h1 className="text-base font-extrabold text-white leading-none tracking-tight uppercase italic">Bureau Hub</h1>
                  <p className="text-[9px] font-bold text-red-500 tracking-widest uppercase mt-1">Version 3.0</p>
                </div>
              </div>

              <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                {cities.map((city) => (
                  <button 
                    key={city} 
                    onClick={() => setSelectedCity(city)} 
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedCity === city 
                      ? 'bg-white text-slate-950 shadow-md scale-105' 
                      : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => loadData(selectedCity, true)} 
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex justify-center bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 max-w-fit mx-auto backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem id="transit" icon={CarFront} label="Transit Safe" />
                <NavItem id="astro" icon={Moon} label="Celestial" />
                <NavItem id="radar" icon={Activity} label="Live Scan" />
              </div>
            </div>
          </div>
        </div>
        <GlobalAlertStatus status={globalStatus.status} lastChecked={globalStatus.lastChecked} />
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8 min-h-[60vh]">
        {countdown !== null && (
          <div className="p-5 rounded-3xl border bg-amber-500/10 border-amber-500/30 text-amber-200 animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-500/20 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-tight">Intelligence Uplink Cooling</h3>
                    <p className="text-[11px] font-medium opacity-70">Primary node at capacity. Auto-recovering...</p>
                  </div>
                </div>
                <div className="text-right px-4 border-l border-white/10">
                  <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest mb-1">Reconnect</p>
                  <p className="text-base font-black text-white font-mono">{countdown}s</p>
                </div>
             </div>
          </div>
        )}

        {loading && !currentData ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing regional nodes...</p>
          </div>
        ) : currentData ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
            <LiveAlertTicker alerts={activeWarnings} lastUpdated={currentData.lastUpdated} />
            
            {activeApp === 'dashboard' && (
              <div className="space-y-10">
                {currentData.alerts.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Meteorological Bulletins</h3>
                    </div>
                    <div className="grid gap-6">
                      {currentData.alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-panel rounded-[3rem] p-10 relative group">
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-red-600/10 rounded-full blur-[120px]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="text-center md:text-left space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <MapPin className="w-3 h-3 text-red-500" /> {currentData.cityName}, NB
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="text-8xl font-black text-white tracking-tighter leading-none">{currentData.currentTemp}</span>
                          <span className="text-4xl font-black text-red-500 mt-2">°</span>
                        </div>
                        <p className="text-xl font-semibold text-slate-400 italic">RealFeel® {currentData.feelsLike}°</p>
                      </div>
                      <div className="flex flex-col items-center md:items-end gap-8">
                        <WeatherIcon 
                          condition={currentData.condition} 
                          className="w-32 h-32 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
                          isNight={isCurrentlyNight} 
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="glass-card p-4 rounded-2xl text-center min-w-[110px]">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Wind</p>
                            <p className="text-base font-black text-white">{currentData.windSpeed} <span className="text-[10px] opacity-50">KM/H</span></p>
                          </div>
                          <div className="glass-card p-4 rounded-2xl text-center min-w-[110px]">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Humidity</p>
                            <p className="text-base font-black text-white">{currentData.humidity}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <OutlookSummary outlooks={currentData.periodOutlooks} />
                    <div className="glass-panel rounded-[2.5rem] p-8 border border-white/5 bg-gradient-to-br from-slate-900 to-slate-950">
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diurnal High</p>
                             <p className="text-2xl font-black text-white">{currentData.high}°</p>
                           </div>
                           <div className="h-px bg-white/5"></div>
                           <div className="flex items-center justify-between">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diurnal Low</p>
                             <p className="text-2xl font-black text-white">{currentData.low}°</p>
                           </div>
                        </div>
                    </div>
                  </div>
                </div>

                {currentData.minuteCast && (
                  <div className="animate-in zoom-in-95 duration-500">
                    <NextHourOutlook 
                      data={currentData.minuteCast} 
                      currentTemp={currentData.currentTemp} 
                      feelsLike={currentData.feelsLike} 
                      currentCondition={currentData.condition} 
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <SnowDayPredictor probability={currentData.snowDayProbability} reasoning={currentData.snowDayReasoning} />
                   <PowerOutagePredictor probability={currentData.powerOutageProbability} reasoning={currentData.powerOutageReasoning} />
                   <RoadConditions status={currentData.roadConditions.status} summary={currentData.roadConditions.summary} />
                </div>
                
                <HourlyForecast data={currentData.hourly} />
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-3 glass-panel rounded-[3rem] p-10">
                    <h3 className="flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-8">
                      <Calendar className="w-4 h-4" /> 7-Day sequence
                    </h3>
                    <div className="space-y-2">
                      {currentData.daily.map((day, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] transition-all group">
                          <div className="w-32 text-sm font-bold text-slate-200">{day.day}</div>
                          <div className="flex-1 flex items-center gap-4">
                            <WeatherIcon condition={day.condition} className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                            <span className="text-[11px] font-black text-slate-500 uppercase hidden md:block group-hover:text-slate-300">{day.condition}</span>
                          </div>
                          <div className="w-24 text-right flex gap-4 justify-end text-sm">
                            <span className="font-black text-white">{day.high}°</span>
                            <span className="text-slate-600 font-bold">{day.low}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2"><SignificantWeatherOutlook events={currentData.significantWeather} /></div>
                </div>
              </div>
            )}

            {activeApp === 'transit' && (
              <div className="space-y-8 animate-in slide-in-from-right-6 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <SnowDayPredictor probability={currentData.snowDayProbability} reasoning={currentData.snowDayReasoning} />
                   <PowerOutagePredictor probability={currentData.powerOutageProbability} reasoning={currentData.powerOutageReasoning} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2"><RoadConditions status={currentData.roadConditions.status} summary={currentData.roadConditions.summary} /></div>
                   <div><LightningPulse data={currentData.lightning} /></div>
                </div>
              </div>
            )}

            {activeApp === 'astro' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in slide-in-from-right-6 duration-500">
                 <div className="lg:col-span-3"><AtmosphericHealth details={currentData.atmosphericDetails} /></div>
                 <div className="lg:col-span-2"><AstroBureau data={currentData.astro} /></div>
              </div>
            )}

            {activeApp === 'radar' && (
              <div className="animate-in slide-in-from-right-6 duration-500">
                 <WeatherRadar 
                  lat={currentData.cityName === 'Fredericton' ? 45.96 : currentData.cityName === 'Moncton' ? 46.08 : 46.25} 
                  lon={currentData.cityName === 'Fredericton' ? -66.64 : currentData.cityName === 'Moncton' ? -64.77 : -66.31} 
                  cityName={selectedCity} 
                />
              </div>
            )}
            
          </div>
        ) : null}
      </main>

      <footer className="mt-20 py-12 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          {currentData?.sources && currentData.sources.length > 0 && (
            <div className="w-full space-y-6">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] text-center">Verified Data Sources</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentData.sources.map((source, idx) => (
                  <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/[0.08] rounded-[1.5rem] border border-white/5 transition-all group">
                    <span className="text-[10px] font-bold text-slate-400 truncate pr-4">{source.title}</span>
                    <ExternalLink className="w-4 h-4 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-6 opacity-40">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] italic">Big Coco's Bureau • Official Hub • © 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;