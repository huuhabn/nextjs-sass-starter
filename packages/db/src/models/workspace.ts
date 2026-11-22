import { and, eq, isNull } from 'drizzle-orm';

import { WorkspaceNotFoundError } from '../errors';
import type { NewWorkspace, WorkspaceItem } from '../schemas/workspace';
import { workspaceMembers, workspaces } from '../schemas/workspace';
import type { AppDatabase } from '../type';
import { idGenerator, randomSlug } from '../utils/idGenerator';

export class WorkspaceModel {
  private userId: string;
  private db: AppDatabase;

  constructor(db: AppDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Partial<NewWorkspace> & { name: string }): Promise<WorkspaceItem> => {
    const id = params.id ?? idGenerator('workspace');
    const slug = params.slug ?? randomSlug('ws');

    return this.db.transaction(async (tx) => {
      const [workspace] = await tx
        .insert(workspaces)
        .values({
          id,
          slug,
          description: null,
          avatar: null,
          primaryOwnerId: this.userId,
          settings: {},
          ...params
        } as NewWorkspace)
        .returning();

      // Automatically add the creator as 'owner'
      await tx.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId: this.userId,
        role: 'owner'
      });

      return workspace;
    });
  };

  findById = async (id: string): Promise<WorkspaceItem | undefined> => {
    return this.db.query.workspaces.findFirst({
      where: eq(workspaces.id, id)
    });
  };

  findBySlug = async (slug: string): Promise<WorkspaceItem | undefined> => {
    return this.db.query.workspaces.findFirst({
      where: eq(workspaces.slug, slug)
    });
  };

  listUserWorkspaces = async (): Promise<WorkspaceItem[]> => {
    const memberships = await this.db.query.workspaceMembers.findMany({
      where: and(eq(workspaceMembers.userId, this.userId), isNull(workspaceMembers.deletedAt)),
      with: {
        workspace: true
      }
    });

    return memberships.map((m: { workspace: WorkspaceItem }) => m.workspace).filter(Boolean);
  };

  update = async (
    id: string,
    params: Partial<NewWorkspace>
  ): Promise<WorkspaceItem | undefined> => {
    const [updated] = await this.db
      .update(workspaces)
      .set({ ...params, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();

    return updated;
  };

  delete = async (id: string): Promise<void> => {
    const ws = await this.findById(id);
    if (!ws) throw new WorkspaceNotFoundError();

    await this.db.delete(workspaces).where(eq(workspaces.id, id));
  };

  transferPrimaryOwnership = async (
    workspaceId: string,
    newOwnerId: string
  ): Promise<WorkspaceItem> => {
    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(workspaces)
        .set({ primaryOwnerId: newOwnerId, updatedAt: new Date() })
        .where(eq(workspaces.id, workspaceId))
        .returning();

      if (!updated) throw new WorkspaceNotFoundError();

      // Ensure new owner has 'owner' role
      await tx
        .insert(workspaceMembers)
        .values({
          workspaceId,
          userId: newOwnerId,
          role: 'owner'
        })
        .onConflictDoUpdate({
          target: [workspaceMembers.workspaceId, workspaceMembers.userId],
          set: { role: 'owner', updatedAt: new Date(), deletedAt: null }
        });

      // Demote old owner to 'admin'
      await tx
        .update(workspaceMembers)
        .set({ role: 'admin', updatedAt: new Date() })
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, this.userId)
          )
        );

      return updated;
    });
  };
}
