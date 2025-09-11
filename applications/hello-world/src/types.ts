/**
 * Configuration interface for the Hello World application
 */
export interface AppConfig {
  message: string;
}

/**
 * Application state interface
 */
export interface AppState {
  config: AppConfig;
  isLoading: boolean;
  error: string | null;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: AppConfig = {
  message: "Hello World"
};