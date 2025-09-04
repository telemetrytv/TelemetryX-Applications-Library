import { WeatherData, WeatherConfig, WeatherIconMapping, WeatherBackgrounds, TemperatureUnit, WindDirection } from '../types';

// AccuWeather to FontAwesome icon mapping (based on legacy code)
export const weatherIconMapping: WeatherIconMapping = {
  '1': 'sun',
  '2': 'sun',
  '3': 'sun-cloud',
  '4': 'sun-cloud',
  '5': 'sun-haze',
  '6': 'cloud-sun',
  '7': 'clouds-sun',
  '8': 'clouds',
  '11': 'fog',
  '12': 'cloud-showers',
  '13': 'cloud-drizzle',
  '14': 'cloud-sun-rain',
  '15': 'thunderstorm',
  '16': 'thunderstorm',
  '17': 'thunderstorm-sun',
  '18': 'cloud-rain',
  '19': 'cloud-snow',
  '20': 'cloud-snow',
  '21': 'cloud-sun-rain',
  '22': 'snowflake',
  '23': 'snowflake',
  '24': 'cloud-hail',
  '25': 'cloud-sleet',
  '26': 'cloud-hail-mixed',
  '29': 'cloud-sleet',
  '30': 'temperature-hot',
  '31': 'temperature-frigid',
  '32': 'wind',
  '33': 'moon-stars',
  '34': 'moon-stars',
  '35': 'moon-cloud',
  '36': 'cloud-moon',
  '37': 'clouds-moon',
  '38': 'clouds-moon',
  '39': 'cloud-moon-rain',
  '40': 'cloud-moon-rain',
  '41': 'thunderstorm-moon',
  '42': 'thunderstorm-moon',
  '43': 'cloud-snow',
  '44': 'snowflake'
};

// Weather backgrounds for photo theme (based on legacy code)
export const weatherBackgrounds: WeatherBackgrounds = {
  '1': { name: 'Sunny', image: 'fair_day' },
  '2': { name: 'Mostly Sunny', image: 'sunny1' },
  '3': { name: 'Partly Sunny', image: 'sunny1' },
  '4': { name: 'Intermittent Clouds', image: 'clouds1' },
  '5': { name: 'Hazy Sunshine', image: 'fog1' },
  '6': { name: 'Mostly Cloudy', image: 'clouds2' },
  '7': { name: 'Cloudy', image: 'clouds2' },
  '8': { name: 'Dreary (Overcast)', image: 'clouds3' },
  '11': { name: 'Fog', image: 'fog4' },
  '12': { name: 'Showers', image: 'rain_light2' },
  '13': { name: 'Mostly Cloudy w/ Showers', image: 'rain_light2' },
  '14': { name: 'Partly Sunny w/ Showers', image: 'rain_light1' },
  '15': { name: 'T-Storms', image: 'storm3' },
  '16': { name: 'Mostly Cloudy w/ T-Storms', image: 'storm2' },
  '17': { name: 'Partly Sunny w/ T-Storms ', image: 'storm1' },
  '18': { name: 'Rain', image: 'rain_heavy1' },
  '19': { name: 'Flurries', image: 'snow3' },
  '20': { name: 'Mostly Cloudy w/ Flurries', image: 'snow2' },
  '21': { name: 'Partly Sunny w/ Flurries', image: 'snow1' },
  '22': { name: 'Snow', image: 'snow_heavy2' },
  '23': { name: 'Mostly Cloudy w/ Snow', image: 'snow_heavy1' },
  '24': { name: 'Ice', image: 'snow_detail1' },
  '25': { name: 'Sleet', image: 'snow_detail1' },
  '26': { name: 'Freezing Rain', image: 'rain_heavy1' },
  '29': { name: 'Rain and Snow', image: 'snow2' },
  '30': { name: 'Hot', image: 'sunny3' },
  '31': { name: 'Cold', image: 'snow_heavy1' },
  '32': { name: 'Windy', image: 'windy1' },
  '33': { name: 'Clear (night)', image: 'fair_night' },
  '34': { name: 'Mostly Clear (night)', image: 'fair_night' },
  '35': { name: 'Partly Cloudy (night)', image: 'clouds_night1' },
  '36': { name: 'Intermittent Clouds (night)', image: 'clouds_night1' },
  '37': { name: 'Hazy Moonlight', image: 'clouds_night1' },
  '38': { name: 'Mostly Cloudy (night)', image: 'clouds_night1' },
  '39': { name: 'Partly Cloudy w/ Showers (night)', image: 'clouds_night1' },
  '40': { name: 'Mostly Cloudy w/ Showers (night)', image: 'rain_light2' },
  '41': { name: 'Partly Cloudy w/ T-Storms (night)', image: 'storm1' },
  '42': { name: 'Mostly Cloudy w/ T-Storms (night)', image: 'storm2' },
  '43': { name: 'Mostly Cloudy w/ Flurries (night)', image: 'snow1' },
  '44': { name: 'Mostly Cloudy w/ Snow (night)', image: 'snow2' }
};

// Light theme backgrounds (where text should be dark)
export const lightThemeBackgrounds = [
  'snow3',
  'fog4', 
  'windy1',
  'snow_heavy1',
  'clouds3',
  'clouds1',
  'sunny1',
  'sunny2',
  'snow1'
];

export class WeatherService {
  
