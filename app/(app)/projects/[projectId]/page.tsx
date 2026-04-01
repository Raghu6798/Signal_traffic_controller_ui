import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProjectDetailClient } from "./ProjectDetailClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({ where: { id: resolvedParams.projectId } });
  return { title: project?.name ?? "Project Details" };
}

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      organizationId: session.session.activeOrganizationId ?? undefined 
    },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
        include: { extractedData: true }
      }
    }
  });

  if (!project) notFound();

  return (
    <ProjectDetailClient 
      project={project as any} 
      user={session.user} 
    />
  );
}
