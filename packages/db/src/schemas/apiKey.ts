import { boolean, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { accessedAt, createdAt, timestamptz, updatedAt } from './_helpers';
import { users } from './user';

export const apiKeys = pgTable('api_keys', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity({ name: 'api_keys_id_seq' }),
  name: varchar('name', { length: 256 }).notNull(),
  key: varchar('key', { length: 256 }).notNull().unique(),
  enabled: boolean('enabled').default(true),
  expiresAt: timestamptz('expires_at'),
  lastUsedAt: timestamptz('last_used_at'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessedAt: accessedAt(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const insertApiKeySchema = createInsertSchema(apiKeys);
export const selectApiKeySchema = createSelectSchema(apiKeys);
export type ApiKeyItem = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
