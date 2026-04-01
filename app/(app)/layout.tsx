import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const memberships = await prisma.member.count({
    where: { userId: session.user.id }
  });

  if (memberships === 0) {
    redirect("/onboarding");
  }

  return <AppShell session={session}>{children}</AppShell>;
}