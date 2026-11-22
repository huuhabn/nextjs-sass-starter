import { and, eq, gt, or, isNull } from 'drizzle-orm';

import type {
  NewRbacPermission,
  NewRbacRole,
  RbacPermissionItem,
  RbacRoleItem
} from '../schemas/rbac';
import { rbacPermissions, rbacRolePermissions, rbacRoles, rbacUserRoles } from '../schemas/rbac';
import type { AppDatabase } from '../type';

export class RbacModel {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  createRole = async (params: NewRbacRole): Promise<RbacRoleItem> => {
    const [role] = await this.db.insert(rbacRoles).values(params).returning();
    return role;
  };

  findRoleByName = async (name: string): Promise<RbacRoleItem | undefined> => {
    return this.db.query.rbacRoles.findFirst({
      where: eq(rbacRoles.name, name)
    });
  };

  createPermission = async (params: NewRbacPermission): Promise<RbacPermissionItem> => {
    const [permission] = await this.db.insert(rbacPermissions).values(params).returning();
    return permission;
  };

  findPermissionByCode = async (code: string): Promise<RbacPermissionItem | undefined> => {
    return this.db.query.rbacPermissions.findFirst({
      where: eq(rbacPermissions.code, code)
    });
  };

  assignPermissionToRole = async (roleId: number, permissionId: number): Promise<void> => {
    await this.db
      .insert(rbacRolePermissions)
      .values({ roleId, permissionId })
      .onConflictDoNothing();
  };

  assignRoleToUser = async (
    userId: string,
    roleId: number,
    expiresAt?: Date | null
  ): Promise<void> => {
    await this.db
      .insert(rbacUserRoles)
      .values({
        userId,
        roleId,
        expiresAt: expiresAt ?? null
      })
      .onConflictDoUpdate({
        target: [rbacUserRoles.userId, rbacUserRoles.roleId],
        set: { expiresAt: expiresAt ?? null }
      });
  };

  removeRoleFromUser = async (userId: string, roleId: number): Promise<void> => {
    await this.db
      .delete(rbacUserRoles)
      .where(and(eq(rbacUserRoles.userId, userId), eq(rbacUserRoles.roleId, roleId)));
  };

  getUserRoles = async (userId: string): Promise<RbacRoleItem[]> => {
    const now = new Date();
    const userRoles = await this.db.query.rbacUserRoles.findMany({
      where: and(
        eq(rbacUserRoles.userId, userId),
        or(isNull(rbacUserRoles.expiresAt), gt(rbacUserRoles.expiresAt, now))
      ),
      with: {
        role: true
      }
    });

    return userRoles.map((ur: { role: RbacRoleItem }) => ur.role).filter(Boolean);
  };

  getUserPermissions = async (userId: string): Promise<RbacPermissionItem[]> => {
    const roles = await this.getUserRoles(userId);
    if (roles.length === 0) return [];

    const roleIds = roles.map((r) => r.id);

    const permissions = await this.db
      .select({
        id: rbacPermissions.id,
        code: rbacPermissions.code,
        name: rbacPermissions.name,
        description: rbacPermissions.description,
        category: rbacPermissions.category,
        isActive: rbacPermissions.isActive,
        accessedAt: rbacPermissions.accessedAt,
        createdAt: rbacPermissions.createdAt,
        updatedAt: rbacPermissions.updatedAt
      })
      .from(rbacPermissions)
      .innerJoin(rbacRolePermissions, eq(rbacRolePermissions.permissionId, rbacPermissions.id))
      .where(
        and(
          eq(rbacPermissions.isActive, true),
          or(...roleIds.map((rid) => eq(rbacRolePermissions.roleId, rid)))
        )
      );

    return permissions;
  };

  hasPermission = async (userId: string, permissionCode: string): Promise<boolean> => {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some((p) => p.code === permissionCode);
  };
}
