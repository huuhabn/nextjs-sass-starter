import { and, desc, eq, gt } from 'drizzle-orm';

import type { WorkspaceInvitationItem } from '../schemas/workspace';
import { workspaceInvitations, workspaceMembers } from '../schemas/workspace';
import type { AppDatabase } from '../type';
import { idGenerator } from '../utils/idGenerator';

export class WorkspaceInvitationModel {
  private workspaceId: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, workspaceId: string) {
    this.workspaceId = workspaceId;
    this.db = db;
  }

  createInvitation = async (params: {
    inviterId: string;
    email?: string | null;
    role?: string;
    expiresInDays?: number;
  }): Promise<WorkspaceInvitationItem> => {
    const id = idGenerator('workspaceInvitations');
    const token = idGenerator('workspaceInvitations', 24);
    const expiresDays = params.expiresInDays ?? 7;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    const [invitation] = await this.db
      .insert(workspaceInvitations)
      .values({
        id,
        workspaceId: this.workspaceId,
        inviterId: params.inviterId,
        email: params.email ?? null,
        role: params.role ?? 'member',
        token,
        status: 'pending',
        expiresAt
      })
      .returning();

    return invitation;
  };

  findByToken = async (token: string): Promise<WorkspaceInvitationItem | undefined> => {
    return this.db.query.workspaceInvitations.findFirst({
      where: and(
        eq(workspaceInvitations.token, token),
        eq(workspaceInvitations.status, 'pending'),
        gt(workspaceInvitations.expiresAt, new Date())
      )
    });
  };

  listInvitations = async (): Promise<WorkspaceInvitationItem[]> => {
    return this.db.query.workspaceInvitations.findMany({
      where: eq(workspaceInvitations.workspaceId, this.workspaceId),
      orderBy: [desc(workspaceInvitations.createdAt)]
    });
  };

  acceptInvitation = async (
    token: string,
    userId: string
  ): Promise<WorkspaceInvitationItem | undefined> => {
    const invitation = await this.findByToken(token);
    if (!invitation) return undefined;

    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(workspaceInvitations)
        .set({ status: 'accepted', updatedAt: new Date() })
        .where(eq(workspaceInvitations.id, invitation.id))
        .returning();

      await tx
        .insert(workspaceMembers)
        .values({
          workspaceId: invitation.workspaceId,
          userId,
          role: invitation.role
        })
        .onConflictDoUpdate({
          target: [workspaceMembers.workspaceId, workspaceMembers.userId],
          set: { role: invitation.role, updatedAt: new Date(), deletedAt: null }
        });

      return updated;
    });
  };

  revokeInvitation = async (id: string): Promise<void> => {
    await this.db
      .update(workspaceInvitations)
      .set({ status: 'revoked', updatedAt: new Date() })
      .where(
        and(eq(workspaceInvitations.id, id), eq(workspaceInvitations.workspaceId, this.workspaceId))
      );
  };
}
