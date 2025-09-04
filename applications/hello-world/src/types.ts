export interface AppConfig {
  message: string;
}

export interface AppState {
  config: AppConfig;
  isLoading: boolean;
  error: string | null;
}

export const DEFAULT_CONFIG: AppConfig = {
  message: "Hello World"
};