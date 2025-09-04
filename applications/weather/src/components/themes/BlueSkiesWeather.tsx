import React from 'react';
import { WeatherData, WeatherConfig, ResponsiveFlags } from '../../types';
import { WeatherService } from '../../utils/weather-service';
import { WeatherIcon } from '../WeatherIcon';
import { Clock } from '../Clock';
import './BlueSkiesWeather.css';

interface BlueSkiesWeatherProps {
  weather: WeatherData;
  config: WeatherConfig;
  responsive: ResponsiveFlags;
  show: boolean;
  locationDisplayName?: string;
}

export const BlueSkiesWeather: React.FC<BlueSkiesWeatherProps> = ({
  weather,
  config,
  responsive,
  show,
  locationDisplayName
}) => {
  const { current, location, forecast, forecastHourly } = weather;
  const { show24hr, fontScale, titleFontScale } = config;

  // Get gradient background based on weather condition and time of day
  const backgroundGradient = WeatherService.getBlueSkiesGradient(current.condition.code, current.daynight);

  const locationText = locationDisplayName || `${location.name}, ${location.country}`;

  const parseTemp = (temp: number): number => Math.round(temp);

  const formatWeekday = (timestamp: number): string => {
    return WeatherService.formatWeekday(timestamp);
  };

  const formatHour = (timestamp: number): string => {
    return WeatherService.formatTime(timestamp, show24hr, location.timezone);
  };

  const getAnimationDelay = (baseDelay: number, index: number, increment: number) => ({
    animationDelay: `${baseDelay + (index * increment)}ms`
  });

  return (
    <div className={`blueskies-weather-item 
                    ${responsive.isPortrait ? 'is-portrait' : 'landscape'} 
                    ${responsive.isMedium ? 'is-medium' : ''} 
                    ${responsive.isWide ? 'is-wide' : ''} 
                    ${responsive.isTall ? 'is-tall' : ''}`}>
      
      <div className="resize-sensor"></div>

      {/* Background gradient */}
      <div 
        className="background-gradient"
        style={{ backgroundImage: backgroundGradient }}
      ></div>

      {weather && (
        <div className="item-wrapper">
          
          {/* Top zone with location and time */}
          <div className="top-zone" style={{ fontSize: `${titleFontScale}em` }}>
            <div className="location">
              <div className="city">{locationText}</div>
            </div>

            <div className="time-n-date">
              <div className="current-date">
                <div className="date">
                  {WeatherService.formatDate(Date.now() / 1000, config.useMDYFormat, location.timezone)}
                </div>
                <Clock 
                  timezone={location.timezone}
                  show24hr={show24hr}
                />
              </div>
            </div>
          </div>

          {/* Main zone with current weather and forecasts */}
          <div className="main-zone">
            
            <div className="current-and-recent">
              
              {/* Current weather */}
              <div className="current" style={{ fontSize: `${fontScale}em` }}>
                <div className={`icon-n-temp ${current.temperature >= 100 ? 'smaller-size' : ''}`}>
                  <WeatherIcon 
                    code={current.condition.code}
                    daynight={current.daynight}
                    size={210}
                    className="weather-icon"
                  />
                  <div className="temp">{current.temperature}°{weather.units?.temperature}</div>
                </div>

                <div className="meta">
                  <div className="current-condition">
                    {show && current.condition && (
                      <div className="inner delay-500 slide-left">
                        {current.condition.text}
                      </div>
                    )}
                  </div>

                  <div className="atmosphere">
                    <div className="item wind">
                      {show && current.windSpeed && (
                        <div className="inner delay-700 slide-left">
                          <div className="label-text">Wind</div>
                          <div className="content">
                            {WeatherService.getWindDirection(current.windDirection)} {WeatherService.formatWindSpeed(current.windSpeed, weather.units?.temperature === 'F' ? 'f' : 'c')}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="item humidity">
                      {show && current.humidity && (
                        <div className="inner delay-900 slide-left">
                          <div className="label-text">Humidity</div>
                          <div className="content">{current.humidity}%</div>
                        </div>
                      )}
                    </div>

                    <div className="item visibility">
                      {show && current.pressure && (
                        <div className="inner delay-1100 slide-left">
                          <div className="label-text">Pressure</div>
                          <div className="content">{WeatherService.formatPressure(current.pressure)}{weather.units?.pressure}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly forecast */}
              {!responsive.isWide && forecastHourly && (
                <div className="forecast-3hrs" style={{ fontSize: `${fontScale}em` }}>
                  {forecastHourly.map((item, index) => (
                    <div className="item" key={index}>
                      {show && forecastHourly && (
                        <div className={`inner fade-down`} 
                             style={getAnimationDelay(1200, index, 100)}>
                          <div className="hour">{formatHour(item.time)}</div>
                          <WeatherIcon 
                            code={item.code}
                            daynight={item.daynight}
                            size={45}
                            className="weather-icon"
                          />
                          <div className="temp">{item.temp}°{weather.units?.temperature}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Daily forecast */}
            {!responsive.isWide && !responsive.isTall && forecast && (
              <div className="forecast" style={{ fontSize: `${fontScale}em` }}>
                {forecast.map((day, index) => (
                  <div className="day" key={index}>
                    {show && forecast && (
                      <div className={`inner fade-up-big`} 
                           style={getAnimationDelay(2000, index, 200)}>
                        <div className="contexts">
                          <div className="dow">
                            <span>{formatWeekday(day.time)}</span>
                          </div>
                          <div className="temps">
                            {parseTemp(day.temp.min)} ~ {parseTemp(day.temp.max)}°{weather.units?.temperature}
                          </div>
                        </div>
                        <WeatherIcon 
                          code={day.code}
                          size={65}
                          className="weather-icon"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};