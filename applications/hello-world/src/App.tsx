import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { AppConfig } from './types';
import { DEFAULT_CONFIG } from './types';

declare global {
  interface Window {
    telemetryX?: {
      storage?: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<void>;
        onChange: (callback: (key: string, value: unknown) => void) => void;
      };
    };
  }
}

class AppErrorBoundary extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppErrorBoundary';
  }
}

function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (window.telemetryX?.storage) {
          const storedMessage = await window.telemetryX.storage.get('message');
          if (typeof storedMessage === 'string') {
            setConfig({ message: storedMessage });
          } else {
            setConfig(DEFAULT_CONFIG);
            await window.telemetryX.storage.set('message', DEFAULT_CONFIG.message);
          }
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      } catch (err) {
        console.error('Failed to load configuration:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setConfig(DEFAULT_CONFIG);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();

    if (window.telemetryX?.storage) {
      window.telemetryX.storage.onChange((key: string, value: unknown) => {
        if (key === 'message' && typeof value === 'string') {
          setConfig(prev => ({ ...prev, message: value }));
        }
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl border-destructive">
          <CardContent className="text-center p-12">
            <div className="text-destructive mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">Falling back to default message...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardContent className="text-center p-16">
          <div className="space-y-6">
            <div className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              {config.message}
            </div>
            <p className="text-xl text-muted-foreground">
              Welcome to TelemetryX Hello World Application
            </p>
            <div className="text-sm text-muted-foreground opacity-75 mt-8">
              <p>Powered by TelemetryX SDK • Built with React & TypeScript</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;