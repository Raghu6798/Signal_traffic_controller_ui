import { getProjects } from "@/lib/actions";
import { ProjectsClient } from "./ProjectsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient initialProjects={projects as any[]} />;
}
