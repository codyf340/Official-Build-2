
import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeatherForCity, isCurrentlyRateLimited, getRateLimitResetTime } from './services/geminiService';
import { CityWeatherData, CityKey } from './types';
import SnowDayPredictor from './components/SnowDayPredictor';
import PowerOutagePredictor from './components/PowerOutagePredictor';
import RoadConditions from './components/RoadConditions';
import LiveAlertTicker from './components/LiveAlertTicker';
import WeatherIcon from './components/WeatherIcon';
import HourlyForecast from './components/HourlyForecast';
import GlobalAlertStatus from './components/GlobalAlertStatus';
import SignificantWeatherOutlook from './components/SignificantWeatherOutlook';
import WeatherRadar from './components/WeatherRadar';
import NextHourOutlook from './components/NextHourOutlook';
import OutlookSummary from './components/OutlookSummary';
import ComingSoon from './components/ComingSoon';
import CountdownTimer from './components/CountdownTimer';
import AlertCard from './components/AlertCard';

import { 
  AlertTriangle, 
  RefreshCw,
  MapPin,
  RotateCcw,
  Activity,
  Calendar,
  Sparkles,
  X,
  ThermometerSun,
  ThermometerSnowflake,
  Umbrella,
  Database,
  Terminal,
  ExternalLink,
  Radio
} from 'lucide-react';

const cities: CityKey[] = ['Fredericton', 'Moncton', 'McGivney'];

const CITY_COORDINATES: Record<CityKey, { lat: number; lon: number }> = {
  Fredericton: { lat: 45.9636, lon: -66.6431 },
  Moncton: { lat: 46.0878, lon: -64.7782 },
  McGivney: { lat: 46.2501, lon: -66.3154 },
};

