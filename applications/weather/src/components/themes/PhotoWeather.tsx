import React from 'react';
import { WeatherData, WeatherConfig, ResponsiveFlags } from '../../types';
import { WeatherService } from '../../utils/weather-service';
import { WeatherIcon } from '../WeatherIcon';
import { Clock } from '../Clock';
import './PhotoWeather.css';

interface PhotoWeatherProps {
  weather: WeatherData;
  config: WeatherConfig;
  responsive: ResponsiveFlags;
  show: boolean;
  locationDisplayName?: string;
}

export const PhotoWeather: React.FC<PhotoWeatherProps> = ({
  weather,
  config,
  responsive,
  show,
  locationDisplayName
}) => {
  const { current, location, forecast } = weather;
  const { show24hr, fontScale, titleFontScale } = config;

  // Get background image based on weather condition
  const backgroundImage = WeatherService.getWeatherBackground(current.condition.code);
  const isLightTheme = WeatherService.isLightThemeBackground(backgroundImage);
  const theme = isLightTheme ? 'light' : 'dark';

  // Check for temperature adjustment (visual bias for certain numbers)
  const adjustLeft = (current.temperature >= 10 && current.temperature < 20) || 
                    (current.temperature >= 100 && current.temperature < 200);

  const locationText = locationDisplayName || location.name;

  const parseTemp = (temp: number): number => Math.round(temp);

  const formatWeekday = (timestamp: number): string => {
    return WeatherService.formatWeekday(timestamp);
  };

  const getAnimationDelay = (baseDelay: number, index: number, increment: number) => ({
    animationDelay: `${baseDelay + (index * increment)}ms`
  });

  return (
    <div className="photo-weather-wrapper">
      <div 
        className={`photo-weather-item ${theme}`}
        style={{
          backgroundImage: `url(https://content.telemetrytv.com/weather/photo-bg/${backgroundImage}.jpg)`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom center',
          backgroundSize: 'cover'
        }}
      >
        {/* Top zone mask for better text readability */}
        <div className="top-zone-mask"></div>

        {/* Top zone with location and time */}
        <div className={`top-zone ${responsive.isWide ? 'is-wide' : ''}`} 
             style={{ fontSize: `${titleFontScale}em` }}>
          
          {!responsive.isWide && (
            <div className="time-n-date">
              <div className="time">
                <Clock 
                  timezone={location.timezone}
                  show24hr={show24hr}
                  darkMode={theme === 'light'}
                />
              </div>
              <div className="current-date">
                {WeatherService.formatDate(Date.now() / 1000, config.useMDYFormat, location.timezone)}
              </div>
            </div>
          )}

          <div className="location">
            {locationDisplayName ? (
              <div className="city">{locationDisplayName}</div>
            ) : (
              <>
                <div className="city">{location.name}</div>
                <div className="country">{location.country}</div>
              </>
            )}
          </div>
        </div>

        {/* Current weather display */}
        <div className={`current ${responsive.isPortrait ? 'is-portrait' : ''} ${responsive.isWide ? 'is-wide' : ''}`}
             style={{ fontSize: `${fontScale}em` }}>
          
          <WeatherIcon 
            code={current.condition.code}
            daynight={current.daynight}
            theme={theme}
            size={240}
            className="weather-icon"
          />

          <div className="meta">
            {show && weather && (
              <div className={`temp delay-500 fade-right ${adjustLeft ? 'adjust-left' : ''} ${responsive.isPortrait ? 'is-portrait' : ''}`}>
                {current.temperature}°{weather.units?.temperature}
              </div>
            )}

            {show && weather && current.condition && (
              <div className="current-condition delay-700 fade-right">
                {current.condition.text}
              </div>
            )}

            {!responsive.isWide && (
              <div className="atmosphere">
                <div className="item wind">
                  {show && current.windSpeed && (
                    <div className="inner delay-900 slide-right">
                      <div className="label-text">Wind</div>
                      <div className="content">
                        {WeatherService.getWindDirection(current.windDirection)} {WeatherService.formatWindSpeed(current.windSpeed, weather.units?.temperature === 'F' ? 'f' : 'c')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="item humidity">
                  {show && current.humidity && (
                    <div className="inner delay-1100 slide-right">
                      <div className="label-text">Humidity</div>
                      <div className="content">{current.humidity}%</div>
                    </div>
                  )}
                </div>

                <div className="item visibility">
                  {show && current.pressure && (
                    <div className="inner delay-1300 slide-right">
                      <div className="label-text">Pressure</div>
                      <div className="content">{WeatherService.formatPressure(current.pressure)}{weather.units?.pressure}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Forecast background wrapper */}
        {!responsive.isWide && (
          <div className={`forcast-bg-wrapper ${responsive.isPortrait ? 'is-portrait' : ''}`}></div>
        )}

        {/* Daily forecast */}
        {!responsive.isWide && forecast && (
          <div className={`forecast ${responsive.isPortrait ? 'is-portrait' : ''}`}>
            <div className="blur-wrapper" 
                 style={{
                   backgroundImage: `url(https://content.telemetrytv.com/weather/photo-bg/${backgroundImage}.jpg)`,
                   backgroundRepeat: 'no-repeat',
                   backgroundPosition: 'bottom center',
                   backgroundSize: 'cover'
                 }}>
            </div>
            <div className="adjust-mask"></div>
            
            {forecast.map((day, index) => (
              <div className="day" key={index} style={{ fontSize: `${fontScale}em` }}>
                {show && forecast && (
                  <div className={`inner fade-up-big`} 
                       style={getAnimationDelay(1200, index, 200)}>
                    <div className="dow">{formatWeekday(day.time)}</div>
                    <div className="weather">
                      <WeatherIcon 
                        code={day.code}
                        theme={theme}
                        size={40}
                        className="weather-icon"
                      />
                      <div className={`text ${responsive.isPortrait ? 'is-portrait' : ''}`}>
                        {day.label}
                      </div>
                    </div>
                    <div className="temps">
                      <div className="high">
                        <div className="value">{parseTemp(day.temp.max)}°{weather.units?.temperature}</div>
                        <div className="label-text">High</div>
                      </div>
                      <div className="low">
                        <div className="value">{parseTemp(day.temp.min)}°{weather.units?.temperature}</div>
                        <div className="label-text">Low</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};