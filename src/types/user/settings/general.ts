export type HighlighterProps = Record<string, unknown>;
export type PrimaryColor = string;
export type MermaidProps = Record<string, unknown>;
export type NeutralColors = string;
export type ResponseAnimationStyle = string;

export type AnimationMode = 'disabled' | 'agile' | 'elegant';

export type ContextMenuMode = 'disabled' | 'default';

export type FollowUpBehavior = 'queue' | 'steer';

export type FollowUpMode = FollowUpBehavior | 'legacy';

export const resolveFollowUpMode = (
  labEnabled: boolean | undefined,
  setting: FollowUpBehavior | undefined
): FollowUpMode => (labEnabled ? (setting ?? 'steer') : 'legacy');

export interface UserGeneralConfig {
  animationMode?: AnimationMode;
  contextMenuMode?: ContextMenuMode;
  costEstimateWarningThreshold?: number;

  enableAutoScrollOnStreaming?: boolean;

  enableMessageLinkIcon?: boolean;

  enablePasteAutoConvert?: boolean;

  expandWorkflowWhileStreaming?: boolean;

  followUpBehavior?: FollowUpBehavior;

  fontAntialiasing?: boolean;
  fontSize: number;
  highlighterTheme?: HighlighterProps['theme'];
  isDevMode: boolean;
  isLiteMode: boolean;
  mermaidTheme?: MermaidProps['theme'];
  neutralColor?: NeutralColors;
  primaryColor?: PrimaryColor;
  responseLanguage?: string;

  showImageReadPreview?: boolean;
  telemetry: boolean;
  timezone?: string;
  transitionMode?: ResponseAnimationStyle;
}
