"use server";

import { prisma } from "./db";
import { auth } from "./auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Creates a new project within the user's active organization.
 */
export async function createProject(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.session.activeOrganizationId) {
    throw new Error("Unauthorized: No active organization found.");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      organizationId: session.session.activeOrganizationId,
    },
  });

  revalidatePath("/(app)/projects");
  return project;
}

/**
 * Records a new signal document upload in the database.
 */
export async function createSignalDocument(data: {
  projectId: string;
  intersection: string;
  fileName: string;
  s3UrlPdf: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const doc = await prisma.signalDocument.create({
    data: {
      projectId: data.projectId,
      intersection: data.intersection,
      fileName: data.fileName,
      s3UrlPdf: data.s3UrlPdf,
      status: "PENDING",
      uploadedById: session.user.id,
    },
  });

  revalidatePath(`/(app)/projects/${data.projectId}`);
  return doc;
}

/**
 * Fetches projects for the active organization.
 */
export async function getProjects() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session.activeOrganizationId) return [];

  return await prisma.project.findMany({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { documents: true },
      },
    },
  });
}
