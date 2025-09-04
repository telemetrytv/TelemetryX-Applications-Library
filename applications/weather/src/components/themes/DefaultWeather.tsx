import React from 'react';
import { WeatherData, WeatherConfig, ResponsiveFlags } from '../../types';
import { WeatherService } from '../../utils/weather-service';
import { WeatherIcon } from '../WeatherIcon';
import { Clock } from '../Clock';
import './DefaultWeather.css';

interface DefaultWeatherProps {
  weather: WeatherData;
  config: WeatherConfig;
  responsive: ResponsiveFlags;
  show: boolean;
  locationDisplayName?: string;
}

export const DefaultWeather: React.FC<DefaultWeatherProps> = ({
  weather,
  config,
  responsive,
  show,
  locationDisplayName
}) => {
  const { current, location, forecast, forecastHourly, units } = weather;
  const {
    show24hr,
    showHourlyForecast,
    showDailyForecast,
    whiteText,
    showTextShadow,
    hideBox,
    hideBoxOutline,
    fontScale,
    titleFontScale
  } = config;

  const iconTheme = whiteText ? 'dark' : 'light';
  const noForecasts = !showDailyForecast && !showHourlyForecast;
  const showAllForecasts = showDailyForecast && showHourlyForecast;

  const locationText = locationDisplayName || 
    (location.state ? `${location.name}, ${location.state}, ${location.country}` : `${location.name}, ${location.country}`);

  const windDirection = WeatherService.getWindDirection(current.windDirection);
  const windSpeedFormatted = WeatherService.formatWindSpeed(current.windSpeed, units?.temperature === 'F' ? 'f' : 'c');
  const pressureFormatted = WeatherService.formatPressure(current.pressure);

  const getAnimationDelay = (baseDelay: number, index: number, increment: number) => ({
    animationDelay: `${baseDelay + (index * increment)}ms`
  });

  const formatHour = (timestamp: number): string => {
    return WeatherService.formatTime(timestamp, show24hr, location.timezone);
  };

  const formatWeekday = (timestamp: number): string => {
    return WeatherService.formatWeekday(timestamp);
  };

  const parseTemp = (temp: number): number => Math.round(temp);

  return (
    <div className={`default-weather-wrapper ${responsive.isPortrait ? 'is-portrait' : 'landscape'} 
                    ${responsive.isMedium ? 'is-medium' : ''} ${responsive.isWide ? 'is-wide' : ''} 
                    ${responsive.isNarrow ? 'is-narrow' : ''} ${responsive.isTall ? 'is-tall' : ''}`}>
      
      <div className={`weather-informations app-context-block 
                      ${!whiteText ? 'dark-text' : ''} 
                      ${showTextShadow ? 'show-text-shadow' : ''} 
                      ${!weather ? 'uninitialized' : ''} 
                      ${hideBox ? 'hide-content-box' : ''} 
                      ${hideBoxOutline ? 'hide-box-outline' : ''}`}>
        
        {weather && (
          <>
            {/* LOCATION AND DATETIME */}
            <div className={`location-infos app-context-section secondary ${!responsive.isWide ? 'border-bottom' : ''}`} 
                 style={{ fontSize: `${titleFontScale}em` }}>
              
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

            {/* MAIN SECTION */}
            <div className="main-section app-context-section primary">
              
              {/* Current Weather */}
              <div className="current-and-recent">
                <div className={`current ${noForecasts ? 'no-forecasts' : ''} ${showAllForecasts ? 'all-forecasts' : ''}`} 
                     style={{ fontSize: `${fontScale}em` }}>
                  
                  <div className={`temp-n-condition ${current.temperature >= 100 ? 'smaller-size' : ''}`}>
                    <div className="temp">
                      {show && (
                        <div className="inner delay-500 slide-left">
                          {current.temperature}°{units?.temperature}
                        </div>
                      )}
                    </div>

                    <div className="current-condition">
                      {show && weather && current.condition && (
                        <div className="inner delay-500 slide-left">
                          {current.condition.text}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="current-icon">
                    <WeatherIcon 
                      code={current.condition.code}
                      daynight={current.daynight}
                      theme={iconTheme}
                      size={200}
                      className="weather-icon"
                    />
                  </div>

                  <div className="meta">
                    <div className="item wind">
                      {show && current.windSpeed && (
                        <div className="inner delay-700 slide-right">
                          <div className="label-text">Wind</div>
                          <div className="content">{windDirection} {windSpeedFormatted}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="item humidity">
                      {show && current.humidity && (
                        <div className="inner delay-900 slide-right">
                          <div className="label-text">Humidity</div>
                          <div className="content">{current.humidity}%</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="item visibility">
                      {show && current.pressure && (
                        <div className="inner delay-1100 slide-right">
                          <div className="label-text">Pressure</div>
                          <div className="content">{pressureFormatted}{units?.pressure}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly Forecast */}
              {showHourlyForecast && forecastHourly && (
                <div className={`forecast-3hrs app-context-section 
                               ${!responsive.isWide ? 'primary' : 'secondary'} 
                               ${responsive.isWide ? 'border-left' : ''}`}
                     style={{ fontSize: `${fontScale}em` }}>
                  
                  {forecastHourly.map((item, index) => (
                    <div className="item" key={index}>
                      {show && forecastHourly && (
                        <div className={`inner fade-down delay-${1200 + (index * 100)}`}>
                          <div className="hour">{formatHour(item.time)}</div>
                          <WeatherIcon 
                            code={item.code}
                            daynight={item.daynight}
                            theme={iconTheme}
                            size={40}
                            className="weather-icon"
                          />
                          <div className="temp">{item.temp}°{units?.temperature}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Daily Forecast */}
              {showDailyForecast && forecast && (
                <div className={`daily-forecasts app-context-section secondary 
                               ${!responsive.isWide ? 'border-top' : 'border-left'}`}>
                  
                  {forecast.map((day, index) => (
                    <div className="day" key={index}>
                      {show && forecast && (
                        <div className={`inner fade-up-big delay-${2000 + (index * 200)}`}>
                          <div className="dow">
                            {formatWeekday(day.time)}
                          </div>
                          <div className="temps">
                            {parseTemp(day.temp.min)} ~ {parseTemp(day.temp.max)}°{units?.temperature}
                          </div>
                          <WeatherIcon 
                            code={day.code}
                            theme={iconTheme}
                            size={40}
                            className="weather-icon"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};