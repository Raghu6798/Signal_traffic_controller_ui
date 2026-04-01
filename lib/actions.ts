"use server";

import { prisma } from "./db";
import { auth } from "./auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Creates a new project within the user's active organization.
 */
// lib/actions.ts

export async function createProject(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  let orgId = session.session.activeOrganizationId;

  // Automatically create a default organization if the user doesn't have an active one
  if (!orgId) {
    // Check if they belong to any org but just don't have it set as active
    const existingMembership = await prisma.member.findFirst({
      where: { userId: session.user.id }
    });

    if (existingMembership) {
      orgId = existingMembership.organizationId;
    } else {
      // Create a brand new default organization for the user
      const newOrg = await prisma.organization.create({
        data: {
          name: `${session.user.name.split(' ')[0]}'s Workspace`,
          slug: `workspace-${session.user.id.substring(0, 8).toLowerCase()}`,
          members: {
            create: {
              userId: session.user.id,
              role: "owner"
            }
          }
        }
      });
      orgId = newOrg.id;
    }

    // Update the current session to make this the active organization
    await prisma.session.update({
      where: { id: session.session.id },
      data: { activeOrganizationId: orgId }
    });
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      organizationId: orgId,
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


/**
 * Saves the extracted timing data to the database.
 */
export async function saveExtractionResult(documentId: string, data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await prisma.signalDocument.update({
    where: { id: documentId },
    data: { status: "COMPLETED" }
  });

  await prisma.extractedTiming.create({
    data: {
      documentId,
      rawJson: data,
      // Map these if your Python API returns them at the top level:
      cycleLength: data.cycle_length || null,
      offset: data.offset || null,
      isBarrierMode: data.is_barrier_mode || false,
    }
  });

  revalidatePath(`/(app)/projects`);
}