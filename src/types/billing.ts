export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'past_due'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'
  | string;

export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible' | string;

export interface BillingMetadata {
  [key: string]: unknown;
}
