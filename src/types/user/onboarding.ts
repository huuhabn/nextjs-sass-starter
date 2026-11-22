import { z } from 'zod';

export interface UserOnboarding {
  currentStep?: number;

  finishedAt?: string;

  version: number;
}

export const OnboardingStep = {
  Welcome: 1,
  ConnectApps: 2,
  LearnYourWorld: 3,
  Profile: 4,
  ChiefAgent: 5,
  Messenger: 6,
  StarterTasks: 7
} as const;

export type OnboardingStep = (typeof OnboardingStep)[keyof typeof OnboardingStep];

export interface OnboardingCapabilities {
  analysis: boolean;
  composio: boolean;
  messenger: boolean;
  starterTasks: boolean;
}

export const MAX_ONBOARDING_STEPS = 7;

export const CLASSIC_ONBOARDING_MAX_STEP = 4;

export const UserOnboardingSchema = z.object({
  currentStep: z.number().min(1).max(MAX_ONBOARDING_STEPS).optional(),
  finishedAt: z.string().optional(),
  version: z.number()
});
