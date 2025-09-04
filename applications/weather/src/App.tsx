import React, { useEffect, useState, useCallback } from 'react';
import { store } from '@telemetryx/sdk';
import { WeatherData, WeatherConfig, ResponsiveFlags } from './types';
import { WeatherService } from './utils/weather-service';
import { DefaultWeather } from './components/themes/DefaultWeather';
import { PhotoWeather } from './components/themes/PhotoWeather';
import { BlueSkiesWeather } from './components/themes/BlueSkiesWeather';
import './App.css';

// Default configuration matching legacy settings
const DEFAULT_CONFIG: WeatherConfig = {
  locations: [],
  useDeviceLocation: false,
  theme: 'default',
  temperatureUnit: 'auto',
  show24hr: false,
  useMDYFormat: false,
  showHourlyForecast: false,
  showDailyForecast: false,
  interval: 10,
  refreshInterval: 3600,
  fontScale: 1.0,
  titleFontScale: 1.0,
  transition: '',
  whiteText: false,
  showTextShadow: false,
  hideBox: false,
  hideBoxOutline: false
};

export const App: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WeatherConfig>(DEFAULT_CONFIG);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [responsive, setResponsive] = useState<ResponsiveFlags>({
    isPortrait: false,
    isWide: false,
    isMedium: false,
    isTall: false,
    isNarrow: false
  });

  // Calculate responsive flags based on screen size
  const updateResponsiveFlags = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = width / height;
    
    setResponsive({
      isPortrait: ratio < 1,
      isWide: ratio > 4,
      isMedium: ratio >= 1 && ratio <= 1.6,
      isTall: ratio < 0.4,
      isNarrow: ratio > 6
    });
  }, []);

  // Load configuration from storage
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await store().local.get('weatherConfig');
        if (savedConfig) {
          setConfig({ ...DEFAULT_CONFIG, ...savedConfig });
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    loadConfig();
    updateResponsiveFlags();

    // Listen for window resize
    window.addEventListener('resize', updateResponsiveFlags);
    return () => window.removeEventListener('resize', updateResponsiveFlags);
  }, [updateResponsiveFlags]);

  // Subscribe to configuration changes
  useEffect(() => {
    const configHandler = (newConfig: WeatherConfig) => {
      setConfig({ ...DEFAULT_CONFIG, ...newConfig });
    };

    store().local.subscribe('weatherConfig', configHandler);

    return () => {
      store().local.unsubscribe('weatherConfig', configHandler);
    };
  }, []);

  // Get current location to fetch weather for
  const getCurrentLocation = useCallback((): string | null => {
    if (config.useDeviceLocation) {
      // In a real implementation, this would get device location
      return 'Vancouver, CA'; // Fallback as per legacy code
    }
    
    if (config.locations.length > 0) {
      return config.locations[currentLocationIndex] || null;
    }
    
    return null;
  }, [config.useDeviceLocation, config.locations, currentLocationIndex]);

  // Fetch weather data
  const fetchWeather = useCallback(async (location: string) => {
    try {
      setLoading(true);
      setError(null);

      // Mock weather API call - replace with actual TelemetryX weather service
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=demo_key&units=${config.temperatureUnit === 'f' ? 'imperial' : 'metric'}`
      );

      if (!response.ok) {
        throw new Error('Weather data not available');
      }

      const data = await response.json();
      
      // Determine temperature unit based on location or setting
      let usesFahrenheit = config.temperatureUnit === 'f';
      if (config.temperatureUnit === 'auto') {
        usesFahrenheit = WeatherService.needsFahrenheit(data.sys.country);
      }

      // Get day/night indicator
      const now = Date.now() / 1000;
      const sunrise = data.sys.sunrise;
      const sunset = data.sys.sunset;
      const daynight = (now >= sunrise && now <= sunset) ? 'd' : 'n';

      const weatherData: WeatherData = {
        current: {
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind?.speed || 0,
          windDirection: data.wind?.deg || 0,
          visibility: data.visibility ? data.visibility / 1000 : 10,
          uvIndex: 0,
          condition: {
            text: data.weather[0].description,
            icon: data.weather[0].icon,
            code: data.weather[0].id
          },
          precipitation: 0,
          daynight
        },
        location: {
          name: data.name,
          region: data.sys.country,
          country: data.sys.country,
          lat: data.coord.lat,
          lon: data.coord.lon,
          timezone: '',
          state: undefined
        },
        lastUpdated: new Date().toISOString(),
        units: {
          temp: usesFahrenheit ? 'F' : 'C',
          wind: usesFahrenheit ? 'mi/h' : 'm/s',
          pressure: 'hPa',
          visibility: usesFahrenheit ? 'mi' : 'km',
          precip: usesFahrenheit ? 'in' : 'mm'
        }
      };

      // Mock daily and hourly forecasts if enabled
      if (config.showDailyForecast) {
        weatherData.forecast = Array.from({ length: 5 }, (_, i) => ({
          time: (Date.now() / 1000) + (i + 1) * 24 * 60 * 60,
          temp: {
            min: weatherData.current.temperature - 5 - Math.random() * 10,
            max: weatherData.current.temperature + 5 + Math.random() * 10
          },
          code: weatherData.current.condition.code,
          label: weatherData.current.condition.text,
          precipitation: Math.random() * 20
        }));
      }

      if (config.showHourlyForecast) {
        weatherData.forecastHourly = Array.from({ length: 7 }, (_, i) => ({
          time: (Date.now() / 1000) + (i + 1) * 60 * 60,
          temp: weatherData.current.temperature + (Math.random() - 0.5) * 10,
          code: weatherData.current.condition.code,
          daynight,
          precipitation: Math.random() * 10
        }));
      }

      setWeatherData(weatherData);
      setShow(true);

      // Cache the data
      await store().deviceLocal.set('weatherCache', weatherData);
      
    } catch (error) {
      console.error('Weather fetch failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch weather');
      
      // Try to load cached data
      try {
        const cachedData = await store().deviceLocal.get('weatherCache');
        if (cachedData) {
          setWeatherData(cachedData);
          setShow(true);
        }
      } catch (cacheError) {
        console.error('Failed to load cached data:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [config.temperatureUnit, config.showDailyForecast, config.showHourlyForecast]);

  // Update weather when location or config changes
  useEffect(() => {
    const location = getCurrentLocation();
    if (location) {
      fetchWeather(location);
    }
  }, [getCurrentLocation, fetchWeather]);

  // Set up automatic refresh interval
  useEffect(() => {
    const location = getCurrentLocation();
    if (!location) return;

    const interval = setInterval(() => {
      fetchWeather(location);
    }, config.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [config.refreshInterval, fetchWeather, getCurrentLocation]);

  // Set up location rotation for multiple locations
  useEffect(() => {
    if (config.locations.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentLocationIndex(prev => (prev + 1) % config.locations.length);
    }, config.interval * 1000);

    return () => clearInterval(interval);
  }, [config.locations.length, config.interval]);

  // No configuration
  if (config.locations.length === 0 && !config.useDeviceLocation) {
    return (
      <div className="weather-app configure">
        <div className="configure-message">
          <h2>Weather Display</h2>
          <p>Please configure locations in the application settings.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !weatherData) {
    return (
      <div className="weather-app loading">
        <div className="loading-spinner" />
        <p>Loading weather data...</p>
      </div>
    );
  }

  // Error state
  if (error && !weatherData) {
    return (
      <div className="weather-app error">
        <div className="error-icon">⚠️</div>
        <h2>Weather Unavailable</h2>
        <p>{error}</p>
        <p className="error-hint">Check your network connection</p>
      </div>
    );
  }

  // No data
  if (!weatherData) {
    return (
      <div className="weather-app">
        <p>No weather data available</p>
      </div>
    );
  }

  // Get location display name if configured
  const locationDisplayName = config.locationDisplayNames?.[currentLocationIndex];

  // Render appropriate theme
  const renderWeatherTheme = () => {
    const commonProps = {
      weather: weatherData,
      config,
      responsive,
      show,
      locationDisplayName
    };

    switch (config.theme) {
      case 'photo':
        return <PhotoWeather {...commonProps} />;
      case 'blueskies':
        return <BlueSkiesWeather {...commonProps} />;
      default:
        return <DefaultWeather {...commonProps} />;
    }
  };

  return (
    <div className="weather-app" style={{ fontSize: `${config.fontScale}em` }}>
      {renderWeatherTheme()}
      
      {/* Error banner for cached data */}
      {error && weatherData && (
        <div className="error-banner">
          Using cached data - {error}
        </div>
      )}
    </div>
  );
};