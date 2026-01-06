
import { CityWeatherData, CityKey, WeatherAlert } from "../types";

// Helper to check if the error is a rate limit error
const isRateLimitError = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || "";
  const status = error?.status;
  return (
    status === 429 || 
    message.includes("429") || 
    message.includes("quota") || 
    message.includes("exhausted") || 
    message.includes("limit")
  );
};

const CITY_COORDINATES: Record<CityKey, { lat: number; lon: number; twn_url: string; }> = {
  Fredericton: { 
    lat: 45.9636, 
    lon: -66.6431, 
    twn_url: 'https://www.theweathernetwork.com/en/city/ca/new-brunswick/fredericton/alerts'
  },
  Moncton: { 
    lat: 46.0878, 
    lon: -64.7782, 
    twn_url: 'https://www.theweathernetwork.com/en/city/ca/new-brunswick/moncton/alerts'
  },
  McGivney: { 
    lat: 46.2501, 
    lon: -66.3154, 
    twn_url: 'https://www.theweathernetwork.com/en/city/ca/new-brunswick/mcgivney/alerts'
  },
};

export const CACHE_TTL = 15 * 60 * 1000; 

const pendingRequests: Record<string, Promise<CityWeatherData>> = {};
let rateLimitResetTime = 0;
const RATE_LIMIT_COOLDOWN = 60 * 1000;

export const isCurrentlyRateLimited = () => Date.now() < rateLimitResetTime;
export const getRateLimitResetTime = () => rateLimitResetTime;