  static getWeatherIcon(code: number | string, daynight: 'd' | 'n' = 'd'): string {
    const iconKey = `${code}`;
    let icon = weatherIconMapping[iconKey] || 'cloud';
    
    // Handle day/night specific icons
    if (daynight === 'n') {
      switch (iconKey) {
        case '3':
        case '4':
          icon = 'moon-cloud';
          break;
        case '6':
          icon = 'cloud-moon';
          break;
        case '7':
          icon = 'clouds-moon';
          break;
        case '14':
          icon = 'cloud-moon-rain';
          break;
        case '17':
          icon = 'thunderstorm-moon';
          break;
        case '21':
          icon = 'cloud-moon-rain';
          break;
        case '41':
        case '42':
          icon = 'thunderstorm-moon';
          break;
      }
    }
    
    return icon;
  }
  
  static getWeatherBackground(code: number | string): string {
    const bg = weatherBackgrounds[`${code}`];
    return bg ? bg.image : 'sunny3';
  }
  
  static isLightThemeBackground(backgroundImage: string): boolean {
    return lightThemeBackgrounds.includes(backgroundImage);
  }
  
  static getWindDirection(degrees: number): WindDirection {
    const directions: WindDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }
  
  static formatWindSpeed(speed: number, unit: TemperatureUnit): string {
    return unit === 'f' ? `${Math.round(speed)} mi/h` : `${Math.round(speed)} m/s`;
  }
  
  static formatPressure(pressure: number): string {
    return `${Math.round(pressure)}`;
  }
  
  static needsFahrenheit(country: string): boolean {
    return country === 'United States' || country === 'US';
  }
  
  static sanitizeLocation(location: string): string {
    return location.replace(/[^a-zA-Z\s,]/g, '').trim();
  }
  
  static isValidLatLong(latLong: string): boolean {
    const latLongRegex = /^([-+]?)([\d]{1,2}(?:\.[\d]+)?(?:[NS])?)(?:\s|,\s*)+([-+]?)([\d]{1,3}(?:\.[\d]+)?(?:[EW])?)$/i;
    return latLongRegex.test(latLong);
  }
  
  static isPostalCode(str: string): boolean {
    if (!str?.trim().length) return false;
    return /\d+/.test(str);
  }
  
  static formatTemperature(temp: number, unit: TemperatureUnit): string {
    return `${Math.round(temp)}°${unit.toUpperCase()}`;
  }
  
  static formatTime(timestamp: number, show24hr: boolean, timezone?: string): string {
    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !show24hr,
      timeZone: timezone
    };
    return date.toLocaleTimeString('en-US', options);
  }
  
  static formatDate(timestamp: number, useMDYFormat: boolean, timezone?: string): string {
    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      timeZone: timezone
    };
    
    if (useMDYFormat) {
      return date.toLocaleDateString('en-US', options);
    } else {
      return date.toLocaleDateString('en-GB', options);
    }
  }
  
  static formatWeekday(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  static getBlueSkiesGradient(code: number | string, daynight: 'd' | 'n'): string {
    const codeStr = `${code}`;
    
    if (daynight === 'n') {
      return 'linear-gradient(180deg, #0E0B13 5%, #191423 60%, #201A2C 90%)';
    }
    
    // Clear sky conditions
    if (['1', '2', '800', '801', '802'].includes(codeStr)) {
      return 'linear-gradient(180deg, #0056AD 5%, #0087E5 60%, #3EB0FE 90%)';
    }
    
    // Cloudy conditions
    if (['3', '4', '6', '7', '8', '803', '804'].includes(codeStr)) {
      return 'linear-gradient(180deg, #3F70A0 5%, #4683AD 60%, #6DA7CE 90%)';
    }
    
    // Rainy conditions
    if (['12', '13', '14', '18', '26', '29', '39', '40'].includes(codeStr) || 
        (parseInt(codeStr) >= 300 && parseInt(codeStr) <= 321) || 
        (parseInt(codeStr) >= 500 && parseInt(codeStr) < 600)) {
      return 'linear-gradient(180deg, #283038 5%, #304554 60%, #415D71 90%)';
    }
    
    // Foggy conditions
    if (['5', '11', '37'].includes(codeStr) || 
        ['701', '711', '721', '741', '762'].includes(codeStr)) {
      return 'linear-gradient(180deg, #4A5862 5%, #7D8890 60%, #AAB7BF 90%)';
    }
    
    // Dust conditions
    if (['30'].includes(codeStr) || 
        ['731', '751', '761'].includes(codeStr)) {
      return 'linear-gradient(180deg, #A66020 5%, #C58044 60%, #C79D73 90%)';
    }
    
    // Storm conditions
    if (['15', '16', '17', '41', '42'].includes(codeStr) || 
        (parseInt(codeStr) >= 200 && parseInt(codeStr) < 300)) {
      return 'linear-gradient(180deg, #111 5%, #212121 60%, #2F3335 90%)';
    }
    
    // Snow conditions
    if (['19', '20', '21', '22', '23', '24', '25', '31', '43', '44'].includes(codeStr) || 
        (parseInt(codeStr) >= 601 && parseInt(codeStr) < 700)) {
      return 'linear-gradient(180deg, #636886 5%, #84889E 60%, #9DA1B8 90%)';
    }
    
    // Default gradient
    return 'linear-gradient(180deg, #262835 5%, #2F3241 60%, #333647 90%)';
  }
}