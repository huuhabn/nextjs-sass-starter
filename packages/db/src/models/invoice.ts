import { desc, eq } from 'drizzle-orm';

import type { InvoiceItem, NewInvoice } from '../schemas/billing';
import { invoices } from '../schemas/billing';
import type { AppDatabase } from '../type';
import type { InvoiceStatus } from '@/types';
import { idGenerator } from '../utils/idGenerator';

export class InvoiceModel {
  private userId?: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, userId?: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (
    params: Omit<NewInvoice, 'id' | 'userId'> & { id?: string; userId?: string }
  ): Promise<InvoiceItem> => {
    const userId = params.userId || this.userId;
    if (!userId) {
      throw new Error('UserId is required to create an invoice');
    }

    const id = params.id ?? idGenerator('invoice');

    const [created] = await this.db
      .insert(invoices)
      .values({
        ...params,
        id,
        userId
      })
      .returning();

    return created;
  };

  findById = async (id: string): Promise<InvoiceItem | undefined> => {
    return this.db.query.invoices.findFirst({
      where: eq(invoices.id, id)
    });
  };

  findByStripeInvoiceId = async (stripeInvoiceId: string): Promise<InvoiceItem | undefined> => {
    return this.db.query.invoices.findFirst({
      where: eq(invoices.stripeInvoiceId, stripeInvoiceId)
    });
  };

  listByUserId = async (
    userId?: string,
    options?: { limit?: number; offset?: number }
  ): Promise<InvoiceItem[]> => {
    const uid = userId || this.userId;
    if (!uid) return [];

    return this.db.query.invoices.findMany({
      where: eq(invoices.userId, uid),
      orderBy: [desc(invoices.createdAt)],
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0
    });
  };

  updateStatus = async (
    stripeInvoiceId: string,
    status: InvoiceStatus,
    paidAt?: Date
  ): Promise<InvoiceItem | undefined> => {
    const [updated] = await this.db
      .update(invoices)
      .set({
        status,
        ...(paidAt ? { paidAt } : {})
      })
      .where(eq(invoices.stripeInvoiceId, stripeInvoiceId))
      .returning();

    return updated;
  };
}
