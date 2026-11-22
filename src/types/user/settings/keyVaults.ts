export interface OpenAICompatibleKeyVault {
  apiKey?: string;
  baseURL?: string;
}

export interface FalKeyVault {
  apiKey?: string;
}

export interface AzureOpenAIKeyVault {
  apiKey?: string;
  apiVersion?: string;
  baseURL?: string;

  endpoint?: string;
}

export interface AWSBedrockKeyVault {
  accessKeyId?: string;
  apiKey?: string;
  region?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

export interface VertexAIKeyVault {
  apiKey?: string;
  region?: string;
}

export interface CloudflareKeyVault {
  apiKey?: string;
  baseURLOrAccountID?: string;
}

export interface DoubaoSpeechKeyVault {
  accessToken?: string;

  apiKey?: string;

  appId?: string;
  baseURL?: string;
}

export interface ComfyUIKeyVault {
  apiKey?: string;
  authType?: 'none' | 'basic' | 'bearer' | 'custom';
  baseURL?: string;
  customHeaders?: Record<string, string>;
  password?: string;
  username?: string;
}

export interface GithubCopilotKeyVault {
  apiKey?: string;

  bearerToken?: string;

  bearerTokenExpiresAt?: string;

  oauthAccessToken?: string;
}

export interface SuperGrokKeyVault {
  oauthAccessToken?: string;

  oauthRefreshToken?: string;

  oauthTokenExpiresAt?: string;
}

export interface SearchEngineKeyVaults {
  searchxng?: {
    apiKey?: string;
    baseURL?: string;
  };
}

export interface UserKeyVaults extends SearchEngineKeyVaults {
  search1api?: OpenAICompatibleKeyVault;
}
