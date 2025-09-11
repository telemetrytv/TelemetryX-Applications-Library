import { useState, useEffect } from "react";
import * as sdk from "@telemetryx/sdk";
import type { CalendarSettings } from "../types";
import { GoogleCalendarAPI } from "../utils/googleCalendar";

export function Settings() {
  const store = sdk.store();
  const [settings, setSettings] = useState<CalendarSettings>({
    accessToken: "",
    calendarId: "primary",
    refreshInterval: 60,
    showDescription: true,
    maxEvents: 10,
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadSettings();

    // Cleanup on unmount
    return () => {
      sdk.destroy();
    };
  }, []);

  const loadSettings = async () => {
    try {
      console.log("Loading settings...");
      const storedSettings = (await store.application.get(
        "settings"
      )) as CalendarSettings | null;
      if (storedSettings) {
        setSettings((prev) => ({ ...prev, ...storedSettings }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      console.log("Saving settings!");
      await store.application.set("settings", settings);
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!settings.accessToken) {
      setMessage({ type: "error", text: "Please enter an access token first" });
      return;
    }

    try {
      setTesting(true);
      const api = new GoogleCalendarAPI(settings.accessToken);
      const isValid = await api.testConnection(
        settings.calendarId || "primary"
      );

      if (isValid) {
        setMessage({ type: "success", text: "Connection successful!" });
      } else {
        setMessage({ type: "error", text: "Invalid token or calendar ID" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Connection test failed" });
    } finally {
      setTesting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-light text-white mb-1">
            Calendar Settings
          </h1>
          <p className="text-white/60 text-sm">
            Configure your Google Calendar integration
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-xl border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            } backdrop-blur-sm`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 space-y-6 h-full">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-white/80">
              Google Calendar Access Token
            </label>
            <input
              type="password"
              value={settings.accessToken}
              onChange={(e) =>
                setSettings({ ...settings, accessToken: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none transition-all placeholder-white/30 text-sm"
              placeholder="Enter your access token"
            />
            <p className="text-xs text-white/40 mt-1">
              Obtain an access token from the Google OAuth Playground or Google
              Cloud Console
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-white/80">
              Calendar ID
            </label>
            <input
              type="text"
              value={settings.calendarId}
              onChange={(e) =>
                setSettings({ ...settings, calendarId: e.target.value })
              }
              className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none transition-all placeholder-white/30 text-sm"
              placeholder="primary"
            />
            <p className="text-xs text-white/40 mt-1">
              Use "primary" for your main calendar or enter a specific calendar
              ID
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-white/80">
                Refresh Interval
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      refreshInterval: parseInt(e.target.value) || 60,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none transition-all placeholder-white/30 text-sm"
                  min="30"
                  max="3600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                  seconds
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-white/80">
                Maximum Events
              </label>
              <input
                type="number"
                value={settings.maxEvents}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxEvents: parseInt(e.target.value) || 10,
                  })
                }
                className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none transition-all placeholder-white/30 text-sm"
                min="1"
                max="50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <input
              type="checkbox"
              id="showDescription"
              checked={settings.showDescription}
              onChange={(e) =>
                setSettings({ ...settings, showDescription: e.target.checked })
              }
              className="h-4 w-4 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
            />
            <label
              htmlFor="showDescription"
              className="text-white/80 text-sm cursor-pointer select-none"
            >
              Show event descriptions
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={testConnection}
              disabled={testing}
              className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
            >
              {testing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Testing...
                </span>
              ) : (
                "Test Connection"
              )}
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Settings"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
