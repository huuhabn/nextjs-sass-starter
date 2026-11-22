import { bigint, index, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { createdAt, updatedAt } from './_helpers';
import { users } from './user';

export const files = pgTable(
  'files',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fileType: varchar('file_type', { length: 255 }).notNull(),
    name: text('name').notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
    url: text('url').notNull(),
    metadata: jsonb('metadata'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    workspaceId: text('workspace_id')
  },
  (t) => [index('files_user_id_idx').on(t.userId, t.createdAt.desc())]
);

export const insertFileSchema = createInsertSchema(files);
export const selectFileSchema = createSelectSchema(files);
export type FileItem = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
