
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
const CACHE_TTL = 30 * 60 * 1000;

// Fix: Explicitly imported React and used React.FC type definition to resolve the "Cannot find namespace 'React'" error.
const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityKey>(cities[0]);
  const [activeApp, setActiveApp] = useState<AppID>('dashboard');
  const [weatherData, setWeatherData] = useState<Record<CityKey, CityWeatherData | null>>({ Fredericton: null, Moncton: null, McGivney: null });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [globalStatus, setGlobalStatus] = useState<{ status: 'idle' | 'checking' | 'success' | 'error', lastChecked: string | null }>({ status: 'idle', lastChecked: null });
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const launchDate = '2026-01-07T09:00:00-04:00';

  const loadData = useCallback(async (city: CityKey, isManual: boolean = false) => {
    const cached = localStorage.getItem(`weather_cache_${city}`);
    if (!isManual && cached) {
      const parsed = JSON.parse(cached);
      const age = Date.now() - (parsed.cacheTimestamp || 0);
      if (age < CACHE_TTL) {
        setWeatherData(prev => ({ ...prev, [city]: parsed }));
        setLoading(false);
        return;
      }
    }

    if (isManual) setRefreshing(true);
    else if (!weatherData[city]) setLoading(true);
    
    setGlobalStatus(prev => ({ ...prev, status: 'checking' }));
    
    try {
      const data = await fetchWeatherForCity(city, isManual);
      const dataToSave = { ...data, cacheTimestamp: Date.now() };
      setWeatherData(prev => ({ ...prev, [city]: dataToSave }));
      localStorage.setItem(`weather_cache_${city}`, JSON.stringify(dataToSave));
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
  }, [selectedCity, loadData]);

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
    // FIX: Include Moderate and Minor severities to allow Special Weather Statements in the ticker
    return currentData.alerts.filter(alert => 
      ['Extreme', 'Severe', 'Moderate', 'Minor'].includes(alert.severity)
    );
  }, [currentData]);

  const priorityAlerts = useMemo(() => {
    if (!currentData?.alerts) return [];
    return currentData.alerts.filter(alert => alert.severity === 'Extreme' || alert.severity === 'Severe');
  }, [currentData]);

  const currentHour = new Date().getHours();
  const isCurrentlyNight = currentHour >= 19 || currentHour < 6;

  const NavItem = ({ id, icon: Icon, label }: { id: AppID, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveApp(id)}
      className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${activeApp === id ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:block">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-10 selection:bg-red-500/30">
      <header className="sticky top-0 z-[100] bg-slate-950/95 backdrop-blur-md shadow-xl">
        <div className="bg-red-600 text-white py-1 px-4 text-center text-[8px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2"><Radio className="w-2.5 h-2.5" /> BETA PREVIEW - MODE</div>
        <CountdownTimer targetDate={launchDate} />
        
        <div className="border-b border-white/5 py-2">
          <div className="max-w-7xl mx-auto px-4 flex flex-col gap-3">
            <div className="w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-white italic text-lg shadow-lg">BC</div>
                <div className="hidden xs:block">
                  <h1 className="text-sm font-extrabold text-white leading-none tracking-tight uppercase italic">Bureau Hub</h1>
                  <p className="text-[8px] font-bold text-red-500 tracking-widest uppercase mt-0.5">v3.0</p>
                </div>
              </div>

              <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                {cities.map((city) => (
                  <button key={city} onClick={() => setSelectedCity(city)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedCity === city ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-white'}`}>{city}</button>
                ))}
              </div>

              <button onClick={() => loadData(selectedCity, true)} className="p-2 rounded-xl bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-all group">
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex justify-center bg-slate-800/40 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full w-full md:w-auto mx-auto">
              <div className="flex items-center justify-center">
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

      <main className="max-w-7xl mx-auto px-4 mt-6 space-y-8 min-h-[60vh]">
        {countdown !== null && (
          <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-500/30 text-amber-200 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-tight">AI Link Standby</h3>
                    <p className="text-[10px] font-medium opacity-80">Primary uplink quota cooling down. Backup active.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase text-amber-500 tracking-widest">Resuming in</p>
                  <p className="text-sm font-black text-white">{countdown}s</p>
                </div>
             </div>
          </div>
        )}

        {loading && !currentData ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing...</p>
          </div>
        ) : currentData ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <LiveAlertTicker alerts={activeWarnings} lastUpdated={currentData.lastUpdated} />
            
            {activeApp === 'dashboard' && (
              <div className="space-y-8">
                {/* Display priority or special statement cards */}
                {currentData.alerts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Meteorological Bulletins</h3>
                    </div>
                    <div className="grid gap-4">
                      {currentData.alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass-panel rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between h-full">
                      <div className="text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest"><MapPin className="w-2.5 h-2.5 text-red-500" /> {currentData.cityName}, NB</div>
                        <div className="text-7xl font-black text-white tracking-tighter">{currentData.currentTemp}°</div>
                        <p className="text-lg font-medium text-slate-400">RealFeel® {currentData.feelsLike}°</p>
                      </div>
                      <div className="mt-6 md:mt-0 flex flex-col items-center md:items-end gap-6 h-full justify-between">
                        <WeatherIcon condition={currentData.condition} className="w-24 h-24 text-white drop-shadow-2xl" isNight={isCurrentlyNight} />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="glass-card p-3 rounded-2xl text-center min-w-[90px]"><p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">Wind</p><p className="text-sm font-black text-white">{currentData.windSpeed} km/h</p></div>
                          <div className="glass-card p-3 rounded-2xl text-center min-w-[90px]"><p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">Humidity</p><p className="text-sm font-black text-white">{currentData.humidity}%</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <OutlookSummary outlooks={currentData.periodOutlooks} />
                    <div className="glass-panel rounded-[2rem] p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between"><p className="text-[9px] font-bold text-slate-400 uppercase">High</p><p className="text-xl font-black text-white">{currentData.high}°</p></div>
                           <div className="h-px bg-white/5 w-full"></div>
                           <div className="flex items-center justify-between"><p className="text-[9px] font-bold text-slate-400 uppercase">Low</p><p className="text-xl font-black text-white">{currentData.low}°</p></div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <SnowDayPredictor probability={currentData.snowDayProbability} reasoning={currentData.snowDayReasoning} />
                   <PowerOutagePredictor probability={currentData.powerOutageProbability} reasoning={currentData.powerOutageReasoning} />
                   <RoadConditions status={currentData.roadConditions.status} summary={currentData.roadConditions.summary} />
                </div>
                <HourlyForecast data={currentData.hourly} />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3 glass-panel rounded-[2rem] p-6">
                    <h3 className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6"><Calendar className="w-3.5 h-3.5" /> 7-Day sequence</h3>
                    <div className="space-y-1">
                      {currentData.daily.map((day, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                          <div className="w-24 text-xs font-bold text-slate-200">{day.day}</div>
                          <div className="flex-1 flex items-center gap-3"><WeatherIcon condition={day.condition} className="w-5 h-5 text-slate-400 group-hover:text-white" /><span className="text-[10px] font-bold text-slate-500 uppercase hidden md:block">{day.condition}</span></div>
                          <div className="w-20 text-right flex gap-3 justify-end text-xs"><span className="font-bold text-white">{day.high}°</span><span className="text-slate-600">{day.low}°</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2"><SignificantWeatherOutlook events={currentData.significantWeather} /></div>
                </div>
              </div>
            )}

            {activeApp === 'transit' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <SnowDayPredictor probability={currentData.snowDayProbability} reasoning={currentData.snowDayReasoning} />
                   <PowerOutagePredictor probability={currentData.powerOutageProbability} reasoning={currentData.powerOutageReasoning} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2"><RoadConditions status={currentData.roadConditions.status} summary={currentData.roadConditions.summary} /></div>
                   <div><LightningPulse data={currentData.lightning} /></div>
                </div>
              </div>
            )}

            {activeApp === 'astro' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in slide-in-from-right-4 duration-500">
                 <div className="lg:col-span-3"><AtmosphericHealth details={currentData.atmosphericDetails} /></div>
                 <div className="lg:col-span-2"><AstroBureau data={currentData.astro} /></div>
              </div>
            )}

            {activeApp === 'radar' && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                 <WeatherRadar lat={currentData.cityName === 'Fredericton' ? 45.96 : currentData.cityName === 'Moncton' ? 46.08 : 46.25} lon={currentData.cityName === 'Fredericton' ? -66.64 : currentData.cityName === 'Moncton' ? -64.77 : -66.31} cityName={selectedCity} />
              </div>
            )}
            
          </div>
        ) : null}
      </main>

      <footer className="mt-16 py-8 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {currentData?.sources && currentData.sources.length > 0 && (
            <div className="w-full space-y-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Verified Data Sources</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentData.sources.map((source, idx) => (
                  <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                    <span className="text-[9px] font-bold text-slate-400 truncate pr-2">{source.title}</span>
                    <ExternalLink className="w-3 h-3 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-4"><p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">Big Coco's Bureau • Official Hub • © 2026</p></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