const getCache = (city: CityKey): { data: CityWeatherData, timestamp: number } | null => {
  try {
    const item = localStorage.getItem(`weather_cache_v30_${city}`);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};

const setCache = (city: CityKey, data: CityWeatherData) => {
  try {
    localStorage.setItem(`weather_cache_v30_${city}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {}
};

const wmoCodeToString = (code: number): string => {
  const mapping: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
    55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain', 71: 'Slight snow fall',
    73: 'Moderate snow fall', 75: 'Heavy snow fall', 77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  };
  return mapping[code] || 'Unknown';
};

const classifyAlertType = (title: string): WeatherAlert['type'] => {
  const t = title.toLowerCase();
  if (t.includes('cold') || t.includes('frost')) return 'Cold';
  if (t.includes('snow') || t.includes('blizzard') || t.includes('winter')) return 'Snow';
  if (t.includes('wind') || t.includes('squall')) return 'Wind';
  if (t.includes('rain') || t.includes('flood')) return 'Rain';
  if (t.includes('thunder') || t.includes('lightning') || t.includes('storm')) return 'Thunderstorm';
  return 'General';
};

const fetchSearchGroundedData = async (city: CityKey, currentTemp: number, condition: string) => {
  if (isCurrentlyRateLimited()) {
    return { 
      data: getDefaultAIData("Rate limit active."), 
      searchSources: [{ uri: CITY_COORDINATES[city].twn_url, title: 'The Weather Network' }],
      aiStatus: 'rate_limited' as const
    };
  }

  try {
    const response = await fetch('/api/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city, 
        currentTemp, 
        condition,
        twnUrl: CITY_COORDINATES[city].twn_url 
      })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})); // Gracefully handle non-json error responses
      if (isRateLimitError(errorBody) || response.status === 429) {
          rateLimitResetTime = Date.now() + RATE_LIMIT_COOLDOWN;
          return { data: getDefaultAIData("Service limit triggered."), searchSources: [], aiStatus: 'rate_limited' as const };
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const { data, searchSources, aiStatus } = await response.json();
    return { data, searchSources, aiStatus };

  } catch (error: any) {
    if (isRateLimitError(error)) {
        rateLimitResetTime = Date.now() + RATE_LIMIT_COOLDOWN;
        return { data: getDefaultAIData("Service limit triggered."), searchSources: [], aiStatus: 'rate_limited' as const };
    }
    return { data: getDefaultAIData("Intelligence service standby."), searchSources: [], aiStatus: 'failed' as const };
  }
};

const fetchOpenMeteoData = async (city: CityKey) => {
  const { lat, lon } = CITY_COORDINATES[city];
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    minutely_15: 'precipitation,weather_code',
    timezone: 'America/Moncton',
    forecast_days: '7',
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  return response.json();
};

const getDefaultAIData = (reason: string) => ({
  alerts: [],
  snowDayProbability: 0,
  snowDayReasoning: reason,
  powerOutageProbability: 0,
  powerOutageReasoning: reason,
  roadConditions: { status: 'Unknown', summary: 'Awaiting sync...' },
  significantWeather: [],
  periodOutlooks: [],
  minuteCast: { summary: 'Standby...', data: [] },
  atmosphericDetails: {
    uvIndex: 0,
    uvDescription: 'Awaiting data...',
    airQuality: 0,
    airQualityDescription: 'Awaiting data...',
    visibility: '-- km',
    pressure: '---- hPa'
  },
  astro: {
    sunrise: '--:--',
    sunset: '--:--',
    moonIllumination: 0,
    moonPhase: 'Awaiting data...',
    dayLength: '--h --m'
  },
  lightning: {}
});

export const fetchWeatherForCity = async (city: CityKey, ignoreCache: boolean = false): Promise<CityWeatherData> => {
  const cached = getCache(city);
  if (!ignoreCache && cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return { ...cached.data, isStale: false, cacheTimestamp: cached.timestamp };
  }
  
  if (pendingRequests[city]) return pendingRequests[city];
  
  const fetchLogic = async (): Promise<CityWeatherData> => {
    try {
      const meteo = await fetchOpenMeteoData(city);
      const currentCondition = wmoCodeToString(meteo.current.weather_code);
      const currentTemp = Math.round(meteo.current.temperature_2m);
      
      const { data: aiData, searchSources, aiStatus } = await fetchSearchGroundedData(city, currentTemp, currentCondition);
      
      const classifiedAlerts = aiData.alerts?.map((alert: any) => ({
        ...alert,
        type: classifyAlertType(alert.title),
        verified: false,
        sourceUrl: alert.sourceUrl || CITY_COORDINATES[city].twn_url
      })) || [];

      const hourly = meteo.hourly.time.slice(0, 24).map((t: string, i: number) => ({
        time: new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', '').toLowerCase(),
        temp: Math.round(meteo.hourly.temperature_2m[i]),
        condition: wmoCodeToString(meteo.hourly.weather_code[i]),
        precipProb: meteo.hourly.precipitation_probability[i],
      }));

      const daily = meteo.daily.time.slice(0, 7).map((d: string, i: number) => ({
        day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(d + "T12:00:00").toLocaleDateString('en-US', { weekday: 'long' }),
        high: Math.round(meteo.daily.temperature_2m_max[i]),
        low: Math.round(meteo.daily.temperature_2m_min[i]),
        condition: wmoCodeToString(meteo.daily.weather_code[i]),
        precipProb: meteo.daily.precipitation_probability_max[i],
      }));

      const finalData: CityWeatherData = {
        cityName: city,
        currentTemp,
        feelsLike: Math.round(meteo.current.apparent_temperature),
        condition: currentCondition,
        high: Math.round(meteo.daily.temperature_2m_max[0]),
        low: Math.round(meteo.daily.temperature_2m_min[0]),
        humidity: meteo.current.relative_humidity_2m,
        windSpeed: Math.round(meteo.current.wind_speed_10m),
        snowDayProbability: aiData.snowDayProbability,
        snowDayReasoning: aiData.snowDayReasoning,
        powerOutageProbability: aiData.powerOutageProbability,
        powerOutageReasoning: aiData.powerOutageReasoning,
        roadConditions: aiData.roadConditions,
        minuteCast: aiData.minuteCast,
        hourly,
        daily,
        significantWeather: aiData.significantWeather,
        periodOutlooks: aiData.periodOutlooks,
        alerts: classifiedAlerts,
        lastUpdated: new Date().toLocaleString(),
        sources: searchSources,
        isStale: aiStatus === 'rate_limited',
        aiStatus,
        atmosphericDetails: aiData.atmosphericDetails,
        astro: aiData.astro,
        lightning: aiData.lightning,
      };

      setCache(city, finalData);
      return finalData;
    } catch (error) {
      console.error(`Feed failure for ${city}:`, error);
      const stale = getCache(city);
      if (stale) return { ...stale.data, isStale: true };
      throw error;
    } finally {
      delete pendingRequests[city];
    }
  };

  pendingRequests[city] = fetchLogic();
  return pendingRequests[city];
};
