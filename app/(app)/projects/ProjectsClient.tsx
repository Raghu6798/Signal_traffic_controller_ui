"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FolderOpen, Plus, Search, FileText, MoreHorizontal,
  Calendar, CheckCircle, FolderPlus, ArrowRight
} from "lucide-react";

// Types
type Project = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string | Date;
  _count?: {
    documents: number;
  };
};

// Stat pill
function StatPill({ icon: Icon, value, color }: { icon: React.ElementType; value: string | number; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${color}`}>
      <Icon className="size-3.5" />
      <span>{value}</span>
    </div>
  );
}

export function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialProjects.filter((p) => {
    return p.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize signal timing PDFs by corridor or client contract.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-white/90 text-black font-bold rounded-xl text-sm transition-all shadow-xl shadow-white/5 active:scale-95"
        >
          <Plus className="size-4" /> New Project
        </Link>
      </motion.div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
        </div>
      </motion.div>

      {/* Projects grid / empty state */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center rounded-2xl border-2 border-dashed border-border"
          >
            <div className="size-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <FolderPlus className="size-8 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">
                {search ? "No matches found" : "No projects started yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                {search
                  ? `There are no projects matching "${search}". Please try another search term.`
                  : "Begin your first signal timing project to start extracting UTDF data from legacy controller PDFs."}
              </p>
            </div>
            {!search && (
              <Link
                href="/projects/new"
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black font-bold rounded-xl text-sm transition-all mt-2 shadow-xl shadow-white/5 active:scale-95"
              >
                <Plus className="size-4" /> Create first project
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="group block rounded-xl border border-border bg-card hover:border-blue-500/30 transition-all p-6 relative overflow-hidden"
                >
                  {/* Subtle color accent */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FolderOpen className="size-4 text-blue-500" />
                    </div>
                    <button
                      className="size-8 rounded-lg hover:bg-accent flex items-center justify-center transition-all"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="size-4 text-muted-foreground" />
                    </button>
                  </div>

                  <h3 className="font-bold text-foreground mb-1 group-hover:text-blue-500 transition-colors">
                    {project.name}
                  </h3>
                  {project.description ? (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  ) : (
                    <div className="h-4" />
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <StatPill 
                      icon={FileText} 
                      value={`${project._count?.documents ?? 0} PDFs`} 
                      color="text-muted-foreground" 
                    />
                    <StatPill 
                      icon={Calendar} 
                      value={new Date(project.createdAt).toLocaleDateString()} 
                      color="text-muted-foreground" 
                    />
                    <ArrowRight className="size-4 text-blue-500 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
