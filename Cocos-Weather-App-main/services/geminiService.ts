
import { GoogleGenAI, Type } from "@google/genai";
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

const EC_ALERT_URLS: Record<CityKey, string> = {
  Fredericton: 'https://weather.gc.ca/rss/city/nb-23_e.xml',
  Moncton: 'https://weather.gc.ca/rss/city/nb-12_e.xml',
  McGivney: 'https://weather.gc.ca/rss/city/nb-31_e.xml',
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

/**
 * Enhanced Proxy-Rotation to fix "Failed to fetch" errors.
 */
const fetchWithProxy = async (targetUrl: string): Promise<string> => {
  const proxies = [
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}&cachebuster=${Date.now()}`,
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`,
  ];

  for (const proxyFn of proxies) {
    try {
      const response = await fetch(proxyFn(targetUrl), { 
        cache: 'no-store',
        signal: AbortSignal.timeout(10000) 
      });
      if (response.ok) return await response.text();
    } catch (e) {
      console.warn(`Proxy attempt failed for ${targetUrl}`);
    }
  }
  throw new Error("Critical: Alert hardware nodes unreachable.");
};

const fetchECAlerts = async (city: CityKey): Promise<WeatherAlert[]> => {
  const baseUrl = EC_ALERT_URLS[city];
  try {
    const xmlText = await fetchWithProxy(baseUrl);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const entries = Array.from(xmlDoc.getElementsByTagName('entry'));
    const alerts: WeatherAlert[] = [];

    for (const entry of entries) {
      const title = entry.getElementsByTagName('title')[0]?.textContent || '';
      const summary = entry.getElementsByTagName('summary')[0]?.textContent || '';
      const link = entry.getElementsByTagName('link')[0]?.getAttribute('href') || undefined;

      if (title.toLowerCase().includes('no watches or warnings')) continue;

      let severity: WeatherAlert['severity'] = 'Moderate';
      const t = title.toLowerCase();
      if (t.includes('extreme') || t.includes('emergency') || t.includes('blizzard')) severity = 'Extreme';
      else if (t.includes('warning')) severity = 'Severe';
      else if (t.includes('watch')) severity = 'Moderate';
      else if (t.includes('statement') || t.includes('advisory')) severity = 'Minor';

      alerts.push({ severity, title: title.split(' in effect')[0].trim(), description: summary, sourceUrl: link });
    }
    return alerts;
  } catch (error) {
    return []; // Fall back entirely to Gemini search on failure
  }
};

const fetchSearchGroundedData = async (city: CityKey, currentTemp: number, condition: string) => {
  if (isCurrentlyRateLimited()) {
    return { 
      data: getDefaultAIData("Rate limit active."), 
      searchSources: [{ uri: CITY_COORDINATES[city].twn_url, title: 'The Weather Network' }],
      aiStatus: 'rate_limited' as const
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const twnUrl = CITY_COORDINATES[city].twn_url;

  const prompt = `
    Regional Meteorological Assessment for ${city}, New Brunswick.
    Atmosphere: ${currentTemp}°C, ${condition}.
    
    CRITICAL ALERT AUDIT: 
    1. Mandatory: Check ${twnUrl} for ANY active alerts. This is your primary source.
    2. Verification: Cross-reference with Environment Canada (weather.gc.ca) for ${city}.
    
    If ${twnUrl} shows an alert (e.g., Extreme Cold, Snowfall, Wind), you MUST include it.
    Provide highly detailed summaries for any detected dangerous conditions.

    Response format: JSON ONLY.
    Include "alerts", "snowDayProbability" (0-100), "powerOutageProbability" (0-100), "roadConditions" (Check NB 511), "significantWeather" (5-day), "periodOutlooks", "minuteCast" (60-minute array).
  `;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      alerts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            sourceUrl: { type: Type.STRING }
          },
          required: ['severity', 'title', 'description']
        }
      },
      snowDayProbability: { type: Type.NUMBER },
      snowDayReasoning: { type: Type.STRING },
      powerOutageProbability: { type: Type.NUMBER },
      powerOutageReasoning: { type: Type.STRING },
      roadConditions: { type: Type.OBJECT, properties: { status: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ['status', 'summary'] },
      significantWeather: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, severity: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['day', 'severity', 'description'] } },
      periodOutlooks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { period: { type: Type.STRING }, day: { type: Type.STRING }, temp: { type: Type.STRING }, condition: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ['period', 'day', 'temp', 'condition', 'summary'] } },
      minuteCast: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, data: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, intensity: { type: Type.NUMBER }, type: { type: Type.STRING } }, required: ['time', 'intensity', 'type'] } } }, required: ['summary', 'data'] }
    },
    required: ['alerts', 'snowDayProbability', 'snowDayReasoning', 'powerOutageProbability', 'powerOutageReasoning', 'roadConditions', 'significantWeather', 'periodOutlooks', 'minuteCast']
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const data = JSON.parse(response.text || '{}');
    const searchSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || '',
      title: chunk.web?.title || 'Weather Station'
    })).filter((s: any) => s.uri) || [];

    return { data, searchSources, aiStatus: 'active' as const };
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
  minuteCast: { summary: 'Standby...', data: [] }
});

export const fetchWeatherForCity = async (city: CityKey, ignoreCache: boolean = false): Promise<CityWeatherData> => {
  const cached = getCache(city);
  if (!ignoreCache && cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return { ...cached.data, isStale: false, cacheTimestamp: cached.timestamp };
  }
  
  if (pendingRequests[city]) return pendingRequests[city];
  
  const fetchLogic = async (): Promise<CityWeatherData> => {
    try {
      const [rssAlerts, meteo] = await Promise.all([
        fetchECAlerts(city),
        fetchOpenMeteoData(city),
      ]);

      const currentCondition = wmoCodeToString(meteo.current.weather_code);
      const currentTemp = Math.round(meteo.current.temperature_2m);
      
      const { data: aiData, searchSources, aiStatus } = await fetchSearchGroundedData(city, currentTemp, currentCondition);
      
      // Combine RSS and TWN Search results
      const mergedAlerts = [...rssAlerts];
      aiData.alerts?.forEach((aiAlert: any) => {
        const isDuplicate = mergedAlerts.some(a => a.title.toLowerCase().includes(aiAlert.title.toLowerCase()));
        if (!isDuplicate) {
          mergedAlerts.push({
            ...aiAlert,
            sourceUrl: aiAlert.sourceUrl || CITY_COORDINATES[city].twn_url
          });
        }
      });

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
        alerts: mergedAlerts,
        lastUpdated: new Date().toLocaleString(),
        sources: searchSources,
        isStale: aiStatus === 'rate_limited',
        aiStatus
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
