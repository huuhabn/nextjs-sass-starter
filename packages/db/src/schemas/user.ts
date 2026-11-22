import { boolean, index, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { DEFAULT_PREFERENCE, type UserPreference } from '@/types';
import { createdAt, timestamptz, updatedAt } from './_helpers';

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey().notNull(),
    username: text('username').unique(),
    email: text('email'),
    avatar: text('avatar'),
    phone: text('phone'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    isOnboarded: boolean('is_onboarded').default(false).notNull(),
    clerkCreatedAt: timestamptz('clerk_created_at'),
    preference: jsonb('preference').$type<UserPreference>().default(DEFAULT_PREFERENCE),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    key: text('key')
  },
  (t) => [index('users_email_idx').on(t.email)]
);

export const userSettings = pgTable('user_settings', {
  id: text('id')
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tts: jsonb('tts'),
  keyVaults: text('key_vaults'),
  general: jsonb('general'),
  languageModel: jsonb('language_model'),
  systemAgent: jsonb('system_agent'),
  defaultAgent: jsonb('default_agent'),
  tool: jsonb('tool'),
  notification: jsonb('notification')
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type UserItem = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const insertUserSettingsSchema = createInsertSchema(userSettings);
export const selectUserSettingsSchema = createSelectSchema(userSettings);
export type UserSettingsItem = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
