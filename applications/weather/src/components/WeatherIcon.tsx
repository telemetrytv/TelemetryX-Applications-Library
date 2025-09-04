import React from 'react';
import { WeatherService } from '../utils/weather-service';

interface WeatherIconProps {
  code: number | string;
  daynight?: 'd' | 'n';
  theme?: 'light' | 'dark';
  size?: number;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  daynight = 'd',
  theme = 'dark',
  size = 24,
  className = ''
}) => {
  const iconName = WeatherService.getWeatherIcon(code, daynight);
  
  return (
    <div 
      className={`weather-icon ${className}`}
      style={{
        fontSize: `${size}px`,
        color: theme === 'light' ? '#000' : '#fff'
      }}
      title={`Weather condition: ${code}`}
    >
      <i className={`fas fa-${iconName}`} />
    </div>
  );
};