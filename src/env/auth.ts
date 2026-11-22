import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const INTERNAL_JWT_EXPIRATION_PATTERN =
  /^\d+(?:\.\d+)? ?(?:seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      /** Comma-separated origins merged into Better Auth's resolved trusted origins. */
      AUTH_ADDITIONAL_TRUSTED_ORIGINS?: string;
      AUTH_ALLOWED_EMAILS?: string;

      // ===== Better Auth ===== //
      /** Namespace every Better Auth cookie. Defaults to `better-auth`. */
      AUTH_COOKIE_PREFIX?: string;
      AUTH_DISABLE_EMAIL_PASSWORD?: string;

      AUTH_EMAIL_VERIFICATION?: string;
      AUTH_ENABLE_MAGIC_LINK?: string;
      AUTH_GITHUB_ID?: string;
      AUTH_GITHUB_SECRET?: string;

      AUTH_SECRET?: string;
      AUTH_SSO_PROVIDERS?: string;
      AUTH_TRUSTED_ORIGINS?: string;

      /**
       * Internal JWT expiration time for lambda → async calls.
       * Format: number followed by unit (s=seconds, m=minutes, h=hours)
       * Examples: '10s', '1m', '1h'
       * Should be as short as possible for security, but long enough to account for network latency and server processing time.
       * @default '30s'
       */
      INTERNAL_JWT_EXPIRATION?: string;

      // ===== JWKS Key ===== //
      JWKS_KEY?: string;
    }
  }
}

export const getAuthConfig = () => {
  return createEnv({
    client: {},
    server: {
      AUTH_COOKIE_PREFIX: z.string().optional(),
      AUTH_SECRET: z.string().optional(),
      AUTH_SSO_PROVIDERS: z.string().optional().default(''),
      AUTH_ADDITIONAL_TRUSTED_ORIGINS: z.string().optional(),
      AUTH_TRUSTED_ORIGINS: z.string().optional(),
      AUTH_EMAIL_VERIFICATION: z.boolean().optional().default(false),
      AUTH_ENABLE_MAGIC_LINK: z.boolean().optional().default(false),
      AUTH_ALLOWED_EMAILS: z.string().optional(),
      AUTH_DISABLE_EMAIL_PASSWORD: z.boolean().optional().default(false),

      AUTH_GOOGLE_ID: z.string().optional(),
      AUTH_GOOGLE_SECRET: z.string().optional(),

      AUTH_GITHUB_ID: z.string().optional(),
      AUTH_GITHUB_SECRET: z.string().optional(),

      // Generic JWKS key for signing/verifying JWTs
      JWKS_KEY: z.string().optional(),

      // Internal JWT expiration time (e.g., '10s', '1m', '1h')
      INTERNAL_JWT_EXPIRATION: z
        .string()
        .regex(
          INTERNAL_JWT_EXPIRATION_PATTERN,
          'INTERNAL_JWT_EXPIRATION needs a positive duration with a unit, e.g. "15s" or "1m"'
        )
        .default('30s')
    },

    runtimeEnv: {
      AUTH_ADDITIONAL_TRUSTED_ORIGINS: process.env.AUTH_ADDITIONAL_TRUSTED_ORIGINS,
      AUTH_COOKIE_PREFIX: process.env.AUTH_COOKIE_PREFIX,
      AUTH_EMAIL_VERIFICATION: process.env.AUTH_EMAIL_VERIFICATION === '1',
      AUTH_ENABLE_MAGIC_LINK: process.env.AUTH_ENABLE_MAGIC_LINK === '1',
      AUTH_SECRET: process.env.AUTH_SECRET,
      AUTH_SSO_PROVIDERS: process.env.AUTH_SSO_PROVIDERS,
      AUTH_TRUSTED_ORIGINS: process.env.AUTH_TRUSTED_ORIGINS,
      AUTH_ALLOWED_EMAILS: process.env.AUTH_ALLOWED_EMAILS,
      AUTH_DISABLE_EMAIL_PASSWORD: process.env.AUTH_DISABLE_EMAIL_PASSWORD === '1',

      // Auth Provider Credentials
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,

      AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
      AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,

      JWKS_KEY: process.env.JWKS_KEY,

      // Internal JWT expiration time
      INTERNAL_JWT_EXPIRATION: process.env.INTERNAL_JWT_EXPIRATION
    }
  });
};

export const authEnv = getAuthConfig();

// Auth headers and constants
export const NEXTJS_SASS_AUTH_HEADER = 'X-nextjs-sass-auth';
export const NEXTJS_SASS_OIDC_AUTH_HEADER = 'X-nextjs-sass-oidc-auth';
