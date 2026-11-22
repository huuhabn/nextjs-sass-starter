export type UserInterventionConfig = Record<string, unknown>;
export type WidgetDryRunGrant = Record<string, unknown>;

export interface UserToolConfig {
  crawlerImpls?: string[];
  humanIntervention?: UserInterventionConfig;

  searchProviders?: string[];

  uninstalledBuiltinTools?: string[];

  uninstalledBuiltinToolsByWorkspace?: Record<string, string[]>;

  widgetDryRunGrants?: WidgetDryRunGrant[];
}

export type UserChannelPreferences = Pick<UserToolConfig, 'crawlerImpls' | 'searchProviders'>;
