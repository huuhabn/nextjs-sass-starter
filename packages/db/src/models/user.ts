import { mergeIslandDismissals } from '@lobechat/const/goal';
import type {
  NotificationSettings,
  SSOProvider,
  SystemAgentItem,
  UserGeneralConfig,
  UserGuide,
  UserKeyVaults,
  UserPreference,
  UserSettings,
  WidgetDryRunGrant
} from '@/types/user';
import { mergeNotificationSettings } from '@/utils/mergeNotificationSettings';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { and, asc, eq, gt, inArray, isNotNull, isNull, max, or, sql } from 'drizzle-orm';
import type { PartialDeep } from 'type-fest';

import { merge } from '@/utils/merge';
import { today } from '@/utils/time';

import type { NewUser, UserItem, UserSettingsItem } from '../schemas';
import { messages, nextauthAccounts, users, userSettings } from '../schemas';
import type { LobeChatDatabase } from '../type';
import { notTrashed } from '../utils/softDelete';

type DecryptUserKeyVaults = (
  encryptKeyVaultsStr: string | null,
  userId?: string
) => Promise<UserKeyVaults>;

const MAX_STATEMENT_TIMEOUT_MS = 2_147_483_647;

const validateDeletionStatementTimeout = (timeoutMs?: number) => {
  if (
    timeoutMs !== undefined &&
    (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_STATEMENT_TIMEOUT_MS)
  ) {
    throw new Error(
      `Account deletion statement timeout must be between 1 and ${MAX_STATEMENT_TIMEOUT_MS} milliseconds`
    );
  }
};

export class UserNotFoundError extends TRPCError {
  constructor() {
    super({ code: 'UNAUTHORIZED', message: 'user not found' });
  }
}

export interface ListUsersForMemoryExtractorCursor {
  createdAt: Date;
  id: string;
}

export type ListUsersForMemoryExtractorOptions = {
  cursor?: ListUsersForMemoryExtractorCursor;
  limit?: number;
  whitelist?: string[];
};

export type ListUsersForHourlyMemoryExtractorOptions = ListUsersForMemoryExtractorOptions;

export interface UserInfoForAIGeneration {
  responseLanguage: string;
  userName: string;
}

interface LastActiveAtTransition {
  previousLastActiveAt: Date;
  userCreatedAt: Date;
}

