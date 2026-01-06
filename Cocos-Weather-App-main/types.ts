
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

// Fix: Added 'type' property to WeatherAlert interface as it's required by AlertCard component logic.
export interface WeatherAlert {
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  type?: 'Cold' | 'Snow' | 'Wind' | 'Rain' | 'Thunderstorm' | 'General';
  title: string;
  description: string;
  sourceUrl?: string;
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
  intensity: number; // 0 (none) to 1 (heavy)
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

// FIX: Added CameraFeed interface to resolve missing type error.
export interface CameraFeed {
  id: string;
  title: string;
  location: string;
  url: string;
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
}

export type CityKey = 'Fredericton' | 'Moncton' | 'McGivney';