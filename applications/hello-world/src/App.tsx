import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import * as sdk from '@telemetryx/sdk';
import type { AppConfig } from './types';
import { DEFAULT_CONFIG } from './types';

function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configure the SDK with the application name
    sdk.configure('hello-world');

    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the SDK store API to get the message from application scope
        const store = sdk.store();
        const storedConfig = await store.application.get<AppConfig>('config');
        
        if (storedConfig && storedConfig.message) {
          setConfig(storedConfig);
        } else {
          // Initialize with default config if not found
          setConfig(DEFAULT_CONFIG);
          await store.application.set('config', DEFAULT_CONFIG);
        }
      } catch (err) {
        console.error('Failed to load configuration:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setConfig(DEFAULT_CONFIG);
      } finally {
        setIsLoading(false);
      }
    };

    const setupSubscription = async () => {
      try {
        // Subscribe to changes in the config
        const store = sdk.store();
        await store.application.subscribe('config', (newConfig: AppConfig | undefined) => {
          if (newConfig && newConfig.message) {
            setConfig(newConfig);
          }
        });
      } catch (err) {
        console.error('Failed to setup subscription:', err);
      }
    };

    loadConfig();
    setupSubscription();

    // Cleanup on unmount
    return () => {
      sdk.destroy();
    };
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