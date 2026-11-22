import { eq } from 'drizzle-orm';

import { UserNotFoundError } from '../errors';
import type { NewUser, NewUserSettings, UserItem, UserSettingsItem } from '../schemas/user';
import { users, userSettings } from '../schemas/user';
import type { AppDatabase } from '../type';
import type { UserPreference } from '@/types';

export class UserModel {
  private userId?: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, userId?: string) {
    this.db = db;
    this.userId = userId;
  }

  findById = async (id: string = this.userId!): Promise<UserItem | undefined> => {
    if (!id) return undefined;
    return this.db.query.users.findFirst({
      where: eq(users.id, id)
    });
  };

  findByEmail = async (email: string): Promise<UserItem | undefined> => {
    return this.db.query.users.findFirst({
      where: eq(users.email, email)
    });
  };

  findByUsername = async (username: string): Promise<UserItem | undefined> => {
    return this.db.query.users.findFirst({
      where: eq(users.username, username)
    });
  };

  createUser = async (params: NewUser): Promise<UserItem> => {
    const [result] = await this.db.insert(users).values(params).returning();
    return result;
  };

  updateUser = async (id: string = this.userId!, params: Partial<NewUser>): Promise<UserItem> => {
    const [result] = await this.db
      .update(users)
      .set({ ...params, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!result) throw new UserNotFoundError();
    return result;
  };

  deleteUser = async (id: string = this.userId!): Promise<void> => {
    await this.db.delete(users).where(eq(users.id, id));
  };

  getUserSettings = async (id: string = this.userId!): Promise<UserSettingsItem | undefined> => {
    return this.db.query.userSettings.findFirst({
      where: eq(userSettings.id, id)
    });
  };

  updateUserSettings = async (
    id: string = this.userId!,
    params: Partial<NewUserSettings>
  ): Promise<UserSettingsItem> => {
    const existing = await this.getUserSettings(id);
    if (!existing) {
      const [created] = await this.db
        .insert(userSettings)
        .values({ id, ...params })
        .returning();
      return created;
    }

    const [updated] = await this.db
      .update(userSettings)
      .set(params)
      .where(eq(userSettings.id, id))
      .returning();

    return updated;
  };

  updatePreference = async (
    id: string = this.userId!,
    preference: Partial<UserPreference>
  ): Promise<UserItem> => {
    const user = await this.findById(id);
    if (!user) throw new UserNotFoundError();

    const merged = { ...user.preference, ...preference };

    return this.updateUser(id, { preference: merged });
  };
}
