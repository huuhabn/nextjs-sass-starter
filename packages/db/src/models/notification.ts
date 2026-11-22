import { and, desc, eq } from 'drizzle-orm';

import type {
  NewNotification,
  NewNotificationDelivery,
  NotificationDeliveryItem,
  NotificationItem
} from '../schemas/notification';
import { notificationDeliveries, notifications } from '../schemas/notification';
import type { AppDatabase } from '../type';

export class NotificationModel {
  private userId: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (
    params: Omit<NewNotification, 'userId'> & { userId?: string }
  ): Promise<NotificationItem> => {
    // Idempotency check via dedupeKey
    if (params.dedupeKey) {
      const existing = await this.db.query.notifications.findFirst({
        where: and(
          eq(notifications.userId, params.userId ?? this.userId),
          eq(notifications.dedupeKey, params.dedupeKey)
        )
      });
      if (existing) return existing;
    }

    const [created] = await this.db
      .insert(notifications)
      .values({
        userId: params.userId ?? this.userId,
        ...params
      } as NewNotification)
      .returning();

    return created;
  };

  list = async (options?: {
    category?: string;
    unreadOnly?: boolean;
    includeArchived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NotificationItem[]> => {
    const conditions = [eq(notifications.userId, this.userId)];

    if (options?.category) {
      conditions.push(eq(notifications.category, options.category));
    }

    if (options?.unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    if (!options?.includeArchived) {
      conditions.push(eq(notifications.isArchived, false));
    }

    return this.db.query.notifications.findMany({
      where: and(...conditions),
      orderBy: [desc(notifications.createdAt)],
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0
    });
  };

  markAsRead = async (id: string): Promise<NotificationItem | undefined> => {
    const [updated] = await this.db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, this.userId)))
      .returning();

    return updated;
  };

  markAllAsRead = async (): Promise<void> => {
    await this.db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(notifications.userId, this.userId), eq(notifications.isRead, false)));
  };

  archive = async (id: string): Promise<NotificationItem | undefined> => {
    const [updated] = await this.db
      .update(notifications)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, this.userId)))
      .returning();

    return updated;
  };

  addDelivery = async (params: NewNotificationDelivery): Promise<NotificationDeliveryItem> => {
    const [created] = await this.db.insert(notificationDeliveries).values(params).returning();

    return created;
  };

  getDeliveries = async (notificationId: string): Promise<NotificationDeliveryItem[]> => {
    return this.db.query.notificationDeliveries.findMany({
      where: eq(notificationDeliveries.notificationId, notificationId),
      orderBy: [desc(notificationDeliveries.createdAt)]
    });
  };
}
