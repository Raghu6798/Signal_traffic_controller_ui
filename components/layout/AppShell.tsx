"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderOpen, Users, Settings, CreditCard,
  ChevronRight, ChevronDown, Plus, Building2, Zap, Menu, X,
  LogOut, Sun, Moon, User, Bell, Search, ChevronUp
} from "lucide-react";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import { signOut, useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/auth";
import { useTheme } from "next-themes";

// ─── Nav item config ─────────────────────────────────────────────────────────
const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: FolderOpen,      label: "Projects",  href: "/projects" },
  { icon: Users,           label: "Team",       href: "/team" },
  { icon: Settings,        label: "Settings",   href: "/settings" },
  { icon: CreditCard,      label: "Billing",    href: "/settings/billing" },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  collapsed,
  onToggle,
  session,
}: {
  collapsed: boolean;
  onToggle: () => void;
  session: Session;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 overflow-hidden"
    >
      {/* Logo / collapse toggle */}
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0">
        <button
          onClick={onToggle}
          className="flex items-center gap-2.5 w-full min-w-0 hover:opacity-80 transition-opacity"
        >
          <div className="size-9 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-xl shrink-0">
            <img 
              src="https://www.clipartmax.com/png/middle/322-3226527_street-clipart-signal-light-traffic-signal-vector.png" 
              alt="SignalPhase Logo"
              className="size-full object-cover"
            />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-sm text-sidebar-foreground whitespace-nowrap overflow-hidden"
              >
                Signal<span className="text-white">Phase</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Org + Project switcher */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2 border-b border-sidebar-border shrink-0">
          <OrgProjectSwitcher session={session} />
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isExact = pathname === item.href;
          const isChild = pathname.startsWith(item.href + "/") && !navItems.some(n => n.href !== item.href && n.href.length > item.href.length && (pathname === n.href || pathname.startsWith(n.href + "/")));
          const active = isExact || isChild;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="size-4 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="border-t border-sidebar-border p-2 shrink-0">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-all text-left"
          >
            {/* Avatar */}
            <div className="size-7 rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name} className="size-full object-cover" />
              ) : (
                <span>{session.user.name?.[0]?.toUpperCase() ?? "U"}</span>
              )}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-semibold text-sidebar-foreground truncate">{session.user.name}</p>
                  <p className="text-xs text-sidebar-foreground/40 truncate">{session.user.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && <ChevronUp className="size-3 text-sidebar-foreground/40 shrink-0" />}
          </button>

          {/* User dropdown */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-full mb-1 left-0 right-0 rounded-xl bg-card border border-border shadow-xl overflow-hidden z-50"
              >
                <Link href="/settings/account" className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground/70 hover:bg-accent hover:text-foreground transition-colors">
                  <User className="size-3.5" /> Account settings
                </Link>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground/70 hover:bg-accent hover:text-foreground transition-colors w-full text-left"
                >
                  {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full text-left"
                >
                  <LogOut className="size-3.5" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

// ─── Org & Project Switcher ───────────────────────────────────────────────────
function OrgProjectSwitcher({ session }: { session: Session }) {
  const [orgOpen, setOrgOpen] = useState(false);
  const { data: activeOrg } = authClient.useActiveOrganization();
  const orgName = activeOrg?.name || "My Organization";

  return (
    <div className="flex flex-col gap-1">
      {/* Org selector */}
      <button
        onClick={() => setOrgOpen(!orgOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-all w-full text-left"
      >
        <div className="size-5 rounded-md bg-white flex items-center justify-center shrink-0 shadow-sm">
          <Building2 className="size-3 text-black" />
        </div>
        <span className="flex-1 text-xs font-semibold text-sidebar-foreground truncate">{orgName}</span>
        <ChevronDown className={`size-3 text-sidebar-foreground/40 transition-transform ${orgOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {orgOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-2 pl-3 border-l border-sidebar-border flex flex-col gap-0.5 py-1">
              <Link href="/projects/new" className="flex items-center gap-1.5 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground px-2 py-1 rounded-md hover:bg-sidebar-accent transition-colors">
                <Plus className="size-3" /> New project
              </Link>
              <Link href="/settings/org" className="flex items-center gap-1.5 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground px-2 py-1 rounded-md hover:bg-sidebar-accent transition-colors">
                <Settings className="size-3" /> Org settings
              </Link>
              <div className="flex items-center gap-1">
                <button className="p-2 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors relative">
                  <Bell className="size-4" />
                  <span className="absolute top-2 right-2 size-2 bg-white rounded-full border-2 border-sidebar" />
                </button>
                <AnimatedThemeToggler 
                  className="p-2 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors rounded-lg hover:bg-sidebar-accent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────
function TopBar({
  mobileSidebarOpen,
  onMobileToggle,
  pageTitle,
}: {
  mobileSidebarOpen: boolean;
  onMobileToggle: () => void;
  pageTitle: string;
}) {
  return (
    <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      {/* Mobile burger */}
      <button className="lg:hidden text-foreground/60 hover:text-foreground transition-colors" onClick={onMobileToggle}>
        {mobileSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Breadcrumb / page title */}
      <h1 className="text-sm font-semibold text-foreground flex-1">{pageTitle}</h1>

      {/* Search */}
      <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted text-muted-foreground text-xs hover:border-foreground/20 transition-colors">
        <Search className="size-3.5" />
        Search intersections…
        <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-background border border-border font-mono">⌘K</kbd>
      </button>

      {/* Notifications */}
      <button className="relative size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
        <Bell className="size-4" />
        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
      </button>
    </header>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  const currentPage = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} session={session} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} session={session} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          mobileSidebarOpen={mobileSidebarOpen}
          onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          pageTitle={currentPage?.label ?? "Signal Phase Timing"}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
