import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isInVercel = process.env.VERCEL === '1';

// Vercel URL fallback order (by stability):
// 1. VERCEL_PROJECT_PRODUCTION_URL - project level, most stable
// 2. VERCEL_URL - deployment level, changes every deployment
// 3. VERCEL_BRANCH_URL - branch level, stable across deployments on same branch
const getVercelUrl = () => {
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `https://${process.env.VERCEL_BRANCH_URL}`;
};

const APP_URL =
  process.env.APP_URL ||
  (isInVercel
    ? getVercelUrl()
    : process.env.NODE_ENV === 'development'
      ? `http://localhost:${process.env.PORT || 3210}`
      : `http://localhost:${process.env.PORT || 3211}`);

const INTERNAL_APP_URL = process.env.INTERNAL_APP_URL || APP_URL;

const DEFAULT_S3_FILE_PATH = 'files';

export const getAppConfig = () => {
  const S3_PUBLIC_DOMAIN = process.env.S3_PUBLIC_DOMAIN;

  return createEnv({
    client: {
      NEXT_PUBLIC_ENABLE_SENTRY: z.boolean().optional(),
      NEXT_PUBLIC_S3_DOMAIN: z.string().optional(),
      NEXT_PUBLIC_S3_FILE_PATH: z.string().optional()
    },
    server: {
      APP_URL: z.string(),
      INTERNAL_APP_URL: z.string().optional(),
      VIDEO_GENERATION_PREFER_WEBHOOK: z.boolean().optional(),
      WEBHOOK_PROXY_URL: z.url().optional(),
      VERCEL_EDGE_CONFIG: z.string().optional(),
      MIDDLEWARE_REWRITE_THROUGH_LOCAL: z.boolean().optional(),

      SSRF_ALLOW_PRIVATE_IP_ADDRESS: z.boolean().optional(),
      SSRF_ALLOW_IP_ADDRESS_LIST: z.string().optional(),
      TELEMETRY_DISABLED: z.boolean().optional(),

      // DB
      DATABASE_DRIVER: z.enum(['neon', 'node']),
      DATABASE_POOL_ACQUIRE_TIMEOUT: z.coerce.number().int().min(0).optional(),
      DATABASE_STATEMENT_TIMEOUT: z.coerce.number().optional(),
      DATABASE_TEST_URL: z.string().optional(),
      DATABASE_URL: z.string().optional(),
      KEY_VAULTS_FALLBACK_SECRET: z.string().optional(),
      KEY_VAULTS_SECRET: z.string().optional(),
      REMOVE_GLOBAL_FILE: z.boolean().optional(),

      // S3
      S3_ACCESS_KEY_ID: z.string().optional(),
      S3_BUCKET: z.string().optional(),
      S3_ENABLE_PATH_STYLE: z.boolean(),
      S3_ENDPOINT: z.url().optional(),
      S3_INTERNAL_ENDPOINT: z.url().optional(),
      S3_PREVIEW_URL_EXPIRE_IN: z.number(),
      S3_PUBLIC_DOMAIN: z.string().optional(),
      S3_REGION: z.string().optional(),
      S3_SECRET_ACCESS_KEY: z.string().optional(),
      S3_SET_ACL: z.boolean()
    },
    runtimeEnv: {
      // Sentry
      NEXT_PUBLIC_ENABLE_SENTRY: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

      APP_URL,
      INTERNAL_APP_URL,
      VIDEO_GENERATION_PREFER_WEBHOOK: process.env.VIDEO_GENERATION_PREFER_WEBHOOK === '1',
      WEBHOOK_PROXY_URL: process.env.WEBHOOK_PROXY_URL,
      VERCEL_EDGE_CONFIG: process.env.VERCEL_EDGE_CONFIG,
      MIDDLEWARE_REWRITE_THROUGH_LOCAL: process.env.MIDDLEWARE_REWRITE_THROUGH_LOCAL === '1',

      SSRF_ALLOW_PRIVATE_IP_ADDRESS: process.env.SSRF_ALLOW_PRIVATE_IP_ADDRESS === '1',
      SSRF_ALLOW_IP_ADDRESS_LIST: process.env.SSRF_ALLOW_IP_ADDRESS_LIST,
      TELEMETRY_DISABLED: process.env.TELEMETRY_DISABLED === '1',

      // DB
      DATABASE_DRIVER: process.env.DATABASE_DRIVER || 'neon',
      DATABASE_POOL_ACQUIRE_TIMEOUT: process.env.DATABASE_POOL_ACQUIRE_TIMEOUT,
      DATABASE_STATEMENT_TIMEOUT: process.env.DATABASE_STATEMENT_TIMEOUT,
      DATABASE_TEST_URL: process.env.DATABASE_TEST_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      KEY_VAULTS_FALLBACK_SECRET: process.env.KEY_VAULTS_FALLBACK_SECRET,
      KEY_VAULTS_SECRET: process.env.KEY_VAULTS_SECRET,
      REMOVE_GLOBAL_FILE: process.env.DISABLE_REMOVE_GLOBAL_FILE !== '0',

      // S3
      NEXT_PUBLIC_S3_DOMAIN: process.env.NEXT_PUBLIC_S3_DOMAIN,
      NEXT_PUBLIC_S3_FILE_PATH: process.env.NEXT_PUBLIC_S3_FILE_PATH || DEFAULT_S3_FILE_PATH,

      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_BUCKET: process.env.S3_BUCKET,
      S3_ENABLE_PATH_STYLE: process.env.S3_ENABLE_PATH_STYLE === '1',
      S3_ENDPOINT: process.env.S3_ENDPOINT,
      S3_INTERNAL_ENDPOINT: process.env.S3_INTERNAL_ENDPOINT || undefined,
      S3_PREVIEW_URL_EXPIRE_IN: parseInt(process.env.S3_PREVIEW_URL_EXPIRE_IN || '7200'),
      S3_PUBLIC_DOMAIN,
      S3_REGION: process.env.S3_REGION,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
      S3_SET_ACL: process.env.S3_SET_ACL === '1'
    }
  });
};

export const appEnv = getAppConfig();
