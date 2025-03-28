
export interface MailgunConfig {
  apiKey: string;
  domain: string;
  from: string;
}

export interface EmailData {
  subject: string;
  htmlContent: string;
}

export interface ContactData {
  email: string;
  name?: string;
  variables?: Record<string, string>;
}

export interface ScheduleConfig {
  emailsPerHour: number;
  batchSize: number;
  intervalBetweenBatches: number; // in minutes
}

export interface SendProgressData {
  totalContacts: number;
  sentEmails: number;
  failedEmails: number;
  inProgress: boolean;
  logs: {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error';
  }[];
}
