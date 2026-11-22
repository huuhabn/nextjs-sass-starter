import { and, desc, eq, gt, or, isNull } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';

import type { ApiKeyItem, NewApiKey } from '../schemas/apiKey';
import { apiKeys } from '../schemas/apiKey';
import type { AppDatabase } from '../type';

const generateKeyString = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  32
);

export class ApiKeyModel {
  private userId: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: {
    name: string;
    key?: string;
    expiresAt?: Date | null;
  }): Promise<ApiKeyItem> => {
    const key = params.key ?? `sk-${generateKeyString()}`;

    const [created] = await this.db
      .insert(apiKeys)
      .values({
        name: params.name,
        key,
        userId: this.userId,
        expiresAt: params.expiresAt ?? null,
        enabled: true
      })
      .returning();

    return created;
  };

  findById = async (id: number): Promise<ApiKeyItem | undefined> => {
    return this.db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.id, id), eq(apiKeys.userId, this.userId))
    });
  };

  findByKey = async (key: string): Promise<ApiKeyItem | undefined> => {
    const now = new Date();
    return this.db.query.apiKeys.findFirst({
      where: and(
        eq(apiKeys.key, key),
        eq(apiKeys.enabled, true),
        or(isNull(apiKeys.expiresAt), gt(apiKeys.expiresAt, now))
      )
    });
  };

  list = async (options?: { limit?: number; offset?: number }): Promise<ApiKeyItem[]> => {
    return this.db.query.apiKeys.findMany({
      where: eq(apiKeys.userId, this.userId),
      orderBy: [desc(apiKeys.createdAt)],
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0
    });
  };

  touchLastUsed = async (id: number): Promise<void> => {
    await this.db
      .update(apiKeys)
      .set({ lastUsedAt: new Date(), accessedAt: new Date() })
      .where(eq(apiKeys.id, id));
  };

  update = async (
    id: number,
    params: Partial<Pick<NewApiKey, 'name' | 'enabled' | 'expiresAt'>>
  ): Promise<ApiKeyItem | undefined> => {
    const [updated] = await this.db
      .update(apiKeys)
      .set({ ...params, updatedAt: new Date(), accessedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, this.userId)))
      .returning();

    return updated;
  };

  delete = async (id: number): Promise<void> => {
    await this.db.delete(apiKeys).where(and(eq(apiKeys.id, id), eq(apiKeys.userId, this.userId)));
  };
}
