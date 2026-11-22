import { describe, expect, it } from 'vitest';

import { getTestDB } from '../src/core/getTestDB';
import {
  ApiKeyModel,
  NotificationModel,
  RbacModel,
  SessionModel,
  UserModel,
  WorkspaceInvitationModel,
  WorkspaceMemberModel,
  WorkspaceModel
} from '../src/models';

describe('Domain Models CRUD operations', () => {
  it('should support UserModel CRUD and user_settings', async () => {
    const db = await getTestDB();
    const userModel = new UserModel(db);

    const user = await userModel.createUser({
      id: 'usr_test_1',
      username: 'johndoe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(user.id).toBe('usr_test_1');
    expect(user.username).toBe('johndoe');

    const found = await userModel.findById('usr_test_1');
    expect(found?.email).toBe('john@example.com');

    // Update settings
    const settings = await userModel.updateUserSettings('usr_test_1', {
      general: { theme: 'dark' }
    });
    expect(settings.general).toEqual({ theme: 'dark' });

    // Update preference
    const updatedUser = await userModel.updatePreference('usr_test_1', {
      useCmdEnterToSend: true
    });
    expect(updatedUser.preference?.useCmdEnterToSend).toBe(true);
  });

  it('should support WorkspaceModel and Member lifecycle', async () => {
    const db = await getTestDB();
    const wsModel = new WorkspaceModel(db, 'usr_test_1');

    const ws = await wsModel.create({
      name: 'Acme Corp',
      slug: 'acme-corp'
    });

    expect(ws.name).toBe('Acme Corp');
    expect(ws.primaryOwnerId).toBe('usr_test_1');

    // Check member model
    const memberModel = new WorkspaceMemberModel(db, ws.id);
    const members = await memberModel.listMembers();
    expect(members.length).toBe(1);
    expect(members[0].role).toBe('owner');

    // Add another user as member
    const userModel = new UserModel(db);
    await userModel.createUser({
      id: 'usr_test_2',
      username: 'alice',
      email: 'alice@example.com'
    });

    await memberModel.addMember('usr_test_2', 'member');
    const updatedMembers = await memberModel.listMembers();
    expect(updatedMembers.length).toBe(2);

    // Invitation
    const invitationModel = new WorkspaceInvitationModel(db, ws.id);
    const inv = await invitationModel.createInvitation({
      inviterId: 'usr_test_1',
      email: 'bob@example.com',
      role: 'member'
    });
    expect(inv.status).toBe('pending');
    expect(inv.token).toBeDefined();
  });

  it('should support SessionModel CRUD', async () => {
    const db = await getTestDB();
    const sessionModel = new SessionModel(db, 'usr_test_1');

    const session = await sessionModel.create({
      title: 'Planning Session',
      description: 'Q4 roadmap'
    });

    expect(session.id).toBeDefined();
    expect(session.title).toBe('Planning Session');

    const list = await sessionModel.list();
    expect(list.some((s) => s.id === session.id)).toBe(true);

    const updated = await sessionModel.pin(session.id, true);
    expect(updated?.pinned).toBe(true);
  });

  it('should support NotificationModel with dedupeKey', async () => {
    const db = await getTestDB();
    const notificationModel = new NotificationModel(db, 'usr_test_1');

    const n1 = await notificationModel.create({
      category: 'system',
      type: 'welcome',
      title: 'Welcome!',
      content: 'Welcome to our platform',
      dedupeKey: 'welcome_usr_test_1'
    });

    expect(n1.id).toBeDefined();

    // Re-creating with same dedupeKey returns existing
    const n2 = await notificationModel.create({
      category: 'system',
      type: 'welcome',
      title: 'Welcome again!',
      content: 'Duplicate',
      dedupeKey: 'welcome_usr_test_1'
    });

    expect(n2.id).toBe(n1.id);

    const list = await notificationModel.list({ unreadOnly: true });
    expect(list.length).toBeGreaterThan(0);

    await notificationModel.markAsRead(n1.id);
    const unread = await notificationModel.list({ unreadOnly: true });
    expect(unread.some((n) => n.id === n1.id)).toBe(false);
  });

  it('should support RbacModel roles and permission checks', async () => {
    const db = await getTestDB();
    const rbacModel = new RbacModel(db);

    const role = await rbacModel.createRole({
      name: 'billing_admin',
      displayName: 'Billing Admin',
      description: 'Can manage billing'
    });

    const perm = await rbacModel.createPermission({
      code: 'billing.manage',
      name: 'Manage Billing',
      category: 'billing'
    });

    await rbacModel.assignPermissionToRole(role.id, perm.id);
    await rbacModel.assignRoleToUser('usr_test_1', role.id);

    const hasPerm = await rbacModel.hasPermission('usr_test_1', 'billing.manage');
    expect(hasPerm).toBe(true);

    const hasOther = await rbacModel.hasPermission('usr_test_1', 'system.admin');
    expect(hasOther).toBe(false);
  });

  it('should support ApiKeyModel create and touchLastUsed', async () => {
    const db = await getTestDB();
    const apiKeyModel = new ApiKeyModel(db, 'usr_test_1');

    const key = await apiKeyModel.create({
      name: 'Production Server Key'
    });

    expect(key.key.startsWith('sk-')).toBe(true);
    expect(key.name).toBe('Production Server Key');

    const found = await apiKeyModel.findByKey(key.key);
    expect(found?.id).toBe(key.id);

    await apiKeyModel.touchLastUsed(key.id);
    const updated = await apiKeyModel.findById(key.id);
    expect(updated?.lastUsedAt).toBeDefined();
  });
});
