import { and, desc, eq } from 'drizzle-orm';

import type { WorkspaceAuditLogItem } from '../schemas/workspace';
import { workspaceAuditLogs } from '../schemas/workspace';
import type { AppDatabase } from '../type';
import { idGenerator } from '../utils/idGenerator';

export class WorkspaceAuditLogModel {
  private workspaceId: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, workspaceId: string) {
    this.workspaceId = workspaceId;
    this.db = db;
  }

  log = async (params: {
    userId?: string | null;
    action: string;
    resourceType?: string | null;
    resourceId?: string | null;
    metadata?: Record<string, unknown>;
    ipAddress?: string | null;
  }): Promise<WorkspaceAuditLogItem> => {
    const id = idGenerator('workspaceAuditLogs');

    const [log] = await this.db
      .insert(workspaceAuditLogs)
      .values({
        id,
        workspaceId: this.workspaceId,
        userId: params.userId ?? null,
        action: params.action,
        resourceType: params.resourceType ?? null,
        resourceId: params.resourceId ?? null,
        metadata: params.metadata ?? {},
        ipAddress: params.ipAddress ?? null
      })
      .returning();

    return log;
  };

  listLogs = async (options?: {
    limit?: number;
    offset?: number;
    action?: string;
  }): Promise<WorkspaceAuditLogItem[]> => {
    const conditions = [eq(workspaceAuditLogs.workspaceId, this.workspaceId)];

    if (options?.action) {
      conditions.push(eq(workspaceAuditLogs.action, options.action));
    }

    return this.db.query.workspaceAuditLogs.findMany({
      where: and(...conditions),
      orderBy: [desc(workspaceAuditLogs.createdAt)],
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0
    });
  };
}
