"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FolderPlus, ChevronLeft, Building2, LayoutPanelLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createProject } from "@/lib/actions";

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const project = await createProject(formData);
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create project. Please ensure you have an active organization.");
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to projects
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FolderPlus className="size-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Project</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Group your signal controller PDFs by corridor or city region.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                Project Name
              </label>
              <div className="relative">
                <LayoutPanelLeft className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g., Downtown Corridor Phase 1"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-foreground">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Brief details about the intersections or the client's engineering contract."
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-bold rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Creating project...
                  </>
                ) : "Create Project"}
              </button>
              <Link
                href="/projects"
                className="px-6 py-3 border border-border hover:bg-muted text-foreground font-medium rounded-xl text-sm transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Tip section */}
        <div className="mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
          <Building2 className="size-6 text-blue-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Collaborative Workspaces</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Once created, you can invite your engineering team to this project to co-manage PDFs and review extraction accuracy before downloading the UTDF data.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
