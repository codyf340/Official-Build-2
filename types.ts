

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  precipProb: number;
}

export interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  precipProb: number;
}

export interface WeatherAlert {
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  type: 'Cold' | 'Snow' | 'Wind' | 'Rain' | 'Thunderstorm' | 'General';
  title: string;
  description: string;
  sourceUrl?: string;
  verified?: boolean;
}

export interface RoadConditions {
  status: 'Good' | 'Fair' | 'Poor' | 'Unknown';
  summary: string;
}

export interface SignificantWeatherEvent {
  day: string;
  severity: 'High' | 'Moderate' | 'None';
  description: string;
}

export interface MinuteCastEntry {
  time: string;
  intensity: number;
  type: 'rain' | 'snow' | 'ice' | 'mix' | 'none';
}

export interface MinuteCastData {
  summary: string;
  data: MinuteCastEntry[];
}

export interface PeriodOutlook {
  period: 'Morning' | 'Afternoon' | 'Overnight';
  day: string;
  temp: string;
  condition: string;
  summary: string;
}

export interface CameraFeed {
  id: string;
  title: string;
  location: string;
  url: string;
}

// FIX: Add AppID type for navigation.
export type AppID = 'dashboard' | 'transit' | 'astro' | 'radar';

// FIX: Add AtmosphericDetails for health component.
export interface AtmosphericDetails {
  uvIndex: number;
  uvDescription: string;
  airQuality: number;
  airQualityDescription: string;
  visibility: string;
  pressure: string;
}

// FIX: Add AstroData for celestial component.
export interface AstroData {
  sunrise: string;
  sunset: string;
  moonIllumination: number;
  moonPhase: string;
  dayLength: string;
}

// FIX: Add LightningPulse for future lightning component.
export interface LightningPulse {
  distance?: number;
  intensity?: 'Low' | 'Moderate' | 'High';
}


export interface CityWeatherData {
  cityName: string;
  stationName?: string;
  currentTemp: number;
  feelsLike: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  snowDayProbability: number;
  snowDayReasoning: string;
  powerOutageProbability: number;
  powerOutageReasoning: string;
  roadConditions: RoadConditions;
  minuteCast: MinuteCastData;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  significantWeather: SignificantWeatherEvent[];
  periodOutlooks: PeriodOutlook[];
  alerts: WeatherAlert[];
  lastUpdated: string;
  sources: { uri: string; title: string }[];
  isStale?: boolean;
  cacheTimestamp?: number;
  aiStatus?: 'active' | 'rate_limited' | 'failed';
  // FIX: Add new data properties to main weather data type.
  atmosphericDetails: AtmosphericDetails;
  astro: AstroData;
  lightning: LightningPulse;
}

export type CityKey = 'Fredericton' | 'Moncton' | 'McGivney';
