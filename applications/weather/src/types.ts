export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
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
  daynight: 'd' | 'n';
}

export interface Location {
  name: string;
  displayName?: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  state?: string;
}

export interface HourlyForecast {
  time: number;
  temp: number;
  code: number;
  daynight: 'd' | 'n';
  precipitation?: number;
}

export interface DailyForecast {
  time: number;
  temp: {
    min: number;
    max: number;
  };
  code: number;
  label: string;
  precipitation?: number;
}

export interface WeatherData {
  current: CurrentWeather;
  location: Location;
  lastUpdated: string;
  timezone?: {
    Name: string;
    Code: string;
  };
  forecast?: DailyForecast[];
  forecastHourly?: HourlyForecast[];
  units?: {
    temp: string;
    wind: string;
    pressure: string;
    visibility: string;
    precip: string;
  };
}

export interface WeatherConfig {
  // Location settings
  locations: string[];
  locationDisplayNames?: string[];
  useDeviceLocation: boolean;
  
  // Display settings
  theme: 'default' | 'photo' | 'blueskies';
  temperatureUnit: 'auto' | 'c' | 'f';
  show24hr: boolean;
  useMDYFormat: boolean;
  
  // Forecast settings
  showHourlyForecast: boolean;
  showDailyForecast: boolean;
  
  // Timing settings
  interval: number; // seconds between location rotations
  refreshInterval: number; // seconds between weather updates
  
  // Visual settings
  fontScale: number;
  titleFontScale: number;
  transition: string;
  
  // Layout responsive settings
  hideBox?: boolean;
  hideBoxOutline?: boolean;
  whiteText?: boolean;
  showTextShadow?: boolean;
}

export interface WeatherIconMapping {
  [key: string]: string;
}

export interface WeatherBackground {
  name: string;
  image: string;
}

export interface WeatherBackgrounds {
  [key: string]: WeatherBackground;
}

export type WeatherTheme = 'default' | 'photo' | 'blueskies';
export type TemperatureUnit = 'c' | 'f';
export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface ResponsiveFlags {
  isPortrait: boolean;
  isWide: boolean;
  isMedium: boolean;
  isTall: boolean;
  isNarrow: boolean;
}

export interface WeatherError {
  message: string;
  code?: string;
  retryable: boolean;
}