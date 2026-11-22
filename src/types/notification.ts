export type ApnsEnvironment = 'production' | 'sandbox';

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
}
