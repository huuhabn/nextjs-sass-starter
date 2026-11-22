import { boolean, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { createdAt, timestamptz, updatedAt } from './_helpers';
import { users } from './user';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    dedupeKey: text('dedupe_key'),
    actionUrl: text('action_url'),
    isRead: boolean('is_read').default(false).notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    index('idx_notifications_user').on(t.userId),
    index('idx_notifications_user_active').on(t.userId, t.createdAt),
    index('idx_notifications_user_unread').on(t.userId),
    uniqueIndex('idx_notifications_dedupe').on(t.userId, t.dedupeKey),
    index('idx_notifications_archived_cleanup').on(t.updatedAt, t.createdAt, t.id)
  ]
);

export const notificationDeliveries = pgTable(
  'notification_deliveries',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    notificationId: uuid('notification_id')
      .notNull()
      .references(() => notifications.id, { onDelete: 'cascade' }),
    channel: text('channel').notNull(),
    status: text('status').notNull(),
    providerMessageId: text('provider_message_id'),
    failedReason: text('failed_reason'),
    sentAt: timestamptz('sent_at'),
    createdAt: createdAt()
  },
  (t) => [
    index('idx_deliveries_notification').on(t.notificationId),
    index('idx_deliveries_channel').on(t.channel),
    index('idx_deliveries_status').on(t.status)
  ]
);

export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);
export type NotificationItem = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export const insertNotificationDeliverySchema = createInsertSchema(notificationDeliveries);
export const selectNotificationDeliverySchema = createSelectSchema(notificationDeliveries);
export type NotificationDeliveryItem = typeof notificationDeliveries.$inferSelect;
export type NewNotificationDelivery = typeof notificationDeliveries.$inferInsert;
