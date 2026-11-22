import type { UserPreference } from '@/types/user';

export const CURRENT_ONBOARDING_VERSION = 2;

export const DEFAULT_PREFERENCE: UserPreference = {
  guide: {
    moveSettingsToAvatar: true,
    topic: true
  },
  lab: {
    enableAgentGraphConfig: false,
    enableMessageTextSelectionActions: false,
    enableOAuthApps: false
  },
  projectTopicGroupMode: 'byAgent',
  topicGroupMode: 'byTime',
  topicIncludeCompleted: false,
  topicSortBy: 'updatedAt',
  useCmdEnterToSend: false
};
