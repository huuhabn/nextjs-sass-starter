export interface SystemAgentItem {
  contextLimit?: number;
  customPrompt?: string;
  enabled?: boolean;
  model: string;
  provider: string;
}

export interface PromptRewriteSystemAgent extends Omit<SystemAgentItem, 'enabled'> {
  enabled: boolean;
}

export interface UserSystemAgentConfig {
  agentMeta: SystemAgentItem;

  asr: SystemAgentItem;

  channelRouting: SystemAgentItem;

  expertise: SystemAgentItem;
  followUpAction: SystemAgentItem;
  generationTopic: SystemAgentItem;

  goal: SystemAgentItem;
  inputCompletion: SystemAgentItem;

  onboardingTaskRecommender: SystemAgentItem;

  onboardingUnderstanding: SystemAgentItem;
  promptRewrite: PromptRewriteSystemAgent;
  thread: SystemAgentItem;
  topic: SystemAgentItem;

  topicAutoSummary: SystemAgentItem;
  translation: SystemAgentItem;

  verify: SystemAgentItem;
}

export interface UserMemoryServiceModelConfig {
  memoryAnalysisAgentConfig: SystemAgentItem;
  userMemoryEmbedding: SystemAgentItem;
  userMemoryPersonaWriter: SystemAgentItem;
}

export interface UserServiceModelConfig
  extends UserSystemAgentConfig, UserMemoryServiceModelConfig {}

export type ServiceModelTier = 'embedding' | 'flash' | 'main' | 'verify';

export interface ServiceModelTierItem {
  model: string;
  provider: string;
}

export type ServiceModelTierConfig = Partial<Record<ServiceModelTier, ServiceModelTierItem>>;

export type UserSystemAgentConfigKey = keyof UserSystemAgentConfig;
export type UserMemoryServiceModelConfigKey = keyof UserMemoryServiceModelConfig;
export type UserServiceModelConfigKey = keyof UserServiceModelConfig;

export const PERSONAL_SYSTEM_AGENT_KEYS = [
  'followUpAction',
  'inputCompletion'
] as const satisfies readonly UserSystemAgentConfigKey[];

export type PersonalSystemAgentKey = (typeof PERSONAL_SYSTEM_AGENT_KEYS)[number];
