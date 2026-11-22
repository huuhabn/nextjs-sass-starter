import { and, desc, eq } from 'drizzle-orm';

import type { NewSubscription, SubscriptionItem } from '../schemas/billing';
import { subscriptions } from '../schemas/billing';
import type { AppDatabase } from '../type';
import type { SubscriptionStatus } from '@/types';
import { idGenerator } from '../utils/idGenerator';

export class SubscriptionModel {
  private userId?: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, userId?: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (
    params: Omit<NewSubscription, 'id' | 'userId'> & { id?: string; userId?: string }
  ): Promise<SubscriptionItem> => {
    const userId = params.userId || this.userId;
    if (!userId) {
      throw new Error('UserId is required to create a subscription');
    }

    const id = params.id ?? idGenerator('subscription');

    const [created] = await this.db
      .insert(subscriptions)
      .values({
        ...params,
        id,
        userId
      })
      .returning();

    return created;
  };

  findById = async (id: string): Promise<SubscriptionItem | undefined> => {
    return this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id)
    });
  };

  findByUserId = async (userId?: string): Promise<SubscriptionItem | undefined> => {
    const uid = userId || this.userId;
    if (!uid) return undefined;

    return this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, uid),
      orderBy: [desc(subscriptions.createdAt)]
    });
  };

  findByStripeSubscriptionId = async (
    stripeSubscriptionId: string
  ): Promise<SubscriptionItem | undefined> => {
    return this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId)
    });
  };

  listByUser = async (userId?: string): Promise<SubscriptionItem[]> => {
    const uid = userId || this.userId;
    if (!uid) return [];

    return this.db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, uid),
      orderBy: [desc(subscriptions.createdAt)]
    });
  };

  update = async (
    id: string,
    params: Partial<Omit<NewSubscription, 'id' | 'userId' | 'stripeSubscriptionId'>>
  ): Promise<SubscriptionItem | undefined> => {
    const [updated] = await this.db
      .update(subscriptions)
      .set(params)
      .where(eq(subscriptions.id, id))
      .returning();

    return updated;
  };

  updateByStripeSubscriptionId = async (
    stripeSubscriptionId: string,
    params: Partial<Omit<NewSubscription, 'id' | 'stripeSubscriptionId'>>
  ): Promise<SubscriptionItem | undefined> => {
    const [updated] = await this.db
      .update(subscriptions)
      .set(params)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .returning();

    return updated;
  };

  cancel = async (id: string, cancelAtPeriodEnd = true): Promise<SubscriptionItem | undefined> => {
    const [canceled] = await this.db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd,
        canceledAt: new Date(),
        status: cancelAtPeriodEnd ? 'active' : 'canceled'
      })
      .where(eq(subscriptions.id, id))
      .returning();

    return canceled;
  };
}
