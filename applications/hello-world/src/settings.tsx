import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { configure, destroy, store } from '@telemetryx/sdk';
import type { AppConfig } from './types';
import { DEFAULT_CONFIG } from './types';
import { Settings } from 'lucide-react';

function SettingsApp() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Configure the SDK with the application name
    configure('hello-world');

    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the SDK store API to get the config from application scope
        const s = store();
        const storedConfig = await s.application.get<AppConfig>('config');
        
        if (storedConfig && storedConfig.message) {
          setConfig(storedConfig);
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      } catch (err) {
        console.error('Failed to load configuration:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        setConfig(DEFAULT_CONFIG);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();

    // Cleanup on unmount
    return () => {
      destroy();
    };
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Use the SDK store API to save the config to application scope
      const s = store();
      await s.application.set('config', config);
      
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setError(null);
    setSuccessMessage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-2 text-center justify-center mb-8">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Hello World Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Configuration</CardTitle>
            <CardDescription>
              Customize the message displayed in your Hello World application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="message">Display Message</Label>
              <Input
                id="message"
                type="text"
                value={config.message}
                onChange={(e) => setConfig(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your custom message"
                className="w-full"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Enter the text you want to display (max 100 characters)
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-destructive mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-50 p-3">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !config.message.trim()}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={isSaving}
              >
                Reset to Default
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>
              This is how your message will appear in the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 text-center">
              <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {config.message || 'Enter a message above'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Application:</strong> Hello World</p>
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Platform:</strong> TelemetryX</p>
              <p><strong>Technology:</strong> React + TypeScript + Tailwind CSS</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsApp;