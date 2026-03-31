// lib/auth-client.ts — Better Auth React client
// Used in "use client" components only

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

// Fallback intelligently to Vercel domains if environment variables are not set in the deployed dashboard
const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 
  (process.env.NODE_ENV === "production" ? "https://signal-traffic-controller-ui.vercel.app" : "http://localhost:3000"));

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/2fa";
      },
    }),
    organizationClient(),
  ],
});

// Named exports for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
