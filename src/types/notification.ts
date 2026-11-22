export type ApnsEnvironment = 'production' | 'sandbox';

export type NotificationCategory = 'system' | 'workspace' | 'billing' | 'account' | string;
export type NotificationChannel = 'email' | 'in_app' | 'slack' | string;
export type NotificationDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | string;

export interface NotificationActor {
  avatar?: string;
  name?: string;
  userId?: string;
}

export interface NotificationAgent {
  avatar?: string;
  backgroundColor?: string;
  id: string;
  name?: string;
}

export interface NotificationMetadata {
  actor?: NotificationActor;
  agent?: NotificationAgent;
  transfer?: { requestId: string };
  [key: string]: unknown;
}
