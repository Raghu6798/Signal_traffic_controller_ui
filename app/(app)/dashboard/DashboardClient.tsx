"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, CheckCircle, Clock, TrendingUp, Upload,
  ArrowRight, BarChart3, Zap, AlertTriangle
} from "lucide-react";
import { NumberTicker } from "@/components/ui/NumberTickers";

// Mock data (replace with real Prisma queries via server actions)
const stats = [
  { label: "PDFs Processed", value: 124, change: "+12 this week", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Hours Saved", value: 48, change: "vs. manual entry", icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Avg. Accuracy", value: 99, change: "Signal AI Engine v2", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", suffix: "%" },
  { label: "Agencies Served", value: 14, change: "Across 6 States", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

const recentActivity: { id: string; intersection: string; project: string; status: "COMPLETED" | "PROCESSING" | "FAILED" | "PENDING"; time: string }[] = [];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    COMPLETED:  { label: "Completed",  className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    PROCESSING: { label: "Processing", className: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse" },
    FAILED:     { label: "Failed",     className: "bg-red-500/10 text-red-400 border-red-500/20" },
    PENDING:    { label: "Pending",    className: "bg-white/5 text-foreground/40 border-white/10" },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.className}`}>
      {s.label}
    </span>
  );
}

export function DashboardClient({ user }: { user: { name?: string | null; email: string } }) {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {user.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening across your signal timing projects.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-white/90 text-black font-bold rounded-xl text-sm transition-all shadow-xl shadow-white/5 active:scale-95"
        >
          <Upload className="size-4" />
          Upload PDF
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between overflow-hidden relative group"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</span>
              <div className={`size-10 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <NumberTicker 
                value={stat.value}
                className="text-8xl font-medium tracking-tighter whitespace-pre-wrap text-foreground"
              />
              {stat.suffix && (
                <span className="text-4xl font-bold text-muted-foreground/30">{stat.suffix}</span>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
              <span className="text-emerald-500 font-bold">↑</span>
              {stat.change}
            </p>
            
            {/* Subtle background glow */}
            <div className={`absolute -right-4 -bottom-4 size-32 rounded-full blur-3xl opacity-10 ${stat.bg}`} />
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm text-foreground">Recent Extractions</h2>
            <Link href="/projects" className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">No extractions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Upload a signal timing PDF to get started.</p>
              </div>
              <Link
                href="/projects/new"
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black font-bold rounded-lg text-sm transition-all mt-2 shadow-lg shadow-white/5"
              >
                <Upload className="size-4" /> Upload first PDF
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                  <FileText className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.intersection}</p>
                    <p className="text-xs text-muted-foreground">{item.project} · {item.time}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions + tips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-4"
        >
          {/* Quick actions */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-sm text-foreground mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              {[
                { icon: Upload,   label: "Upload PDF",          href: "/projects/new",    color: "text-blue-400" },
                { icon: BarChart3, label: "View all projects",   href: "/projects",        color: "text-violet-400" },
                { icon: Zap,      label: "API documentation",   href: "/docs/api",        color: "text-amber-400" },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-all group"
                >
                  <a.icon className={`size-4 ${a.color}`} />
                  <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">{a.label}</span>
                  <ArrowRight className="size-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Getting started */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-foreground">Getting started</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Create your first project", done: false, href: "/projects/new" },
                { label: "Upload a signal timing PDF", done: false, href: "/projects/new" },
                { label: "Download your UTDF CSV", done: false, href: "/projects" },
                { label: "Invite team members", done: false, href: "/team" },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-2.5 text-xs">
                  <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${step.done ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"}`}>
                    {step.done && <CheckCircle className="size-2.5 text-white" />}
                  </div>
                  <Link href={step.href} className={`hover:text-foreground transition-colors ${step.done ? "line-through text-muted-foreground" : "text-foreground/70"}`}>
                    {step.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Usage alert */}

    </div>
  );
}
