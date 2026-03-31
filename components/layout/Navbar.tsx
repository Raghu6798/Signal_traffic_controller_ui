"use client";

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { cn } from '@/lib/utils';
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navItems = [
  {
    label: 'Solutions',
    children: [
      { label: 'Signal OCR', description: 'Transform PDFs into digital data.', href: '#features' },
      { label: 'UTDF Generator', description: 'Synchro-ready CSV exports.', href: '#features' },
      { label: 'Live Pipeline', description: 'Monitor extractions in real-time.', href: '#use-cases' },
    ],
  },
  { label: 'Case Studies', href: '#use-cases' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
  {
    label: 'Resources',
    children: [
      { label: 'Support', description: 'Get help with your extractions.', href: '/support' },
      { label: 'API Docs', description: 'Integrate Signal OCR into your app.', href: '/docs/api' },
      { label: 'ROI Calculator', description: 'Calculate your team savings.', href: '#roi' },
    ],
  },
];

export default function Navbar() {
  const [isCompact, setIsCompact] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Scroll handler for compact mode
  useEffect(() => {
    const handleScroll = () => setIsCompact(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => router.push("/auth/sign-in"),
        },
    });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[100] px-6">
      <div
        className={cn(
          'mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl border backdrop-blur-md transition-all duration-500',
          isCompact ? 'px-5 py-2.5 bg-black/40 border-white/10 scale-95' : 'px-6 py-4 bg-black/20 border-white/5',
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className={cn(
             "rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-xl transition-all duration-500",
             isCompact ? "size-10" : "size-11"
          )}>
            <img 
              src="https://www.clipartmax.com/png/middle/322-3226527_street-clipart-signal-light-traffic-signal-vector.png" 
              alt="SignalPhase Logo"
              className="size-full object-cover"
            />
          </div>
          <div className={cn(
            "font-bold tracking-tight transition-all duration-500",
            isCompact ? "text-lg" : "text-xl"
          )}>
            Signal<span className="text-blue-400 group-hover:text-blue-300 transition-colors">Phase</span>
          </div>
        </Link>

        {/* --- DESKTOP NAV --- */}
        <nav ref={navRef} className="hidden items-center lg:flex gap-1">
          {navItems.map((item) => (
            <div key={item.label} className="relative">
              {item.children ? (
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  className={cn(
                    'flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-white/5',
                    openDropdown === item.label ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                  )}
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={cn(
                      'transition-transform duration-300',
                      openDropdown === item.label ? 'rotate-180' : ''
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  {item.label}
                </Link>
              )}

              {/* Dropdown Panel */}
              {item.children && openDropdown === item.label && (
                <div className="absolute left-1/2 mt-3 w-72 -translate-x-1/2 origin-top rounded-2xl border border-white/10 bg-[#0D1425]/90 p-2 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href || '#'}
                      onClick={() => setOpenDropdown(null)}
                      className="block rounded-xl p-3 text-left transition-all hover:bg-blue-600/10 group"
                    >
                      <p className="font-semibold text-sm text-white group-hover:text-blue-400">{child.label}</p>
                      <p className="text-xs text-white/50 mt-1">{child.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* --- AUTH ACTIONS --- */}
        <div className="flex items-center gap-4">


          {!isPending && !session ? (
            <>
              <Link href="/auth/sign-in" className="hidden text-sm font-medium text-white/60 hover:text-white transition-colors sm:block">
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className={cn(
                  'rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5',
                  isCompact ? 'bg-white text-black px-5 py-2 text-xs' : 'bg-white text-black px-6 py-2.5 text-sm'
                )}
              >
                Get Started
              </Link>
            </>
          ) : session ? (
            <div className="flex items-center gap-4 relative" ref={avatarRef}>
               <button 
                 onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                 className="size-10 rounded-full border border-white/10 bg-white/5 overflow-hidden shadow-lg p-0.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
               >
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} className="size-full rounded-full object-cover shadow-inner pointer-events-none" />
                  ) : (
                    <div className="size-full rounded-full bg-white/10 flex items-center justify-center text-xs font-bold pointer-events-none">
                       {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
               </button>

               {/* Avatar Dropdown Menu */}
               {avatarMenuOpen && (
                 <div className="absolute right-0 top-14 w-56 rounded-2xl border border-white/10 bg-[#060B18]/90 p-2 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                   <div className="px-3 py-2 border-b border-white/5 mb-2">
                     <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
                     <p className="text-xs text-white/50 truncate">{session.user.email}</p>
                   </div>
                   <div className="space-y-1">
                     <Link
                       href="/dashboard"
                       onClick={() => setAvatarMenuOpen(false)}
                       className="flex items-center gap-2 rounded-xl p-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                     >
                       <LayoutDashboard className="size-4" />
                       Dashboard
                     </Link>
                     <Link
                       href="/settings/profile"
                       onClick={() => setAvatarMenuOpen(false)}
                       className="flex items-center gap-2 rounded-xl p-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                     >
                       <Settings className="size-4" />
                       Settings
                     </Link>
                     <button
                       onClick={handleSignOut}
                       className="w-full flex items-center gap-2 rounded-xl p-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                     >
                       <LogOut className="size-4" />
                       Sign out
                     </button>
                   </div>
                 </div>
               )}
            </div>
          ) : null}

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[76px] z-[-1] bg-[#060B18]/95 backdrop-blur-3xl lg:hidden p-6 animate-in slide-in-from-top duration-300">
           <div className="flex flex-col gap-6">
              {navItems.map(item => (
                <div key={item.label}>
                   <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">{item.label}</h3>
                   {item.children ? (
                     <div className="grid grid-cols-1 gap-4 pl-2">
                        {item.children.map(c => (
                          <Link key={c.label} href={c.href} className="flex flex-col">
                             <span className="text-base font-semibold">{c.label}</span>
                             <span className="text-xs text-white/40">{c.description}</span>
                          </Link>
                        ))}
                     </div>
                   ) : (
                     <Link href={item.href || '#'} className="text-xl font-bold">{item.label}</Link>
                   )}
                </div>
              ))}
              <div className="pt-6 border-t border-white/5">
                 <Link href="/auth/sign-up" className="block w-full py-4 bg-white text-black text-center rounded-2xl font-bold shadow-xl shadow-white/10">Start Free Trial</Link>
              </div>
           </div>
        </div>
      )}
    </header>
  );
}
