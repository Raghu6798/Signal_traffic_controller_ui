// app/(app)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DashboardClient } from "./DashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <DashboardClient user={session!.user} />;
}
