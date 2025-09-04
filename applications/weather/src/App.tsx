import React, { useEffect, useState } from 'react';
import { store } from '@telemetryx/sdk';
import { WeatherData } from './types';
import './App.css';

export const App: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string>('');

  // Subscribe to city changes from settings
  useEffect(() => {
    const loadInitialCity = async () => {
      try {
        const savedCity = await store().local.get('selectedCity');
        if (savedCity) {
          setCity(savedCity);
        }
      } catch (error) {
        console.error('Failed to load city:', error);
      }
    };

    loadInitialCity();

    // Subscribe to city changes
    const cityHandler = (newCity: string) => {
      setCity(newCity);
    };

    store().local.subscribe('selectedCity', cityHandler);

    return () => {
      store().local.unsubscribe('selectedCity', cityHandler);
    };
  }, []);

  // Fetch weather when city changes
  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate weather API call - replace with real API
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`
        );
        
        if (!response.ok) {
          throw new Error('Weather data not available');
        }
        
        const data = await response.json();
        
        const weatherData: WeatherData = {
          current: {
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            windDirection: data.wind.deg,
            visibility: data.visibility / 1000,
            uvIndex: 0,
            condition: {
              text: data.weather[0].description,
              icon: data.weather[0].icon,
              code: data.weather[0].id
            },
            precipitation: 0
          },
          location: {
            name: data.name,
            region: data.sys.country,
            country: data.sys.country,
            lat: data.coord.lat,
            lon: data.coord.lon,
            timezone: ''
          },
          lastUpdated: new Date().toISOString()
        };
        
        setWeatherData(weatherData);
        
        // Cache the data in device storage
        await store().deviceLocal.set('weatherCache', weatherData);
        
      } catch (error) {
        console.error('Weather fetch failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch weather');
        
        // Try to load cached data
        try {
          const cachedData = await store().deviceLocal.get('weatherCache');
          if (cachedData) {
            setWeatherData(cachedData);
          }
        } catch (cacheError) {
          console.error('Failed to load cached data:', cacheError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Set up refresh interval
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // 10 minutes

    return () => {
      clearInterval(interval);
    };
  }, [city]);

  if (!city) {
    return (
      <div className="weather-app configure">
        <div className="configure-message">
          <h2>Weather Display</h2>
          <p>Please configure a city in the application settings.</p>
        </div>
      </div>
    );
  }

  if (loading && !weatherData) {
    return (
      <div className="weather-app loading">
        <div className="loading-spinner" />
        <p>Loading weather data for {city}...</p>
      </div>
    );
  }

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

  if (!weatherData) {
    return (
      <div className="weather-app">
        <p>No weather data available</p>
      </div>
    );
  }

  return (
    <div className="weather-app">
      <div className="weather-card">
        <div className="city">{weatherData.location.name}</div>
        <div className="temperature">{weatherData.current.temperature}°C</div>
        <div className="condition">{weatherData.current.condition.text}</div>
        <div className="details">
          <div>Feels like {weatherData.current.feelsLike}°C</div>
          <div>Humidity: {weatherData.current.humidity}%</div>
          <div>Wind: {weatherData.current.windSpeed} m/s</div>
        </div>
        {error && (
          <div className="error-banner">
            Using cached data - {error}
          </div>
        )}
      </div>
    </div>
  );
};