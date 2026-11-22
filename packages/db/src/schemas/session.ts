import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { createdAt, updatedAt } from './_helpers';
import { files } from './file';
import { users } from './user';

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey().notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    title: text('title'),
    description: text('description'),
    avatar: text('avatar'),
    backgroundColor: text('background_color'),
    type: text('type').default('agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    groupId: text('group_id'),
    pinned: boolean('pinned').default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    uniqueIndex('slug_user_id_unique').on(t.slug, t.userId),
    index('sessions_user_list_idx').on(t.userId, t.pinned.desc(), t.updatedAt.desc()),
    index('sessions_group_id_idx').on(t.groupId)
  ]
);

export const filesToSessions = pgTable(
  'files_to_sessions',
  {
    fileId: text('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' })
  },
  (t) => [
    primaryKey({
      columns: [t.fileId, t.sessionId],
      name: 'files_to_sessions_file_id_session_id_pk'
    }),
    index('files_to_sessions_session_id_idx').on(t.sessionId)
  ]
);

export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);
export type SessionItem = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type FilesToSessionsItem = typeof filesToSessions.$inferSelect;
export type NewFilesToSessions = typeof filesToSessions.$inferInsert;
