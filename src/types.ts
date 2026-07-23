export type AssistantState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export interface WebsiteAction {
  id: string;
  url: string;
  siteName: string;
  timestamp: number;
}

export interface SystemAlarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  fired?: boolean;
}

export interface ScheduledReminder {
  id: string;
  reminderText: string;
  triggerTimestamp: number;
  fired: boolean;
}

export interface EmittedEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: number;
}

export interface RecordedVideo {
  id: string;
  timestamp: number;
  url: string;
}
