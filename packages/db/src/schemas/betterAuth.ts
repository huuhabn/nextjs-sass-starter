import { boolean, index, integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { createdAt, timestamptz, updatedAt } from './_helpers';
import { users } from './user';

export const authSessions = pgTable(
  'auth_sessions',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamptz('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    impersonatedBy: text('impersonated_by'),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    index('auth_sessions_user_id_idx').on(t.userId),
    uniqueIndex('auth_sessions_token_idx').on(t.token)
  ]
);

export const auth_sessions = authSessions;

export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamptz('access_token_expires_at'),
    refreshTokenExpiresAt: timestamptz('refresh_token_expires_at'),
    scope: text('scope'),
    idToken: text('id_token'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    index('accounts_user_id_idx').on(t.userId),
    index('accounts_provider_idx').on(t.providerId, t.accountId)
  ]
);

export const verifications = pgTable(
  'verifications',
  {
    id: text('id').primaryKey().notNull(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamptz('expires_at').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [index('verifications_identifier_idx').on(t.identifier)]
);

export const twoFactor = pgTable(
  'two_factor',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    secret: text('secret').notNull(),
    backupCodes: text('backup_codes').notNull(),
    verified: boolean('verified').default(true),
    failedVerificationCount: integer('failed_verification_count').default(0),
    lockedUntil: timestamptz('locked_until')
  },
  (t) => [index('two_factor_user_id_idx').on(t.userId)]
);

export const passkey = pgTable(
  'passkey',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name'),
    publicKey: text('public_key').notNull(),
    credentialID: text('credential_id').notNull(),
    counter: integer('counter').default(0).notNull(),
    deviceType: text('device_type'),
    backedUp: boolean('backed_up').default(false).notNull(),
    transports: text('transports'),
    aaguid: text('aaguid'),
    createdAt: createdAt()
  },
  (t) => [
    index('passkey_user_id_idx').on(t.userId),
    uniqueIndex('passkey_credential_id_idx').on(t.credentialID)
  ]
);

export const insertAuthSessionSchema = createInsertSchema(authSessions);
export const selectAuthSessionSchema = createSelectSchema(authSessions);
export type AuthSessionItem = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;

export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);
export type AccountItem = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export const insertVerificationSchema = createInsertSchema(verifications);
export const selectVerificationSchema = createSelectSchema(verifications);
export type VerificationItem = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export const insertTwoFactorSchema = createInsertSchema(twoFactor);
export const selectTwoFactorSchema = createSelectSchema(twoFactor);
export type TwoFactorItem = typeof twoFactor.$inferSelect;
export type NewTwoFactor = typeof twoFactor.$inferInsert;

export const insertPasskeySchema = createInsertSchema(passkey);
export const selectPasskeySchema = createSelectSchema(passkey);
export type PasskeyItem = typeof passkey.$inferSelect;
export type NewPasskey = typeof passkey.$inferInsert;
