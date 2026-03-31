// app/(app)/layout.tsx
// Protected app shell — wraps all authenticated routes
// Session guard: redirects to /auth/sign-in if no session

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  return (
    <AppShell session={session}>
      {children}
    </AppShell>
  );
}