// Fix: Full component implementation and export default added to resolve "no default export" error in index.tsx.
const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityKey>(cities[0]);
  const [weatherData, setWeatherData] = useState<Record<CityKey, CityWeatherData | null>>({ Fredericton: null, Moncton: null, McGivney: null });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<{ type: string, message: string } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [globalStatus, setGlobalStatus] = useState<{ status: 'idle' | 'checking' | 'success' | 'error', lastChecked: string | null }>({ status: 'idle', lastChecked: null });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(true);
  
  const launchDate = '2026-01-07T09:00:00-04:00';

  const loadCityData = useCallback(async (city: CityKey, isManual: boolean = false) => {
    if (!isManual && weatherData[city]) {
       setLoading(false);
       return;
    }

    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    setGlobalStatus(prev => ({ ...prev, status: 'checking' }));
    
    try {
      const data = await fetchWeatherForCity(city, isManual);
      setWeatherData(prev => ({ ...prev, [city]: data }));
      setGlobalStatus({ status: 'success', lastChecked: new Date().toLocaleTimeString() });
      
      if (data.aiStatus === 'rate_limited') {
        setError({ type: 'QUOTA_STALE', message: 'Uplink quota reached. Using regional backup telemetry.' });
      } else {
        setError(null);
      }
    } catch (err) {
      setGlobalStatus(prev => ({ ...prev, status: 'error' }));
      setError({ type: 'PROXY', message: 'Atmospheric sensor link interrupted.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [weatherData]);

  useEffect(() => {
    loadCityData(selectedCity, false);
  }, [selectedCity, loadCityData]);

  useEffect(() => {
    let timer: any;
    const rateLimited = isCurrentlyRateLimited();
    if (rateLimited) {
      const resetTime = getRateLimitResetTime();
      timer = setInterval(() => {
        const rem = Math.max(0, Math.round((resetTime - Date.now()) / 1000));
        setCountdown(rem);
        if (rem <= 0) {
          clearInterval(timer);
          setCountdown(null);
          loadCityData(selectedCity, true);
        }
      }, 1000);
    } else {
      setCountdown(null);
    }
    return () => clearInterval(timer);
  }, [weatherData, selectedCity, loadCityData]);

  const handleManualTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification("System Diagnostic", { body: "Network verified.", icon: '/weather-icon.png' });
    }
  };

  const currentData = weatherData[selectedCity];

  return (
    <div className="min-h-screen pb-20 selection:bg-red-500/30">
      {showPreviewModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowPreviewModal(false)}></div>
          <div className="relative glass-panel w-full max-w-lg rounded-[3rem] p-12 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] border-red-500/20">
            <div className="absolute top-4 right-4 z-10">
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-500 hover:text-white transition-colors p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col items-center text-center space-y-8">
              <Sparkles className="w-10 h-10 text-amber-500" />
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">BUREAU PREVIEW</h2>
                <p className="text-sm font-medium text-slate-300 leading-relaxed max-w-xs mx-auto">
                  Precision Weather for New Brunswick. Authorized access to Big Coco's Bureau sensors.
                </p>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all shadow-2xl">ENTER BUREAU</button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-[100]">
        <div className="bg-amber-500 text-slate-950 py-2 px-6 text-center text-[10px] font-black tracking-[0.25em] uppercase">
          APP LAUNCH - COMING SOON, SOME FEATURES WILL TEMPORARILY BE UNAVAILABLE
        </div>
        
        <CountdownTimer targetDate={launchDate} />

        <div className="glass-panel border-b border-white/5 py-4">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <span className="text-2xl font-black text-white italic">BC</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">BIG COCO'S</h1>
                <p className="text-[10px] font-bold text-red-500 tracking-[0.2em] uppercase mt-1">Weather Bureau</p>
              </div>
            </div>
            <div className="flex items-center bg-slate-800/40 p-1.5 rounded-2xl border border-white/5">
              {cities.map((city) => (
                <button key={city} onClick={() => setSelectedCity(city)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedCity === city ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>{city}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMonitoring(!isMonitoring)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${isMonitoring ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/40 border-white/5 text-slate-300'}`}>
                <Activity className={`w-3.5 h-3.5 ${isMonitoring ? 'animate-pulse' : ''}`} />{isMonitoring ? 'MONITOR ON' : 'START MONITOR'}
              </button>
              <button onClick={() => loadCityData(selectedCity, true)} disabled={refreshing} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-white hover:bg-white/10 disabled:opacity-50"><RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /></button>
            </div>
          </div>
        </div>
        <GlobalAlertStatus status={globalStatus.status} lastChecked={globalStatus.lastChecked} />
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        {error && (
          <div className={`p-6 rounded-[2rem] border animate-in fade-in slide-in-from-top-4 duration-500 ${error.type === 'QUOTA_STALE' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
             <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <AlertTriangle className={`w-6 h-6 ${error.type === 'QUOTA_STALE' ? 'text-amber-500' : 'text-red-500'}`} />
                  <div>
                    <h3 className="font-extrabold text-white uppercase tracking-tight">{error.type === 'QUOTA_STALE' ? 'Quota Cooldown' : 'Link Offline'}</h3>
                    <p className="text-xs font-medium opacity-80">{error.message}</p>
                  </div>
                </div>
                {countdown !== null && (
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Resuming in</p>
                    <p className="text-xl font-black text-white">{countdown}s</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {loading && !currentData ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-semibold tracking-widest text-xs uppercase">Negotiating Sat-Link...</p>
          </div>
        ) : currentData ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <LiveAlertTicker alerts={currentData.alerts} lastUpdated={currentData.lastUpdated} />
            
            {/* Critical Alerts Dashboard */}
            {currentData.alerts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pl-2">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.25em]">Critical Meteorological Advisories</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {currentData.alerts.map((alert, idx) => (
                    <AlertCard key={idx} alert={alert} />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel rounded-[2.5rem] p-10 overflow-hidden relative">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between h-full">
                  <div className="space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest text-slate-400 uppercase"><MapPin className="w-3 h-3 text-red-500" /> {currentData.cityName}, NB</div>
                    <div>
                      <h2 className="text-8xl md:text-9xl font-black tracking-tighter text-white">{currentData.currentTemp}°</h2>
                      <p className="text-xl font-medium text-slate-400">RealFeel® {currentData.feelsLike}°</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end justify-between h-full gap-8 mt-12 md:mt-0">
                    <WeatherIcon condition={currentData.condition} className="w-40 h-40 text-white drop-shadow-2xl" />
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="glass-card p-4 rounded-3xl text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Wind</p>
                        <p className="text-lg font-black text-white">{currentData.windSpeed} <span className="text-[10px] text-slate-400">km/h</span></p>
                      </div>
                      <div className="glass-card p-4 rounded-3xl text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Humidity</p>
                        <p className="text-lg font-black text-white">{currentData.humidity}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <OutlookSummary outlooks={currentData.periodOutlooks} />
                <div className="glass-panel rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ThermometerSun className="w-6 h-6 text-orange-500" />
                      <div><p className="text-[10px] font-bold text-slate-500 uppercase">Daytime High</p><p className="text-2xl font-black text-white">{currentData.high}°</p></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ThermometerSnowflake className="w-6 h-6 text-blue-500" />
                      <div><p className="text-[10px] font-bold text-slate-500 uppercase">Overnight Low</p><p className="text-2xl font-black text-white">{currentData.low}°</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {currentData.minuteCast && <NextHourOutlook data={currentData.minuteCast} currentTemp={currentData.currentTemp} feelsLike={currentData.feelsLike} currentCondition={currentData.condition} />}
            <HourlyForecast data={currentData.hourly} />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 glass-panel rounded-[2.5rem] p-8">
                    <h3 className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8"><Calendar className="w-4 h-4" /> 7-Day Precision Forecast</h3>
                    <div className="space-y-1">
                        {currentData.daily.map((day, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                              <div className="w-32"><p className="font-bold text-slate-200">{day.day}</p></div>
                              <div className="flex items-center gap-4 flex-1">
                                <WeatherIcon condition={day.condition} className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-widest hidden md:block">{day.condition}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                {day.precipProb > 15 && <div className="flex items-center gap-2 text-xs font-bold text-blue-400"><Umbrella className="w-3.5 h-3.5" />{day.precipProb}%</div>}
                                <div className="flex items-center gap-4 w-20 justify-end"><span className="font-bold text-white">{day.high}°</span><span className="font-medium text-slate-600">{day.low}°</span></div>
                              </div>
                          </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2">
                  <SignificantWeatherOutlook events={currentData.significantWeather} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SnowDayPredictor probability={currentData.snowDayProbability} reasoning={currentData.snowDayReasoning} />
                <PowerOutagePredictor probability={currentData.powerOutageProbability} reasoning={currentData.powerOutageReasoning} />
                <ComingSoon title="Lightning Tracking" description="Regional storm triangulation" />
                <RoadConditions status={currentData.roadConditions.status} summary={currentData.roadConditions.summary} />
            </div>
            
            <WeatherRadar lat={CITY_COORDINATES[selectedCity].lat} lon={CITY_COORDINATES[selectedCity].lon} cityName={selectedCity} />

            <div className="glass-panel rounded-[2.5rem] p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-10">System Status</h3>
                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 mb-8">
                   <div className={`p-4 rounded-2xl ${currentData.isStale ? 'bg-amber-500/10' : 'bg-red-600/10'}`}>
                     <Database className={`w-8 h-8 ${currentData.isStale ? 'text-amber-500' : 'text-red-500'}`} />
                   </div>
                   <div>
                     <p className="text-lg font-black text-white uppercase leading-none mb-1">{currentData.isStale ? 'Regional Backup' : 'Live Satellite Uplink'}</p>
                     <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Verified Environment Canada Node</p>
                   </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleManualTestNotification} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all flex-1">
                    <Terminal className="w-3.5 h-3.5" /> Diagnostic
                  </button>
                  <button onClick={() => loadCityData(selectedCity, true)} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600/20 transition-all flex-1">
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Full Sync
                  </button>
                </div>
              </div>
              {currentData.sources?.length > 0 && (
                <div className="mt-12 space-y-3">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-2">Authenticated Sources</p>
                  {currentData.sources.map((source, idx) => (
                    <a key={idx} href={source.uri} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-slate-400 transition-all group border border-transparent hover:border-white/10">
                      <span className="truncate">{source.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
      <footer className="max-w-7xl mx-auto px-6 mt-20 text-center py-10 border-t border-white/5">
        <p className="text-[9px] text-slate-600 font-black tracking-[0.4em] uppercase">Big Coco's Weather Bureau • Official Build • © 2026</p>
      </footer>
    </div>
  );
};

export default App;
