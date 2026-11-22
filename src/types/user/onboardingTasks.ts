import { z } from 'zod';

export interface OnboardingTaskSource {
  subject?: string;

  title?: string;

  type: string;

  url: string;
}

export interface OnboardingSuggestedTask {
  checked: boolean;

  id: string;

  instruction: string;

  providerId: string;

  reason: string;

  sources: OnboardingTaskSource[];

  title: string;
}

export type OnboardingTaskRecommendationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'partial'
  | 'failed';

export interface OnboardingTaskRecommendationError {
  code: string;

  providerId: string;

  retryable: boolean;
}

export interface OnboardingTaskRecommendationSession {
  completedAt?: string;

  createdTaskIds: Record<string, string>;

  errors: OnboardingTaskRecommendationError[];

  id: string;

  providerIds: string[];

  recommendations: OnboardingSuggestedTask[];

  sourceFingerprint: string;

  status: OnboardingTaskRecommendationStatus;

  updatedAt: string;
}

export type OnboardingTaskRecommendationPollingResult = OnboardingTaskRecommendationSession;

export interface OnboardingTaskRecommendationTopicInput {
  topicId: string;
}

export interface CreateOnboardingTasksInput extends OnboardingTaskRecommendationTopicInput {
  recommendationIds: string[];

  sessionId: string;
}

const recommendationSchema = z
  .object({
    checked: z.boolean(),
    id: z.string().min(1).max(128),
    instruction: z.string().trim().min(1).max(4000),
    providerId: z.string().trim().min(1).max(128),
    reason: z.string().trim().min(1).max(1000),
    sources: z
      .array(
        z
          .object({
            subject: z.string().trim().min(1).max(500).optional(),
            title: z.string().trim().min(1).max(500).optional(),
            type: z.string().trim().min(1).max(128),
            url: z.string().trim().min(1).max(2048)
          })
          .strict()
      )
      .min(1)
      .max(16),
    title: z.string().trim().min(1).max(200)
  })
  .strict() satisfies z.ZodType<OnboardingSuggestedTask>;

const recommendationErrorSchema = z
  .object({
    code: z.string().min(1).max(128),
    providerId: z.string().min(1).max(128),
    retryable: z.boolean()
  })
  .strict() satisfies z.ZodType<OnboardingTaskRecommendationError>;

export const OnboardingTaskRecommendationSessionSchema = z
  .object({
    completedAt: z.string().optional(),
    createdTaskIds: z.record(z.string().max(128), z.string().max(512)),
    errors: z.array(recommendationErrorSchema).max(16),
    id: z.string().min(1).max(512),
    providerIds: z.array(z.string().min(1).max(128)).max(16),
    recommendations: z.array(recommendationSchema).max(48),
    sourceFingerprint: z.string().min(1).max(2048),
    status: z.enum(['pending', 'processing', 'completed', 'partial', 'failed']),
    updatedAt: z.string()
  })
  .strict() satisfies z.ZodType<OnboardingTaskRecommendationSession>;
