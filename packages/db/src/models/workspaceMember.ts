import { and, eq, isNull } from 'drizzle-orm';

import type { WorkspaceMemberItem } from '../schemas/workspace';
import { workspaceMembers } from '../schemas/workspace';
import type { AppDatabase } from '../type';

export class WorkspaceMemberModel {
  private workspaceId: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, workspaceId: string) {
    this.workspaceId = workspaceId;
    this.db = db;
  }

  addMember = async (userId: string, role: string = 'member'): Promise<WorkspaceMemberItem> => {
    const [member] = await this.db
      .insert(workspaceMembers)
      .values({
        workspaceId: this.workspaceId,
        userId,
        role
      })
      .onConflictDoUpdate({
        target: [workspaceMembers.workspaceId, workspaceMembers.userId],
        set: { role, updatedAt: new Date(), deletedAt: null }
      })
      .returning();

    return member;
  };

  getMember = async (userId: string): Promise<WorkspaceMemberItem | undefined> => {
    return this.db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, this.workspaceId),
        eq(workspaceMembers.userId, userId),
        isNull(workspaceMembers.deletedAt)
      )
    });
  };

  listMembers = async (): Promise<WorkspaceMemberItem[]> => {
    return this.db.query.workspaceMembers.findMany({
      where: and(
        eq(workspaceMembers.workspaceId, this.workspaceId),
        isNull(workspaceMembers.deletedAt)
      )
    });
  };

  updateRole = async (userId: string, role: string): Promise<WorkspaceMemberItem | undefined> => {
    const [updated] = await this.db
      .update(workspaceMembers)
      .set({ role, updatedAt: new Date() })
      .where(
        and(eq(workspaceMembers.workspaceId, this.workspaceId), eq(workspaceMembers.userId, userId))
      )
      .returning();

    return updated;
  };

  removeMember = async (userId: string): Promise<void> => {
    await this.db
      .update(workspaceMembers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(workspaceMembers.workspaceId, this.workspaceId), eq(workspaceMembers.userId, userId))
      );
  };
}
