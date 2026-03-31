// lib/auth.ts — Better Auth server configuration
// Plugins: emailAndPassword, organization (multi-tenant), twoFactor, google, microsoft

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins/two-factor";
import { prisma } from "./db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NODE_ENV === "production" ? "https://signal-traffic-controller-ui.vercel.app" : "http://localhost:3000")),
  appName: "Signal Phase Timing",

  // ── Database ────────────────────────────────────────────────────────
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ── Email & Password ────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set true in production with email provider
    minPasswordLength: 8,
    maxPasswordLength: 256,
    resetPasswordTokenExpiresIn: 60 * 30, // 30 minutes
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      // TODO: wire to Resend in production
      console.log(`[AUTH] Password reset link for ${user.email}: ${url}`);
    },
  },

  // ── Email Verification ──────────────────────────────────────────────
  emailVerification: {
    sendOnSignUp: false, // Enable in production
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[AUTH] Verify email for ${user.email}: ${url}`);
    },
  },

  // ── Social Providers ────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },

  // ── Plugins ─────────────────────────────────────────────────────────
  plugins: [
    twoFactor({
      issuer: "Signal Phase Timing",
      totpOptions: {
        digits: 6,
        period: 30,
      },
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          console.log(`[AUTH] 2FA OTP for ${user.email}: ${otp}`);
        },
        period: 5,
        allowedAttempts: 5,
        storeOTP: "encrypted",
      },
      backupCodeOptions: {
        amount: 10,
        length: 10,
        storeBackupCodes: "encrypted",
      },
      twoFactorCookieMaxAge: 600, // 10 minutes
      trustDeviceMaxAge: 30 * 24 * 60 * 60, // 30 days
    }),
    organization({
      allowUserToCreateOrganization: async (user) => {
        return user.emailVerified !== null;
      },
      organizationLimit: 5,
      membershipLimit: 100,
      creatorRole: "owner",
      sendInvitationEmail: async ({ email, organization, inviter, invitation }) => {
        const acceptUrl = `${process.env.BETTER_AUTH_URL}/accept-invite?id=${invitation.id}`;
        console.log(
          `[AUTH] Invite ${email} to ${organization.name} by ${inviter.user.name}: ${acceptUrl}`
        );
        // TODO: wire to Resend in production
      },
    }),
  ],

  // ── Session ────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 300,          // 5 min cache → fewer DB reads
      strategy: "jwe",      // Encrypted cookie cache
    },
  },

  // ── Rate Limiting ──────────────────────────────────────────────────
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/api/auth/sign-in/email": { window: 60, max: 5 },
      "/api/auth/sign-up/email": { window: 60, max: 3 },
    },
  },

  // ── Trusted Origins ────────────────────────────────────────────────
  trustedOrigins: [
    "http://localhost:3000",
    "https://signal-traffic-controller-ui.vercel.app",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    process.env.BETTER_AUTH_URL ?? "",
  ].filter(Boolean) as string[],

  // ── Security ───────────────────────────────────────────────────────
  account: {
    encryptOAuthTokens: true,
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "spt", // Signal Phase Timing
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },

  // ── Audit Logging ──────────────────────────────────────────────────
  databaseHooks: ({
    session: {
      create: {
        after: async (data: any, ctx: any) => {
          const ip = ctx?.request?.headers?.get?.("x-forwarded-for") ?? "unknown";
          // Use optional chaining to prevent crashes if data is missing
          if (data) {
            console.log(`[AUDIT] New session — user=${(data as any).userId || "unknown"} ip=${ip}`);
          }
        },
      },
    },
    user: {
      update: {
        after: async ({ data, oldData }: any) => {
          if (oldData?.email !== data.email) {
            console.log(`[AUDIT] Email changed — user=${data.id}`);
          }
        },
      },
    },
  }) as any,
});

export type Session = typeof auth.$Infer.Session;
export type ActiveOrganization = (typeof auth.$Infer.Session.session) & {
  activeOrganizationId?: string | null;
};
