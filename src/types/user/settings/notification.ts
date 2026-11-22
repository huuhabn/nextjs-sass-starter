import { z } from 'zod';

export interface NotificationChannelSettings {
  enabled?: boolean;

  items?: Record<string, Record<string, boolean>>;
}

export interface IMPlatformNotificationSettings extends NotificationChannelSettings {
  tenantId?: string;
}

export interface IMNotificationChannelSettings extends NotificationChannelSettings {
  platforms?: Record<string, IMPlatformNotificationSettings>;
}

export interface NotificationContentSettings {
  scheduledTaskSummary?: boolean;
}

export interface NotificationSettings {
  content?: NotificationContentSettings;
  email?: NotificationChannelSettings;

  im?: IMNotificationChannelSettings;
  inbox?: NotificationChannelSettings;

  push?: NotificationChannelSettings;
}

const notificationItemsSchema = z.record(z.string(), z.record(z.string(), z.boolean()));

const notificationChannelSettingsSchema = z
  .object({
    enabled: z.boolean().optional(),
    items: notificationItemsSchema.optional()
  })
  .strict();

export const NotificationSettingsSchema = z
  .object({
    content: z.object({ scheduledTaskSummary: z.boolean().optional() }).strict().optional(),
    email: notificationChannelSettingsSchema.optional(),
    im: notificationChannelSettingsSchema
      .extend({
        platforms: z
          .record(
            z.string(),
            notificationChannelSettingsSchema.extend({ tenantId: z.string().optional() }).strict()
          )
          .optional()
      })
      .strict()
      .optional(),
    inbox: notificationChannelSettingsSchema.optional(),
    push: notificationChannelSettingsSchema.optional()
  })
  .strict();
