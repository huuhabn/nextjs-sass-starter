import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import type { BillingMetadata, InvoiceStatus, SubscriptionStatus } from '@/types';
import { createdAt, timestamptz, updatedAt } from './_helpers';
import { users } from './user';

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripeCustomerId: text('stripe_customer_id').notNull(),
    stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
    stripePriceId: text('stripe_price_id').notNull(),
    status: text('status').$type<SubscriptionStatus>().notNull(),
    planId: text('plan_id').notNull(),
    currentPeriodStart: timestamptz('current_period_start').notNull(),
    currentPeriodEnd: timestamptz('current_period_end').notNull(),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
    canceledAt: timestamptz('canceled_at'),
    trialStart: timestamptz('trial_start'),
    trialEnd: timestamptz('trial_end'),
    metadata: jsonb('metadata').$type<BillingMetadata>().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    index('subscriptions_user_id_idx').on(t.userId),
    index('subscriptions_customer_id_idx').on(t.stripeCustomerId),
    index('subscriptions_status_idx').on(t.status)
  ]
);

export const invoices = pgTable(
  'invoices',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripeInvoiceId: text('stripe_invoice_id').notNull().unique(),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeCustomerId: text('stripe_customer_id').notNull(),
    amountPaid: integer('amount_paid').default(0).notNull(),
    amountDue: integer('amount_due').default(0).notNull(),
    currency: varchar('currency', { length: 10 }).default('usd').notNull(),
    status: text('status').$type<InvoiceStatus>().notNull(),
    invoicePdf: text('invoice_pdf'),
    hostedInvoiceUrl: text('hosted_invoice_url'),
    paidAt: timestamptz('paid_at'),
    createdAt: createdAt()
  },
  (t) => [
    index('invoices_user_id_idx').on(t.userId),
    index('invoices_stripe_customer_id_idx').on(t.stripeCustomerId),
    index('invoices_stripe_subscription_id_idx').on(t.stripeSubscriptionId)
  ]
);

export const userUsageQuotas = pgTable(
  'user_usage_quotas',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    featureKey: varchar('feature_key', { length: 100 }).notNull(),
    usedAmount: integer('used_amount').default(0).notNull(),
    limitAmount: integer('limit_amount').notNull(),
    resetAt: timestamptz('reset_at'),
    metadata: jsonb('metadata').$type<BillingMetadata>().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    uniqueIndex('user_usage_quotas_user_feature_unique').on(t.userId, t.featureKey),
    index('user_usage_quotas_user_id_idx').on(t.userId)
  ]
);

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);
export type SubscriptionItem = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export const insertInvoiceSchema = createInsertSchema(invoices);
export const selectInvoiceSchema = createSelectSchema(invoices);
export type InvoiceItem = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export const insertUserUsageQuotaSchema = createInsertSchema(userUsageQuotas);
export const selectUserUsageQuotaSchema = createSelectSchema(userUsageQuotas);
export type UserUsageQuotaItem = typeof userUsageQuotas.$inferSelect;
export type NewUserUsageQuota = typeof userUsageQuotas.$inferInsert;
