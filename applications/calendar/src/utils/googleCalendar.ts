import type { CalendarEvent } from '../types';

const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export class GoogleCalendarAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getCalendarEvents(
    calendarId: string = 'primary',
    maxResults: number = 10
  ): Promise<CalendarEvent[]> {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      orderBy: 'startTime',
      singleEvents: 'true',
      timeMin: now.toISOString(),
      timeMax: endOfDay.toISOString(),
    });

    try {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  async testConnection(calendarId: string = 'primary'): Promise<boolean> {
    try {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/json',
          },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}