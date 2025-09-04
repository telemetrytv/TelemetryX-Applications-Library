# Weather Application

A dynamic weather display application for TelemetryX digital signage, providing real-time weather information with customizable layouts and themes.

## Features

- **Real-time Weather Data**: Current conditions with automatic updates
- **Weather Forecasts**: Multi-day forecasts with detailed information
- **Weather Alerts**: Severe weather warnings and notifications
- **Multiple Layouts**: Compact, full, and minimal display modes
- **Auto Location**: Automatic location detection using device location
- **Offline Support**: Cached data for network interruptions
- **Customizable Themes**: Light, dark, and auto themes
- **Multi-language Support**: Localized weather descriptions

## Configuration

```json
{
  "location": "auto",
  "units": "imperial",
  "showForecast": true,
  "forecastDays": 5,
  "showAlerts": true,
  "theme": "auto",
  "layout": "full",
  "refreshInterval": 600000,
  "language": "en"
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `location` | string \| 'auto' | 'auto' | Location for weather data (city name, zip, or 'auto' for device location) |
| `units` | 'metric' \| 'imperial' | 'imperial' | Temperature and measurement units |
| `showForecast` | boolean | true | Display weather forecast |
| `forecastDays` | number | 5 | Number of forecast days (1-7) |
| `showAlerts` | boolean | true | Display weather alerts |
| `theme` | 'light' \| 'dark' \| 'auto' | 'auto' | Color theme |
| `layout` | 'compact' \| 'full' \| 'minimal' | 'full' | Display layout style |
| `refreshInterval` | number | 600000 | Update interval in milliseconds |
| `language` | string | 'en' | Language code for descriptions |

## Layouts

### Full Layout
Complete weather display with current conditions, extended forecast, and detailed metrics.

### Compact Layout
Condensed view optimized for smaller display zones or ticker areas.

### Minimal Layout
Essential weather information only - temperature and conditions.

## Data Sources

The application supports multiple weather data sources:

1. **TelemetryX Weather Service**: Primary data source via SDK
2. **OpenWeatherMap API**: Fallback with API key configuration
3. **Cached Data**: Offline fallback using last known data

## Usage

### Basic Implementation

```typescript
import { WeatherApp } from '@telemetryx/app-weather';

const config = {
  location: 'New York, NY',
  units: 'imperial',
  layout: 'full',
  theme: 'dark'
};

<WeatherApp config={config} />
```

### With TelemetryX SDK

```typescript
import { TelemetryX } from '@telemetryx/sdk';
import { WeatherApp } from '@telemetryx/app-weather';

// Use device location
const device = await TelemetryX.device.getInfo();

const config = {
  location: `${device.location.lat},${device.location.lon}`,
  units: device.region === 'US' ? 'imperial' : 'metric'
};

<WeatherApp config={config} />
```

## Styling

The application includes CSS variables for customization:

```css
:root {
  --weather-primary: #2196f3;
  --weather-background: #ffffff;
  --weather-text: #333333;
  --weather-border-radius: 8px;
  --weather-font-size-base: 16px;
  --weather-font-size-large: 24px;
  --weather-font-size-xlarge: 48px;
}
```

## Performance

- Optimized for 24/7 operation
- Memory-efficient data caching
- Automatic cleanup of old data
- Debounced API calls
- Progressive loading of forecast data

## Error Handling

- Graceful degradation with cached data
- User-friendly error messages
- Automatic retry with exponential backoff
- Telemetry logging for monitoring

## License

MIT