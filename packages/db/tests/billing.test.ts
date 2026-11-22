import { beforeAll, describe, expect, it } from 'vitest';

import { getTestDB } from '../src/core/getTestDB';
import { InvoiceModel, SubscriptionModel, UsageQuotaModel, UserModel } from '../src/models';
import type { AppDatabase } from '../src/type';

describe('Billing Models (Subscriptions, Invoices, UsageQuotas)', () => {
  let db: AppDatabase;
  const testUserId = 'usr_billing_test_1';

  beforeAll(async () => {
    db = await getTestDB();

    // Create a test user
    const userModel = new UserModel(db);
    await userModel.createUser({
      id: testUserId,
      email: 'billing-test@example.com'
    });
  });

  describe('SubscriptionModel', () => {
    it('creates and manages a subscription', async () => {
      const subModel = new SubscriptionModel(db, testUserId);

      const created = await subModel.create({
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_stripe_123',
        stripePriceId: 'price_pro_monthly',
        planId: 'pro',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      expect(created.id).toBeDefined();
      expect(created.userId).toBe(testUserId);
      expect(created.planId).toBe('pro');
      expect(created.status).toBe('active');

      const foundByStripe = await subModel.findByStripeSubscriptionId('sub_stripe_123');
      expect(foundByStripe?.id).toBe(created.id);

      const userSub = await subModel.findByUserId();
      expect(userSub?.id).toBe(created.id);

      const canceled = await subModel.cancel(created.id, true);
      expect(canceled?.cancelAtPeriodEnd).toBe(true);
      expect(canceled?.canceledAt).toBeDefined();
    });
  });

  describe('InvoiceModel', () => {
    it('creates and updates invoices', async () => {
      const invoiceModel = new InvoiceModel(db, testUserId);

      const invoice = await invoiceModel.create({
        stripeInvoiceId: 'in_stripe_123',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_stripe_123',
        amountPaid: 2900,
        amountDue: 0,
        currency: 'usd',
        status: 'paid',
        paidAt: new Date()
      });

      expect(invoice.id).toBeDefined();
      expect(invoice.stripeInvoiceId).toBe('in_stripe_123');
      expect(invoice.amountPaid).toBe(2900);

      const list = await invoiceModel.listByUserId();
      expect(list.length).toBeGreaterThan(0);
      expect(list[0].id).toBe(invoice.id);
    });
  });

  describe('UsageQuotaModel', () => {
    it('sets, checks, consumes and resets usage quotas', async () => {
      const quotaModel = new UsageQuotaModel(db, testUserId);

      const quota = await quotaModel.setQuota({
        featureKey: 'ai_tokens',
        limitAmount: 1000
      });

      expect(quota.featureKey).toBe('ai_tokens');
      expect(quota.limitAmount).toBe(1000);
      expect(quota.usedAmount).toBe(0);

      // Check limit before consuming
      const canConsume500 = await quotaModel.checkLimit('ai_tokens', 500);
      expect(canConsume500).toBe(true);

      // Consume 500
      const consumeRes = await quotaModel.consume('ai_tokens', 500);
      expect(consumeRes.success).toBe(true);
      expect(consumeRes.quota?.usedAmount).toBe(500);

      // Cannot consume 600 (500 + 600 = 1100 > 1000)
      const overLimit = await quotaModel.consume('ai_tokens', 600);
      expect(overLimit.success).toBe(false);

      // Reset quota
      const reset = await quotaModel.resetQuota('ai_tokens');
      expect(reset?.usedAmount).toBe(0);
    });
  });
});
