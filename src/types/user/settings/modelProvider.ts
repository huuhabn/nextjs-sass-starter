export type AiFullModelCard = Record<string, unknown>;
export type ModelProviderKey = string;
export type ChatModelCard = Record<string, unknown>;

export interface ProviderConfig {
  autoFetchModelLists?: boolean;

  customModelCards?: ChatModelCard[];
  enabled: boolean;

  enabledModels?: string[] | null;

  fetchOnClient?: boolean;

  latestFetchTime?: number;

  remoteModelCards?: ChatModelCard[];
  serverModelLists?: AiFullModelCard[];
}

export type GlobalLLMProviderKey = ModelProviderKey;

export type UserModelProviderConfig = Record<ModelProviderKey, ProviderConfig>;
