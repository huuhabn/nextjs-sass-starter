import { passkey } from '@better-auth/passkey';
import { serverDB } from '@sass/db';
import * as schema from '@sass/db/schemas';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink, twoFactor } from 'better-auth/plugins';

import { authEnv } from '@/env/auth';
import {
  emailService,
  getMagicLinkEmailTemplate,
  getResetPasswordEmailTemplate,
  getTwoFactorOTPEmailTemplate,
  getVerificationEmailTemplate
} from '@/lib/email';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const getOrigin = () => {
  try {
    return new URL(appUrl).origin;
  } catch {
    return 'http://localhost:3000';
  }
};

const getRpId = () => {
  try {
    return new URL(appUrl).hostname;
  } catch {
    return 'localhost';
  }
};

export const auth = betterAuth({
  baseURL: appUrl,
  secret:
    authEnv.AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    'dev_secret_key_at_least_32_characters_long_for_security',

  database: drizzleAdapter(serverDB, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.users,
      users: schema.users,
      session: schema.authSessions,
      auth_sessions: schema.authSessions,
      account: schema.accounts,
      accounts: schema.accounts,
      verification: schema.verifications,
      verifications: schema.verifications,
      twoFactor: schema.twoFactor,
      two_factor: schema.twoFactor,
      passkey: schema.passkey
    }
  }),

  user: {
    modelName: 'users',
    fields: {
      name: 'fullName',
      image: 'avatar'
    }
  },

  session: {
    modelName: 'auth_sessions',
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },

  account: {
    modelName: 'accounts',
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true
    }
  },

  verification: {
    modelName: 'verifications'
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      const template = getResetPasswordEmailTemplate({ url, name: user.name });
      await emailService.sendMail({
        to: user.email,
        ...template
      });
    }
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const template = getVerificationEmailTemplate({ url, name: user.name });
      await emailService.sendMail({
        to: user.email,
        ...template
      });
    }
  },

  socialProviders: {
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? {
          google: {
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET
          }
        }
      : {}),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? {
          github: {
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET
          }
        }
      : {})
  },

  plugins: [
    twoFactor({
      issuer: 'Acme SaaS',
      sendOTP: async ({
        user,
        otp
      }: {
        user: { email: string; name?: string | null };
        otp: string;
      }) => {
        const template = getTwoFactorOTPEmailTemplate({ otp, name: user.name ?? undefined });
        await emailService.sendMail({
          to: user.email,
          ...template
        });
      }
    }),
    passkey({
      rpID: getRpId(),
      rpName: 'Acme SaaS',
      origin: getOrigin()
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const template = getMagicLinkEmailTemplate({ url });
        await emailService.sendMail({
          to: email,
          ...template
        });
      }
    })
  ]
});

export type Auth = typeof auth;
