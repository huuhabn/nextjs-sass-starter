import { z } from 'zod';

export type PartialDeep<T> = { [P in keyof T]?: PartialDeep<T[P]> };
export type DeviceExecutionTarget = string;
export type AgentModelOverride = string;
export type Plans = string;
export type TopicGroupMode = string;
export type TopicSortBy = string;
import type { UserAgentOnboarding } from './agentOnboarding';
import type { UserOnboarding } from './onboarding';
import type { UserSettings } from './settings';
import type { NotificationSettings } from './settings/notification';

export interface AgentDeviceOverride {
  boundDeviceId?: string;
  executionTarget?: DeviceExecutionTarget;
  localSandbox?: boolean;
  localSandboxNetwork?: boolean;
}

export interface SidebarLayoutPreference {
  hiddenSections?: string[];

  items?: string[];
}

export interface WorkspaceUserPreference {
  agentDeviceOverrides?: Record<string, AgentDeviceOverride>;

  agentModelOverrides?: Record<string, AgentModelOverride>;

  agentModeOverrides?: Record<string, boolean>;

  notification?: NotificationSettings;

  sidebar?: SidebarLayoutPreference;

  sidebarAgentVisibilityOverrides?: Record<string, boolean>;

  sidebarGroupAssignments?: Record<string, string | null>;

  sidebarHiddenAgentIds?: string[];

  sidebarHiddenGroupIds?: string[];

  sidebarPinnedItemIds?: string[];

  sidebarPinnedOverrides?: Record<string, boolean>;

  topicOnlyMine?: boolean;

  worktreeModeDirs?: string[];
}

export interface AppUser {
  avatar?: string;
  email?: string | null;
  firstName?: string | null;
  fullName?: string | null;
  id: string;
  interests?: string[];
  latestName?: string | null;
  username?: string | null;
}

export const UserGuideSchema = z.object({
  docsMerged: z.boolean().optional(),

  moveSettingsToAvatar: z.boolean().optional(),

  topic: z.boolean().optional(),

  uploadFileInKnowledgeBase: z.boolean().optional()
});

export type UserGuide = z.infer<typeof UserGuideSchema>;

export const UserLabSchema = z.object({
  enableBetterCodingExperience: z.boolean().optional(),

  enableAgentIdentity: z.boolean().optional(),

  enableAgentGraphConfig: z.boolean().optional(),

  enableArtifactDeployment: z.boolean().optional(),

  enablePageCollab: z.boolean().optional(),

  enableClaudeCodeSdk: z.boolean().optional(),

  enableCodexAppServer: z.boolean().optional(),

  enableDesktopSplitView: z.boolean().optional(),

  enableHeteroSessionImport: z.boolean().optional(),

  enableGroupChat: z.boolean().optional(),

  enableImessage: z.boolean().optional(),

  enableInputMarkdown: z.boolean().optional(),

  enableMessageTextSelectionActions: z.boolean().optional(),

  enableIntegrations: z.boolean().optional(),

  enableOAuthApps: z.boolean().optional(),

  enableProjects: z.boolean().optional(),

  enableSelfLearning: z.boolean().optional(),

  enableTaskVerify: z.boolean().optional(),

  enableEvalCapture: z.boolean().optional(),

  enableTopicBugReport: z.boolean().optional(),

  enableGoals: z.boolean().optional(),

  enableTopicAcceptance: z.boolean().optional(),

  enableDeviceTunnel: z.boolean().optional()
});

export type UserLab = z.infer<typeof UserLabSchema>;

export interface GithubIntegrationPreference {
  acceptOnMerge?: boolean;

  commentOnPrivateRepositories?: boolean;

  commentOnPublicRepositories?: boolean;

  wakeOnCiFailure?: boolean;

  wakeOnReview?: boolean;
}

export interface UserIntegrationPreference {
  github?: GithubIntegrationPreference;
}

