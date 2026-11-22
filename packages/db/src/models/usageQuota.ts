import { and, eq, sql } from 'drizzle-orm';

import type { NewUserUsageQuota, UserUsageQuotaItem } from '../schemas/billing';
import { userUsageQuotas } from '../schemas/billing';
import type { AppDatabase } from '../type';
import { idGenerator } from '../utils/idGenerator';

export class UsageQuotaModel {
  private userId?: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, userId?: string) {
    this.userId = userId;
    this.db = db;
  }

  getQuota = async (
    featureKey: string,
    userId?: string
  ): Promise<UserUsageQuotaItem | undefined> => {
    const uid = userId || this.userId;
    if (!uid) return undefined;

    return this.db.query.userUsageQuotas.findFirst({
      where: and(eq(userUsageQuotas.userId, uid), eq(userUsageQuotas.featureKey, featureKey))
    });
  };

  setQuota = async (params: {
    featureKey: string;
    limitAmount: number;
    resetAt?: Date | null;
    userId?: string;
  }): Promise<UserUsageQuotaItem> => {
    const uid = params.userId || this.userId;
    if (!uid) {
      throw new Error('UserId is required to set usage quota');
    }

    const existing = await this.getQuota(params.featureKey, uid);

    if (existing) {
      const [updated] = await this.db
        .update(userUsageQuotas)
        .set({
          limitAmount: params.limitAmount,
          ...(params.resetAt !== undefined ? { resetAt: params.resetAt } : {})
        })
        .where(eq(userUsageQuotas.id, existing.id))
        .returning();

      return updated;
    }

    const id = idGenerator('quota');
    const [created] = await this.db
      .insert(userUsageQuotas)
      .values({
        id,
        userId: uid,
        featureKey: params.featureKey,
        limitAmount: params.limitAmount,
        usedAmount: 0,
        resetAt: params.resetAt ?? null
      })
      .returning();

    return created;
  };

  consume = async (
    featureKey: string,
    amount = 1,
    userId?: string
  ): Promise<{ success: boolean; quota?: UserUsageQuotaItem }> => {
    const uid = userId || this.userId;
    if (!uid) return { success: false };

    const quota = await this.getQuota(featureKey, uid);
    if (!quota) return { success: false };

    if (quota.usedAmount + amount > quota.limitAmount) {
      return { success: false, quota };
    }

    const [updated] = await this.db
      .update(userUsageQuotas)
      .set({
        usedAmount: sql`${userUsageQuotas.usedAmount} + ${amount}`
      })
      .where(eq(userUsageQuotas.id, quota.id))
      .returning();

    return { success: true, quota: updated };
  };

  checkLimit = async (
    featureKey: string,
    requestedAmount = 1,
    userId?: string
  ): Promise<boolean> => {
    const uid = userId || this.userId;
    if (!uid) return false;

    const quota = await this.getQuota(featureKey, uid);
    if (!quota) return false;

    return quota.usedAmount + requestedAmount <= quota.limitAmount;
  };

  resetQuota = async (
    featureKey: string,
    userId?: string
  ): Promise<UserUsageQuotaItem | undefined> => {
    const uid = userId || this.userId;
    if (!uid) return undefined;

    const quota = await this.getQuota(featureKey, uid);
    if (!quota) return undefined;

    const [updated] = await this.db
      .update(userUsageQuotas)
      .set({ usedAmount: 0 })
      .where(eq(userUsageQuotas.id, quota.id))
      .returning();

    return updated;
  };

  listByUser = async (userId?: string): Promise<UserUsageQuotaItem[]> => {
    const uid = userId || this.userId;
    if (!uid) return [];

    return this.db.query.userUsageQuotas.findMany({
      where: eq(userUsageQuotas.userId, uid)
    });
  };
}
