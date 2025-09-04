export interface WeatherConfig {
  location?: string | 'auto';
  units: 'metric' | 'imperial';
  showForecast: boolean;
  forecastDays: number;
  showAlerts: boolean;
  theme: 'light' | 'dark' | 'auto';
  layout: 'compact' | 'full' | 'minimal';
  refreshInterval: number; // milliseconds
  apiKey?: string; // Will use TelemetryX secure storage
  language?: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast?: ForecastData[];
  alerts?: WeatherAlert[];
  location: LocationData;
  lastUpdated: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number;
  condition: WeatherCondition;
  precipitation: number;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface ForecastData {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: WeatherCondition;
  precipProbability: number;
  windSpeed: number;
  humidity: number;
}

export interface WeatherAlert {
  title: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  description: string;
  startTime: string;
  endTime: string;
  areas: string[];
}

export interface LocationData {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}