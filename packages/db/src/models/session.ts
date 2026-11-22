import { and, desc, eq } from 'drizzle-orm';

import type { NewSession, SessionItem } from '../schemas/session';
import { sessions } from '../schemas/session';
import type { AppDatabase } from '../type';
import { idGenerator, randomSlug } from '../utils/idGenerator';

export class SessionModel {
  private userId: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Partial<NewSession> & { title?: string }): Promise<SessionItem> => {
    const id = params.id ?? idGenerator('sessions');
    const slug = params.slug ?? randomSlug('session');

    const [created] = await this.db
      .insert(sessions)
      .values({
        id,
        slug,
        userId: this.userId,
        ...params
      } as NewSession)
      .returning();

    return created;
  };

  findById = async (id: string): Promise<SessionItem | undefined> => {
    return this.db.query.sessions.findFirst({
      where: and(eq(sessions.id, id), eq(sessions.userId, this.userId))
    });
  };

  findBySlug = async (slug: string): Promise<SessionItem | undefined> => {
    return this.db.query.sessions.findFirst({
      where: and(eq(sessions.slug, slug), eq(sessions.userId, this.userId))
    });
  };

  list = async (options?: {
    limit?: number;
    offset?: number;
    pinned?: boolean;
    groupId?: string;
  }): Promise<SessionItem[]> => {
    const conditions = [eq(sessions.userId, this.userId)];

    if (options?.pinned !== undefined) {
      conditions.push(eq(sessions.pinned, options.pinned));
    }

    if (options?.groupId !== undefined) {
      conditions.push(eq(sessions.groupId, options.groupId));
    }

    return this.db.query.sessions.findMany({
      where: and(...conditions),
      orderBy: [desc(sessions.pinned), desc(sessions.updatedAt)],
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0
    });
  };

  update = async (id: string, params: Partial<NewSession>): Promise<SessionItem | undefined> => {
    const [updated] = await this.db
      .update(sessions)
      .set({ ...params, updatedAt: new Date() })
      .where(and(eq(sessions.id, id), eq(sessions.userId, this.userId)))
      .returning();

    return updated;
  };

  delete = async (id: string): Promise<void> => {
    await this.db
      .delete(sessions)
      .where(and(eq(sessions.id, id), eq(sessions.userId, this.userId)));
  };

  pin = async (id: string, pinned: boolean = true): Promise<SessionItem | undefined> => {
    return this.update(id, { pinned });
  };
}
