import React, { useState, useEffect } from 'react';

interface ClockProps {
  timezone?: string;
  show24hr?: boolean;
  darkMode?: boolean;
  className?: string;
}

export const Clock: React.FC<ClockProps> = ({
  timezone,
  show24hr = false,
  darkMode = false,
  className = ''
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      second: undefined,
      hour12: !show24hr,
      timeZone: timezone
    };

    return date.toLocaleTimeString('en-US', options);
  };

  const formattedTime = formatTime(time);
  const [mainTime, period] = show24hr ? [formattedTime, ''] : formattedTime.split(' ');

  return (
    <div className={`simple-clock ${className}`} style={{ color: darkMode ? '#000' : 'inherit' }}>
      <div className="time-wrapper">
        <span className="time">{mainTime}</span>
        {period && <span className="apm">{period}</span>}
      </div>
    </div>
  );
};