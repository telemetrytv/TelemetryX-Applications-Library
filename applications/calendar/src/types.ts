export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  status?: string;
  htmlLink?: string;
}

export interface CalendarSettings {
  accessToken?: string;
  calendarId?: string;
  refreshInterval?: number;
  showDescription?: boolean;
  maxEvents?: number;
}