export class UserModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  getUserActivitySummary = async (): Promise<{
    lastUserMessageAt: Date | null;
    userCreatedAt: Date | null;
  }> => {
    const [summary] = await this.db
      .select({
        lastUserMessageAt: max(messages.createdAt),
        userCreatedAt: users.createdAt
      })
      .from(users)
      .leftJoin(
        messages,
        and(
          eq(messages.userId, users.id),
          eq(messages.role, 'user'),
          notTrashed(messages.isDeleted)
        )
      )
      .where(eq(users.id, this.userId))
      .groupBy(users.createdAt);

    return {
      lastUserMessageAt: summary?.lastUserMessageAt ?? null,
      userCreatedAt: summary?.userCreatedAt ?? null
    };
  };

  getUserRegistrationDuration = async (): Promise<{
    createdAt: string;
    duration: number;
    updatedAt: string;
  }> => {
    const user = await this.db.query.users.findFirst({ where: eq(users.id, this.userId) });
    if (!user)
      return {
        createdAt: today().format('YYYY-MM-DD'),
        duration: 1,
        updatedAt: today().format('YYYY-MM-DD')
      };

    return {
      createdAt: dayjs(user.createdAt).format('YYYY-MM-DD'),
      duration: dayjs().diff(dayjs(user.createdAt), 'day') + 1,
      updatedAt: today().format('YYYY-MM-DD')
    };
  };

  getUserState = async (decryptor: DecryptUserKeyVaults) => {
    const result = await this.db
      .select({
        avatar: users.avatar,
        agentOnboarding: users.agentOnboarding,
        email: users.email,
        firstName: users.firstName,
        fullName: users.fullName,
        interests: users.interests,
        isOnboarded: users.isOnboarded,
        lastName: users.lastName,
        onboarding: users.onboarding,
        preference: users.preference,
        settingsDefaultAgent: userSettings.defaultAgent,

        settingsGeneral: userSettings.general,
        settingsHotkey: userSettings.hotkey,
        settingsImage: userSettings.image,
        settingsKeyVaults: userSettings.keyVaults,
        settingsLanguageModel: userSettings.languageModel,
        settingsMarket: userSettings.market,
        settingsMemory: userSettings.memory,
        settingsNotification: userSettings.notification,
        settingsSystemAgent: userSettings.systemAgent,
        settingsTTS: userSettings.tts,
        settingsTool: userSettings.tool,
        username: users.username
      })
      .from(users)
      .where(eq(users.id, this.userId))
      .leftJoin(userSettings, eq(users.id, userSettings.id))
      .limit(1);

    if (!result || !result[0]) {
      throw new UserNotFoundError();
    }

    const state = result[0];

    // Decrypt keyVaults
    let decryptKeyVaults = {};

    try {
      decryptKeyVaults = await decryptor(state.settingsKeyVaults, this.userId);
    } catch {
      /* empty */
    }

    const settings: PartialDeep<UserSettings> = {
      defaultAgent: state.settingsDefaultAgent || {},
      general: state.settingsGeneral || {},
      hotkey: state.settingsHotkey || {},
      image: state.settingsImage || {},
      keyVaults: decryptKeyVaults,
      languageModel: state.settingsLanguageModel || {},
      market: state.settingsMarket || undefined,
      memory: state.settingsMemory || {},
      notification: state.settingsNotification || {},
      systemAgent: state.settingsSystemAgent || {},
      tool: state.settingsTool || {},
      tts: state.settingsTTS || {}
    };

    return {
      avatar: state.avatar || undefined,
      agentOnboarding: state.agentOnboarding || undefined,
      email: state.email || undefined,
      firstName: state.firstName || undefined,
      fullName: state.fullName || undefined,
      interests: state.interests || undefined,
      isOnboarded: state.isOnboarded,
      lastName: state.lastName || undefined,
      onboarding: state.onboarding || undefined,
      preference: state.preference as UserPreference,
      settings,
      userId: this.userId,
      username: state.username || undefined
    };
  };

  getUserSSOProviders = async (): Promise<SSOProvider[]> => {
    return this.db
      .select({
        expiresAt: nextauthAccounts.expires_at,
        provider: nextauthAccounts.provider,
        providerAccountId: nextauthAccounts.providerAccountId
      })
      .from(nextauthAccounts)
      .where(eq(nextauthAccounts.userId, this.userId));
  };

  getUserSettings = async () => {
    return this.db.query.userSettings.findFirst({ where: eq(userSettings.id, this.userId) });
  };

  getUserPreference = async (): Promise<UserPreference | undefined> => {
    const user = await this.db.query.users.findFirst({
      columns: { preference: true },
      where: eq(users.id, this.userId)
    });
    return user?.preference as UserPreference | undefined;
  };

  getUserSettingsDefaultAgentConfig = async () => {
    const result = await this.db
      .select({ defaultAgent: userSettings.defaultAgent })
      .from(userSettings)
      .where(eq(userSettings.id, this.userId))
      .limit(1);

    return result[0]?.defaultAgent;
  };

  updateUser = async (value: Partial<UserItem>) => {
    const nextValue = UserModel.normalizeUniqueUserFields(value);

    return this.db
      .update(users)
      .set({ ...nextValue, updatedAt: new Date() })
      .where(eq(users.id, this.userId));
  };

  /**
   * Atomically advances `lastActiveAt` and returns the previous DB value.
   *
   * The previous timestamp must stay inside the SQL statement because Postgres
   * keeps microseconds while JS `Date` rounds to milliseconds. For example,
   * `2026-03-01T00:00:00.123456Z` is read as `...123Z`, so comparing the JS
   * value back against `last_active_at` can miss the row.
   */
  advanceLastActiveAt = async (currentTime: Date): Promise<LastActiveAtTransition | undefined> => {
    const result = await this.db.execute(sql`
      WITH previous_user AS MATERIALIZED (
        SELECT id, created_at, last_active_at
        FROM ${users}
        WHERE id = ${this.userId}
      ),
      updated_user AS (
        UPDATE ${users}
        SET last_active_at = ${currentTime}, updated_at = ${currentTime}
        FROM previous_user
        WHERE ${users.id} = previous_user.id
          AND ${users.lastActiveAt} = previous_user.last_active_at
        RETURNING
          previous_user.created_at AS "userCreatedAt",
          previous_user.last_active_at AS "previousLastActiveAt"
      )
      SELECT "userCreatedAt", "previousLastActiveAt" FROM updated_user
    `);

    const row = result.rows[0] as
      | { previousLastActiveAt: Date | string; userCreatedAt: Date | string }
      | undefined;
    if (!row) return;

    return {
      previousLastActiveAt: new Date(row.previousLastActiveAt),
      userCreatedAt: new Date(row.userCreatedAt)
    };
  };

  deleteSetting = async () => {
    return this.db.delete(userSettings).where(eq(userSettings.id, this.userId));
  };

  updateSetting = async (value: Partial<UserSettingsItem>) => {
    return this.db
      .insert(userSettings)
      .values({
        id: this.userId,
        ...value
      })
      .onConflictDoUpdate({
        set: value,
        target: userSettings.id
      });
  };

  /**
   * Atomically merge a partial humanIntervention config into the `tool` settings
   * column in ONE SQL statement. A JS-side read-merge-write would race: two
   * concurrent calls (e.g. one tab changing `approvalMode` while another appends
   * to the allow list) could both read the same snapshot and the last write
   * would silently drop the other change. Doing the merge inside the
   * INSERT ... ON CONFLICT DO UPDATE expression serializes concurrent calls on
   * the row, so both changes land regardless of interleaving.
   */
  mergeToolInterventionSetting = async (value: {
    appendAllowList?: string[];
    approvalMode?: 'auto-run' | 'allow-list' | 'manual';
  }) => {
    const appendAllowList = [...new Set(value.appendAllowList ?? [])];

    const initialIntervention: Record<string, unknown> = {};
    if (value.approvalMode) initialIntervention.approvalMode = value.approvalMode;
    if (appendAllowList.length > 0) initialIntervention.allowList = appendAllowList;

    const storedAllowList = sql`coalesce(${userSettings.tool}->'humanIntervention'->'allowList', '[]'::jsonb)`;

    const approvalModePatch = value.approvalMode
      ? sql`jsonb_build_object('approvalMode', ${value.approvalMode}::text)`
      : sql`'{}'::jsonb`;

    // Append only the entries the stored list does not already contain,
    // preserving both the stored order and the append order.
    const allowListPatch =
      appendAllowList.length > 0
        ? sql`jsonb_build_object(
            'allowList',
            ${storedAllowList} || (
              SELECT coalesce(jsonb_agg(to_jsonb(t.v) ORDER BY t.ord), '[]'::jsonb)
              FROM jsonb_array_elements_text(${JSON.stringify(appendAllowList)}::jsonb) WITH ORDINALITY AS t(v, ord)
              WHERE NOT (${storedAllowList} ? t.v)
            )
          )`
        : sql`'{}'::jsonb`;

    return this.db
      .insert(userSettings)
      .values({ id: this.userId, tool: { humanIntervention: initialIntervention } })
      .onConflictDoUpdate({
        set: {
          tool: sql`coalesce(${userSettings.tool}, '{}'::jsonb) || jsonb_build_object(
            'humanIntervention',
            coalesce(${userSettings.tool}->'humanIntervention', '{}'::jsonb) || ${approvalModePatch} || ${allowListPatch}
          )`
        },
        target: userSettings.id
      });
  };

  /**
   * Append one standing widget dry-run grant to `tool.widgetDryRunGrants` in
   * a single statement, so a concurrent writer of another `tool` key (or of
   * another grant) is never clobbered by a stale client snapshot.
   */
  appendWidgetDryRunGrant = async (grant: WidgetDryRunGrant) => {
    const item = JSON.stringify([grant]);

    return this.db
      .insert(userSettings)
      .values({ id: this.userId, tool: { widgetDryRunGrants: [grant] } })
      .onConflictDoUpdate({
        set: {
          tool: sql`coalesce(${userSettings.tool}, '{}'::jsonb) || jsonb_build_object(
            'widgetDryRunGrants',
            coalesce(${userSettings.tool}->'widgetDryRunGrants', '[]'::jsonb) || ${item}::jsonb
          )`
        },
        target: userSettings.id
      });
  };

  /**
   * Atomically replace the uninstalled-builtin-tools list for one scope
   * (personal, or one workspace's slot) inside the `tool` column, leaving every
   * other key — `humanIntervention`, the other scope's lists — untouched. Same
   * rationale as `mergeToolInterventionSetting`: a JS-side whole-column write
   * built from a snapshot races with concurrent tool-column writers and can
   * revert their changes (e.g. flip approvalMode back).
   */
  replaceUninstalledBuiltinToolsSetting = async (value: {
    uninstalledBuiltinTools: string[];
    workspaceId?: string | null;
  }) => {
    const list = JSON.stringify(value.uninstalledBuiltinTools);

    const initialTool = value.workspaceId
      ? {
          uninstalledBuiltinToolsByWorkspace: {
            [value.workspaceId]: value.uninstalledBuiltinTools
          }
        }
      : { uninstalledBuiltinTools: value.uninstalledBuiltinTools };

    const toolPatch = value.workspaceId
      ? sql`jsonb_build_object(
          'uninstalledBuiltinToolsByWorkspace',
          coalesce(${userSettings.tool}->'uninstalledBuiltinToolsByWorkspace', '{}'::jsonb)
          || jsonb_build_object(${value.workspaceId}::text, ${list}::jsonb)
        )`
      : sql`jsonb_build_object('uninstalledBuiltinTools', ${list}::jsonb)`;

    return this.db
      .insert(userSettings)
      .values({ id: this.userId, tool: initialTool })
      .onConflictDoUpdate({
        set: {
          tool: sql`coalesce(${userSettings.tool}, '{}'::jsonb) || ${toolPatch}`
        },
        target: userSettings.id
      });
  };

  /**
   * Atomically replace the ordered search-provider and/or crawler-impl lists
   * inside the `tool` column, leaving every other key untouched. Same rationale
   * as `mergeToolInterventionSetting`: a whole-column write built from a
   * possibly-stale tab snapshot would revert sibling keys (e.g. approvalMode)
   * changed from other tabs.
   */
  replaceToolChannelsSetting = async (value: {
    crawlerImpls?: string[];
    searchProviders?: string[];
  }) => {
    const patch: Record<string, string[]> = {};
    if (value.crawlerImpls) patch.crawlerImpls = value.crawlerImpls;
    if (value.searchProviders) patch.searchProviders = value.searchProviders;

    return this.db
      .insert(userSettings)
      .values({ id: this.userId, tool: patch })
      .onConflictDoUpdate({
        set: {
          tool: sql`coalesce(${userSettings.tool}, '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb`
        },
        target: userSettings.id
      });
  };

  /**
   * Atomically merge a partial config into ONE `systemAgent` entry, leaving the
   * entry's other fields and every sibling entry untouched. Same rationale as
   * `replaceToolChannelsSetting`: the generic settings write replaces the whole
   * column from a possibly-stale tab snapshot. Callers must restrict `key` to
   * an allowlist; it is bound as a parameter, never interpolated.
   */
  mergeSystemAgentItemSetting = async (key: string, value: Partial<SystemAgentItem>) => {
    const patch = JSON.stringify(value);
    // A legacy scalar under the same key cannot be merged into — replace it.
    const currentItem = sql`case when jsonb_typeof(${userSettings.systemAgent} -> ${key}::text) = 'object' then ${userSettings.systemAgent} -> ${key}::text else '{}'::jsonb end`;

    return this.db
      .insert(userSettings)
      .values({ id: this.userId, systemAgent: { [key]: value } })
      .onConflictDoUpdate({
        set: {
          systemAgent: sql`coalesce(${userSettings.systemAgent}, '{}'::jsonb) || jsonb_build_object(${key}::text, ${currentItem} || ${patch}::jsonb)`
        },
        target: userSettings.id
      });
  };

  getNotificationSetting = async (): Promise<NotificationSettings> => {
    const row = await this.db.query.userSettings.findFirst({
      columns: { notification: true },
      where: eq(userSettings.id, this.userId)
    });
    return (row?.notification as NotificationSettings | null) ?? {};
  };

  /**
   * Merge a notification patch over the stored personal settings and return
   * the result. `updateSetting` replaces the whole column, so a caller holding
   * only the switch it wants to flip would wipe every other toggle. Read →
   * merge → write like `WorkspaceUserSettingsModel.updatePreference`: only the
   * owner writes this row, so a lost update needs the same user racing itself.
   */
  mergeNotificationSetting = async (patch: NotificationSettings) => {
    const notification = mergeNotificationSettings(await this.getNotificationSetting(), patch);
    await this.db
      .insert(userSettings)
      .values({ id: this.userId, notification })
      .onConflictDoUpdate({ set: { notification }, target: userSettings.id });
    return notification;
  };

  /**
   * Read, change and write back `users.preference` while the row is locked.
   * Every preference writer goes through here: one that read the old JSON
   * without the lock would write it back over a concurrent change, such as an
   * island dismissal another client just added. Returns undefined when the
   * user does not exist.
   */
  private mutatePreference = async <T>(
    change: (prev: UserPreference) => { next: UserPreference; result: T }
  ): Promise<T | undefined> =>
    this.db.transaction(async (trx) => {
      const [user] = await trx
        .select({ preference: users.preference })
        .from(users)
        .where(eq(users.id, this.userId))
        .for('update');
      if (!user) return undefined;

      const prev = (user.preference || {}) as UserPreference;
      const { next, result } = change(prev);
      if (next !== prev) {
        await trx.update(users).set({ preference: next }).where(eq(users.id, this.userId));
      }
      return result;
    });

  updatePreference = async (value: Partial<UserPreference>) => {
    await this.mutatePreference((prev) => ({
      next: merge(prev, value) as UserPreference,
      result: undefined
    }));
  };

  updateGuide = async (value: Partial<UserGuide>) => {
    await this.mutatePreference((prev) => ({
      next: { ...prev, guide: merge(prev.guide || {}, value) },
      result: undefined
    }));
  };

  /** Keys of the goal asks this user dismissed from the approval island. */
  getIslandDismissals = async (): Promise<string[]> => {
    const user = await this.db.query.users.findFirst({
      columns: { preference: true },
      where: eq(users.id, this.userId)
    });
    return (user?.preference as UserPreference | null)?.islandDismissals ?? [];
  };

  /**
   * Normalize unique user fields so empty strings become null, keeping unique constraints safe.
   */
  private static normalizeUniqueUserFields = <
    T extends { email?: string | null; phone?: string | null; username?: string | null }
  >(
    value: T
  ) => {
    const normalizedEmail =
      typeof value.email === 'string' && value.email.trim() === '' ? null : value.email;
    const normalizedPhone =
      typeof value.phone === 'string' && value.phone.trim() === '' ? null : value.phone;
    const normalizedUsername =
      typeof value.username === 'string' && value.username.trim() === ''
        ? null
        : value.username?.trim();

    return {
      ...value,
      ...(value.email !== undefined ? { email: normalizedEmail } : {}),
      ...(value.phone !== undefined ? { phone: normalizedPhone } : {}),
      ...(value.username !== undefined ? { username: normalizedUsername } : {})
    };
  };

  // Static method
  static makeSureUserExist = async (db: LobeChatDatabase, userId: string) => {
    await db.insert(users).values({ id: userId }).onConflictDoNothing();
  };

  static createUser = async (db: LobeChatDatabase, params: NewUser) => {
    // if user already exists, skip creation
    if (params.id) {
      const user = await db.query.users.findFirst({ where: eq(users.id, params.id) });
      if (!!user) return { duplicate: true };
    }

    const normalizedParams = this.normalizeUniqueUserFields(params);
    const [user] = await db.insert(users).values(normalizedParams).returning();

    return { duplicate: false, user };
  };

  /**
   * Deletes a user account and their agent-share visitor conversations.
   *
   * Agent-share visitor topics are stored under the CREATOR's userId (for
   * billing/data attribution) and linked to the visitor only via
   * `topics.senderId`, which has no FK. That means the `users` cascade cannot
   * reach them — deleting the visitor's account would otherwise orphan every
   * conversation they had inside someone else's shared agent. We explicitly
   * drop `topics` where `senderId = id`; messages, threads, and topic
   * documents cascade from `topics.id`, so the topic delete is enough.
   */
  static deleteUser = async (
    db: LobeChatDatabase,
    id: string,
    options: { statementTimeoutMs?: number; transactionTimeoutMs?: number } = {}
  ) => {
    const timeoutMs = options.statementTimeoutMs;
    validateDeletionStatementTimeout(timeoutMs);
    validateDeletionStatementTimeout(options.transactionTimeoutMs);

    return db.transaction(async (tx) => {
      const deadline =
        options.transactionTimeoutMs === undefined
          ? undefined
          : Date.now() + options.transactionTimeoutMs;
      // PostgreSQL statement_timeout restarts for each statement. Spend one
      // shared budget across all cascades instead of granting each another 300s.
      const applyRemainingTimeout = async () => {
        const remaining = deadline === undefined ? timeoutMs : deadline - Date.now();
        if (remaining !== undefined && remaining <= 0)
          throw new Error('Account deletion transaction deadline exceeded');
        if (remaining !== undefined) {
          const limit = Math.min(remaining, timeoutMs ?? remaining);
          await tx.execute(sql`SELECT set_config('statement_timeout', ${String(limit)}, true)`);
        }
      };
      await applyRemainingTimeout();
      // Lock the account first. A concurrent insert referencing it takes a
      // KEY SHARE lock on this row, so one already in flight commits before we
      // proceed (and the cleanups below see it), and any later one waits and
      // then fails its FK — none can slip in between a cleanup and the final
      // delete, where a SET NULL FK would orphan it.
      await tx.select({ id: users.id }).from(users).where(eq(users.id, id)).for('update');
    });
  };

  /**
   * Remove high-volume rows in committed batches before the final user cascade.
   * An interrupted call can safely resume from the remaining rows. The final
   * transaction still checks for pending transfers and handles concurrent writes.
   * Call only after account deletion has become irreversible, because each batch commits.
   */
  static deleteUserInBatches = async (
    db: LobeChatDatabase,
    id: string,
    options: {
      batchSize?: number;
      finalStatementTimeoutMs?: number;
      shouldContinue?: () => boolean;
    } = {}
  ) => {
    const batchSize = options.batchSize ?? 500;
    if (!Number.isSafeInteger(batchSize) || batchSize < 1) {
      throw new Error('Account deletion batch size must be a positive integer');
    }
    const timeoutMs = options.finalStatementTimeoutMs;
    validateDeletionStatementTimeout(timeoutMs);
    if (options.shouldContinue?.() === false) return false;

    await UserModel.deleteUser(db, id, {
      statementTimeoutMs: options.finalStatementTimeoutMs,
      transactionTimeoutMs: options.finalStatementTimeoutMs
    });
    return true;
  };

  static findById = async (db: LobeChatDatabase, id: string) => {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  };

  static findByUsername = async (db: LobeChatDatabase, username: string) => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername) return null;

    return db.query.users.findFirst({ where: eq(users.username, normalizedUsername) });
  };

  static findByEmail = async (db: LobeChatDatabase, email: string) => {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  };

  static findByIds = async (db: LobeChatDatabase, ids: string[]) => {
    if (ids.length === 0) return [];
    return db.query.users.findMany({ where: inArray(users.id, ids) });
  };

  /**
   * Lean batch lookup of the display fields (name + avatar) for a set of user
   * ids. Used to attribute a connector/tool to the member who authorized it —
   * both the profile "authorized by X" tag and the runtime credential-ownership
   * note resolve the same way. Selects only public-facing columns (never
   * settings / key vaults). Callers must pass ids they are already authorized to
   * see (e.g. userIds harvested from workspace-scoped connector rows).
   */
  static getDisplayInfoByIds = async (
    db: LobeChatDatabase,
    ids: string[]
  ): Promise<
    Array<{ avatar: string | null; fullName: string | null; id: string; username: string | null }>
  > => {
    if (ids.length === 0) return [];
    return db
      .select({
        avatar: users.avatar,
        fullName: users.fullName,
        id: users.id,
        username: users.username
      })
      .from(users)
      .where(inArray(users.id, ids));
  };

  /**
   * Emails for a set of users. Deliberately separate from
   * {@link UserModel.getDisplayInfoByIds}, whose contract is display-only and
   * must never leak email — call this only where the audience is allowed to
   * see addresses (e.g. workspace members resolving a teammate to assign).
   */
  static getEmailsByIds = async (
    db: LobeChatDatabase,
    ids: string[]
  ): Promise<Array<{ email: string | null; id: string }>> => {
    if (ids.length === 0) return [];
    return db
      .select({ email: users.email, id: users.id })
      .from(users)
      .where(inArray(users.id, ids));
  };

  static getUserApiKeys = async (
    db: LobeChatDatabase,
    id: string,
    decryptor: DecryptUserKeyVaults
  ) => {
    const result = await db
      .select({
        settingsKeyVaults: userSettings.keyVaults
      })
      .from(userSettings)
      .where(eq(userSettings.id, id));

    if (!result || !result[0]) {
      throw new UserNotFoundError();
    }

    const state = result[0];

    // Decrypt keyVaults
    return await decryptor(state.settingsKeyVaults, id);
  };

  static listUsersForMemoryExtractor = (
    db: LobeChatDatabase,
    options: ListUsersForMemoryExtractorOptions = {}
  ) => {
    const cursorCondition = options.cursor
      ? or(
          gt(users.createdAt, options.cursor.createdAt),
          and(eq(users.createdAt, options.cursor.createdAt), gt(users.id, options.cursor.id))
        )
      : undefined;

    const whitelistCondition =
      options.whitelist && options.whitelist.length > 0
        ? inArray(users.id, options.whitelist)
        : undefined;

    const where = and(cursorCondition, whitelistCondition);

    return db.query.users.findMany({
      columns: { createdAt: true, id: true },
      limit: options.limit,
      orderBy: (fields, { asc }) => [asc(fields.createdAt), asc(fields.id)],
      where
    });
  };

  static listUsersForHourlyMemoryExtractor = (
    db: LobeChatDatabase,
    options: ListUsersForHourlyMemoryExtractorOptions = {}
  ) => {
    const cursorCondition = options.cursor
      ? or(
          gt(users.createdAt, options.cursor.createdAt),
          and(eq(users.createdAt, options.cursor.createdAt), gt(users.id, options.cursor.id))
        )
      : undefined;

    const whitelistCondition =
      options.whitelist && options.whitelist.length > 0
        ? inArray(users.id, options.whitelist)
        : undefined;

    // User memory defaults to enabled=true when user settings are missing.
    const memoryEnabledCondition = sql`COALESCE((${userSettings.memory} ->> 'enabled')::boolean, true) = true`;
    const notBannedCondition = sql`COALESCE(${users.banned}, false) = false`;
    const query = db
      .select({
        createdAt: users.createdAt,
        id: users.id
      })
      .from(users)
      .leftJoin(userSettings, eq(users.id, userSettings.id))
      .where(and(cursorCondition, whitelistCondition, notBannedCondition, memoryEnabledCondition))
      .orderBy(asc(users.createdAt), asc(users.id));

    return options.limit !== undefined ? query.limit(options.limit) : query;
  };

  /** Whether the account is banned; background model work must stop for these users. */
  static isBanned = async (db: LobeChatDatabase, userId: string): Promise<boolean> => {
    const [row] = await db
      .select({ banned: users.banned })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return row?.banned === true;
  };

  /**
   * Get user info for AI generation (name and language preference)
   */
  static getInfoForAIGeneration = async (
    db: LobeChatDatabase,
    userId: string
  ): Promise<UserInfoForAIGeneration> => {
    const result = await db
      .select({
        firstName: users.firstName,
        fullName: users.fullName,
        general: userSettings.general
      })
      .from(users)
      .leftJoin(userSettings, eq(users.id, userSettings.id))
      .where(eq(users.id, userId))
      .limit(1);

    const user = result[0];
    const general = user?.general as UserGeneralConfig | undefined;

    return {
      responseLanguage: general?.responseLanguage || 'en-US',
      userName: user?.fullName || user?.firstName || 'User'
    };
  };
}
