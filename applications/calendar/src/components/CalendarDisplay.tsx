import { useState, useEffect } from "react";
import * as sdk from "@telemetryx/sdk";
import type { CalendarEvent, CalendarSettings } from "../types";
import { GoogleCalendarAPI } from "../utils/googleCalendar";

export function CalendarDisplay() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [settings, setSettings] = useState<CalendarSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Loading calendar settings...");
    loadSettings();

    // Subscribe to settings changes
    const setupSubscription = async () => {
      try {
        const store = sdk.store();
        await store.application.subscribe(
          "settings",
          (newSettings: CalendarSettings | undefined) => {
            if (newSettings) {
              setSettings(newSettings);
            }
          }
        );
      } catch (err) {
        console.error("Failed to setup subscription:", err);
      }
    };

    setupSubscription();
  }, []);

  useEffect(() => {
    if (settings.accessToken) {
      fetchEvents();
      const interval = setInterval(
        fetchEvents,
        (settings.refreshInterval || 60) * 1000
      );
      return () => clearInterval(interval);
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      const store = sdk.store();
      const storedSettings = (await store.application.get(
        "settings"
      )) as CalendarSettings | null;
      
      if (storedSettings) {
        setSettings(storedSettings);
      } else {
        // Default settings if none exist
        const defaultSettings: CalendarSettings = {
          accessToken: "",
          calendarId: "primary",
          refreshInterval: 60,
          showDescription: true,
          maxEvents: 20,
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const fetchEvents = async () => {
    console.log("Fetching calendar events...");
    if (!settings.accessToken) {
      setError("No access token configured. Please go to settings.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const api = new GoogleCalendarAPI(settings.accessToken);
      const calendarEvents = await api.getCalendarEvents(
        settings.calendarId || "primary",
        settings.maxEvents || 10
      );
      setEvents(calendarEvents);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch calendar events"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (event: CalendarEvent): string => {
    const startDateTime = event.start.dateTime || event.start.date;
    if (!startDateTime) return "";

    const date = new Date(startDateTime);
    if (event.start.date) {
      return "All day";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (event: CalendarEvent): string => {
    if (!event.start.dateTime || !event.end.dateTime) return "";

    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const duration = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60)
    );

    if (duration < 60) {
      return `${duration}min`;
    }
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-white/80 text-xl font-light">
            Loading calendar...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-white mb-2">
              Unable to Load Calendar
            </h2>
            <p className="text-white/60 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
            <svg
              className="w-12 h-12 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-white/80 mb-2">
            No Events Today
          </h2>
          <p className="text-white/40 text-sm">
            Your calendar is clear for the rest of the day
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-light text-white">Today</h1>
            <div className="text-right">
              <div className="text-white/60 text-xs">
                {new Date().toLocaleDateString("en-US", { weekday: "long" })}
              </div>
              <div className="text-white/80 text-sm">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {events.map((event, index) => {
            const isAllDay = event.start.date && !event.start.dateTime;
            const isCancelled = event.status === "cancelled";

            return (
              <div
                key={event.id}
                className={`group relative bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 ${
                  isCancelled ? "opacity-60" : ""
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`text-center ${
                          isAllDay
                            ? "bg-purple-500/20 px-3 py-1 rounded-lg"
                            : ""
                        }`}
                      >
                        <div
                          className={`${
                            isAllDay ? "text-purple-400" : "text-blue-400"
                          } text-lg font-light self-start align-start text-start`}
                        >
                          {formatTime(event)}
                        </div>
                        {event.start.dateTime && event.end.dateTime && (
                          <div className="text-white/40 text-xs mt-1">
                            {formatDuration(event)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3
                            className={`text-lg font-light text-white mb-1 ${
                              isCancelled ? "line-through" : ""
                            }`}
                          >
                            {event.summary || "Untitled Event"}
                          </h3>

                          {settings.showDescription && event.description && (
                            <p className="text-white/60 text-xs mb-2 line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3 text-xs">
                            {event.location && (
                              <div className="flex items-center text-white/50">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {event.location}
                              </div>
                            )}

                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center text-white/50">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                  />
                                </svg>
                                {event.attendees.length} attendee
                                {event.attendees.length > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>

                        {isCancelled && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