export const GithubIntegrationPreferenceSchema = z.object({
  acceptOnMerge: z.boolean().optional(),
  commentOnPrivateRepositories: z.boolean().optional(),
  commentOnPublicRepositories: z.boolean().optional(),
  wakeOnCiFailure: z.boolean().optional(),
  wakeOnReview: z.boolean().optional()
});

export const UserIntegrationPreferenceSchema = z.object({
  github: GithubIntegrationPreferenceSchema.optional()
});

export interface UserWorkspacePreference {
  order?: string[];
}

export interface UserPreference {
  defaultOpenInApp?: string;

  disableInputMarkdownRender?: boolean;

  fontFamily?: string;
  guide?: UserGuide;
  hideSyncAlert?: boolean;

  integration?: UserIntegrationPreference;

  islandDismissals?: string[];
  lab?: UserLab;

  lastWorkspaceId?: string | null;

  projectTopicGroupMode?: TopicGroupMode;

  sidebarHiddenAgentIds?: string[];

  sidebarHiddenGroupIds?: string[];

  sidebarPinnedOrder?: string[];

  telemetry?: boolean | null;

  terminalFontFamily?: string;
  topicGroupMode?: TopicGroupMode;

  topicIncludeCompleted?: boolean;
  topicSortBy?: TopicSortBy;

  useCmdEnterToSend?: boolean;

  workspace?: UserWorkspacePreference;

  worktreeModeDirs?: string[];
}

export const DEFAULT_PREFERENCE: UserPreference = {
  guide: {
    moveSettingsToAvatar: true,
    topic: true
  },
  useCmdEnterToSend: false
};

export type ReferralStatusString =
  | 'pending_reward'
  | 'registered'
  | 'suspected'
  | 'rewarded'
  | 'revoked';

export interface UserInitializationState {
  agentOnboarding?: UserAgentOnboarding;
  avatar?: string;
  canEnablePWAGuide?: boolean;
  canEnableTrace?: boolean;
  email?: string;
  firstName?: string;
  fullName?: string;
  hasConversation?: boolean;
  interests?: string[];
  isFreePlan?: boolean;

  isOnboard?: boolean;
  lastName?: string;
  onboarding?: UserOnboarding;
  preference: UserPreference;

  referralStatus?: ReferralStatusString;
  settings: PartialDeep<UserSettings>;
  subscriptionPlan?: Plans;
  userId?: string;
  username?: string;
}

export const OAuthAccountSchema = z.object({
  provider: z.string(),
  providerAccountId: z.string()
});

export interface SSOProvider {
  email?: string;

  expiresAt?: Date | number | null;
  provider: string;
  providerAccountId: string;
}

export const UserPreferenceSchema = z
  .object({
    defaultOpenInApp: z.string().optional(),
    fontFamily: z.string().optional(),
    guide: UserGuideSchema.optional(),
    hideSyncAlert: z.boolean().optional(),
    integration: UserIntegrationPreferenceSchema.optional(),
    lab: UserLabSchema.optional(),
    lastWorkspaceId: z.string().nullish(),
    projectTopicGroupMode: z
      .enum(['byTime', 'byProject', 'flat', 'byStatus', 'byAgent', 'byDevice'])
      .optional(),
    sidebarHiddenAgentIds: z.array(z.string()).optional(),
    sidebarHiddenGroupIds: z.array(z.string()).optional(),
    terminalFontFamily: z.string().optional(),
    telemetry: z.boolean().nullable(),
    topicGroupMode: z
      .enum(['byTime', 'byProject', 'flat', 'byStatus', 'byAgent', 'byDevice'])
      .optional(),
    topicIncludeCompleted: z.boolean().optional(),
    topicSortBy: z.enum(['createdAt', 'updatedAt']).optional(),
    useCmdEnterToSend: z.boolean().optional(),
    workspace: z.object({ order: z.array(z.string()).optional() }).optional()
  })
  .partial();
