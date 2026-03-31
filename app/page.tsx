"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  FileText, Cpu, Download, ChevronRight, Check, ArrowRight,
  Building2, Globe, Shield, Zap, BarChart3, Users, Clock,
  Menu, X, Star, TrendingUp, Lock, Server, Mail
} from "lucide-react";
import MagicBento from "@/components/ui/BentoGrid";
import ElectricBorder from "@/components/ui/electricBorder";
import Navbar from "@/components/layout/Navbar";
import SplitText from "@/components/ui/SplitText";

// ─── helpers ────────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── data ───────────────────────────────────────────────────────────────────
const features = [
  {
    icon: FileText,
    title: "Intelligent OCR",
    description: "Mistral AI reads scanned PDFs, handwritten notes, and legacy controller formats with 99.2% accuracy — no templates required.",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
  },
  {
    icon: Cpu,
    title: "Phase & Ring Extraction",
    description: "Gemini 2.5 Pro reconstructs barrier-ring-point sequences, dual-entry flags, and timing plans from heterogeneous MM section maps.",
    color: "from-violet-500/20 to-violet-600/5",
    border: "border-violet-500/20",
  },
  {
    icon: Download,
    title: "UTDF CSV Generation",
    description: "Produces standards-compliant UTDF CSVs ready for direct import into Synchro, Vissim, or any traffic simulation tool.",
    color: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/20",
  },
  {
    icon: Zap,
    title: "Real-Time Visualizer",
    description: "Watch every extraction step live — Day Plan, Barrier Mode, Ring sequences — with source PDF page highlights.",
    color: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/20",
  },
  {
    icon: Shield,
    title: "SOC2-Ready Infrastructure",
    description: "AWS Lambda + S3 with encryption at rest. Role-based access control. Audit logs for every extraction. GDPR compliant.",
    color: "from-red-500/20 to-red-600/5",
    border: "border-red-500/20",
  },
  {
    icon: Users,
    title: "Multi-Tenant Workspaces",
    description: "Organize by agency and project. Invite engineers by email. Owner/Admin/Member/Viewer roles with granular permissions.",
    color: "from-cyan-500/20 to-cyan-600/5",
    border: "border-cyan-500/20",
  },
];

const useCases = [
  {
    label: "Traffic Firms",
    icon: Building2,
    title: "Built for Kimley-Horn, HDR, and WSP",
    description: "Process thousands of controller PDFs per month across multiple DOT clients. Batch upload by corridor, download organized UTDFs, and bill by project.",
    items: ["Multi-project workspaces", "Client org separation", "API access for automation", "Usage-based billing"],
  },
  {
    label: "DOTs & Agencies",
    icon: Globe,
    title: "Purpose-built for Government Engineering Teams",
    description: "Replace manual data entry across legacy NEMA and Type 170 controllers. Maintain full audit trails for compliance and QA sign-off.",
    items: ["SSO with Microsoft / Active Directory", "Audit logs for FHWA compliance", "Batch intersection processing", "Secure FedRAMP-aligned hosting"],
  },
  {
    label: "Municipalities",
    icon: BarChart3,
    title: "City Traffic Divisions Moving at Speed",
    description: "Digitize your entire library of signal timing PDFs in days, not months. No specialized OCR knowledge required — upload and download.",
    items: ["Drag-and-drop upload", "Intersection name search", "Email notifications", "Downloadable invoices for procurement"],
  },
];

const pricing = [
  {
    name: "Pay-Per-PDF",
    price: "₹350",
    unit: "/ PDF",
    desc: "Perfect for occasional processing or evaluation.",
    features: ["No monthly commitment", "UTDF CSV download", "Standard OCR accuracy", "Email support"],
    cta: "Start Processing",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₹20,000",
    unit: "/ month",
    desc: "For active traffic engineering firms — 100 PDFs included.",
    features: ["100 PDFs / month", "Multi-user workspaces", "Priority processing", "API access", "Audit logs", "Email + chat support"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "",
    desc: "For DOTs and large agencies with volume needs.",
    features: ["Unlimited PDFs", "SSO (Google, Microsoft)", "Custom integrations", "SLA guarantee", "Dedicated support", "On-premise option"],
    cta: "Book a Demo",
    highlighted: false,
  },
];

const testimonials = [
  {
    quote: "We processed 6 months of signal timing backlog in a single afternoon. What used to take a junior engineer two weeks now takes minutes.",
    name: "David Okafor, PE",
    role: "Traffic Engineering Manager",
    org: "City of Sacramento DOT",
    stars: 5,
  },
  {
    quote: "The Gemini-powered extraction handles our NEMA TS-2 controller PDFs flawlessly, even the ones with handwritten corrections.",
    name: "Sarah Chen",
    role: "Senior Transportation Engineer",
    org: "Kimley-Horn & Associates",
    stars: 5,
  },
  {
    quote: "UTDF output drops straight into Synchro with no manual cleanup. This is the missing piece our team has needed for years.",
    name: "Marcus Webb, PTOE",
    role: "Signal Operations Lead",
    org: "Caltrans District 4",
    stars: 5,
  },
];

const integrations = [
  { name: "Synchro", color: "#00529B" },
  { name: "Vissim", color: "#E53935" },
  { name: "Econolite", color: "#1B5E20" },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

function PricingContent({ p }: { p: typeof pricing[0] }) {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-black text-white">{p.price}</span>
          <span className="text-white/40 text-sm">{p.unit}</span>
        </div>
        <p className="text-sm text-white/50">{p.desc}</p>
      </div>
      <ul className="flex flex-col gap-3 flex-1 mb-8">
        {p.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-white/70">
            <Check className="size-4 text-emerald-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/auth/sign-up"
        className={`block text-center py-3 rounded-xl font-bold text-sm transition-all shadow-xl shadow-white/5 ${
          p.highlighted
            ? "bg-white text-black hover:bg-white/90"
            : "border border-white/15 hover:border-white/30 text-white/80 hover:text-white"
        }`}
      >
        {p.cta}
      </Link>
    </>
  );
}

// ─── main component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoursPerPdf, setHoursPerPdf] = useState(2);
  const [pdfsPerMonth, setPdfsPerMonth] = useState(50);
  const [hourlyRate, setHourlyRate] = useState(2500);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);

  const monthlyHoursSaved = hoursPerPdf * pdfsPerMonth;
  const monthlySavings = monthlyHoursSaved * hourlyRate;
  const annualSavings = monthlySavings * 12;

  return (
    <div className="min-h-screen bg-[#060B18] text-white overflow-x-hidden font-sans">
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />

        {/* Glows */}
        <div className="absolute top-1/3 left-1/4 size-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 size-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div style={{ y: heroY }} className="relative max-w-7xl mx-auto px-6 text-center w-full">
    
    
          {/* Headline */}
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
              <SplitText 
                text="Turn Legacy Signal PDFs" 
                tag="span" 
                className="block text-white"
                delay={30}
              />
              <SplitText 
                text="into Synchro-Ready UTDFs" 
                tag="span" 
                 className="block py-4 overflow-visible middle-line-glow text-purple-500"
                delay={50}
                duration={1.0}
                threshold={0}
                rootMargin="0px"
              />
              <SplitText 
                text="in Seconds" 
                tag="span" 
                className="block text-white"
                delay={60}
              />
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              AI-powered extraction of Day Plans, Barrier-Ring-Point sequences, and Phase Timing Plans
              from heterogeneous traffic controller PDFs 
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/auth/sign-up"
                className="group flex items-center gap-2 px-8 py-4 bg-white hover:bg-white/90 text-black font-bold rounded-2xl text-base transition-all shadow-xl shadow-white/5 active:scale-95"
              >
                Dashboard   
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="flex items-center gap-2 px-8 py-4 border border-white/15 hover:border-white/30 text-white/80 hover:text-white font-medium rounded-xl text-base transition-all"
              >
                Book a Demo
              </Link>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.4}>
            <div className="inline-flex items-center gap-8 md:gap-12 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              {[
                { label: "PDFs Processed", end: 14800, suffix: "+" },
                { label: "Hours Saved", end: 42000, suffix: "+" },
                { label: "Avg. Accuracy", end: 99, suffix: ".2%" },
                { label: "Agencies Served", end: 38, suffix: "+" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-white">
                    <Counter end={s.end} suffix={s.suffix} />
                  </span>
                  <span className="text-xs text-white/40">{s.label}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </motion.div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-6">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs text-white/30 uppercase tracking-widest mb-6">Trusted by engineering teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40">
            {["Kimley-Horn", "HDR Engineering", "Caltrans", "FDOT", "City of Phoenix", "WSP USA"].map((name) => (
              <span key={name} className="text-sm font-semibold text-white/70">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Product Overview</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Everything your team needs</h2>
            <p className="text-white/50 max-w-xl mx-auto">From raw scanned PDF to clean UTDF CSV — automated, validated, and ready for your simulation software.</p>
          </div>
        </FadeIn>
        <div className="flex justify-center">
          <MagicBento 
            items={features.map(f => ({
              title: f.title,
              description: f.description,
              label: "Feature",
              color: "#0D1425"
            }))}
            glowColor="59, 130, 246" // Blue-500
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Workflow</span>
              <h2 className="text-4xl font-bold mt-3">Upload. Extract. Download.</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              { step: "01", icon: FileText, title: "Upload PDF", desc: "Drag-and-drop any signal controller PDF — scanned, digital, NEMA, Type 170, or TS-2." },
              { step: "02", icon: Cpu, title: "AI Extracts Timing", desc: "Mistral OCR + Gemini 2.5 Pro parse MM sections, reconstruct timing plans, and validate BRP logic." },
              { step: "03", icon: Download, title: "Download UTDF CSV", desc: "A Synchro-ready UTDF CSV is generated in seconds. Download, import, simulate." },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.1}>
                <div className="relative text-center p-8 rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:bg-white/5 hover:border-white/20 transition-all group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-8xl font-black text-white/[0.03] absolute -top-4 -right-2 select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">{s.step}</span>
                  <div className="relative size-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5 backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform">
                    <s.icon className="size-6 text-white" />
                  </div>
                  <h3 className="relative font-bold text-white mb-3 text-lg">{s.title}</h3>
                  <p className="text-sm text-white/50">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ──────────────────────────────────────────────────────── */}
      <section id="use-cases" className="py-24 max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Solutions</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Built for every team</h2>
          </div>
        </FadeIn>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {useCases.map((uc, i) => (
            <button
              key={uc.label}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === i
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white border border-white/10 hover:border-white/20"
              }`}
            >
              {uc.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="size-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/10 border border-white/10 flex items-center justify-center">
                {(() => { const Icon = useCases[activeTab].icon; return <Icon className="size-5 text-white/80" />; })()}
              </div>
              <h3 className="text-2xl font-bold">{useCases[activeTab].title}</h3>
            </div>
            <p className="text-white/60 mb-6 leading-relaxed">{useCases[activeTab].description}</p>
            <ul className="flex flex-col gap-2.5">
              {useCases[activeTab].items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/sign-up" className="group inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-white hover:bg-white/90 text-black font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95">
              Get started free
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-6 space-y-3">
            <div className="text-xs text-white/30 uppercase tracking-wider mb-4 font-medium">Live Pipeline — Signal 1st St @ D St</div>
            {[
              { label: "Document Analysis", status: "done" },
              { label: "Day Plan Extraction (MM 5-4)", status: "done" },
              { label: "Action Plan (MM 5-3)", status: "done" },
              { label: "Barrier Mode Analysis", status: "running" },
              { label: "Ring & Block Extraction", status: "pending" },
              { label: "UTDF Serialization", status: "pending" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/3 border border-white/5">
                <div className={`size-2 rounded-full shrink-0 ${
                  s.status === "done" ? "bg-emerald-400" :
                  s.status === "running" ? "bg-blue-400 animate-pulse" :
                  "bg-white/15"
                }`} />
                <span className="text-sm text-white/70 flex-1">{s.label}</span>
                {s.status === "done" && <Check className="size-3.5 text-emerald-400" />}
                {s.status === "running" && <span className="text-xs text-blue-400">Processing...</span>}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── ROI CALCULATOR ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">ROI Calculator</span>
              <h2 className="text-4xl font-bold mt-3 mb-3">See your savings</h2>
              <p className="text-white/50">Drag the sliders to calculate your team's annual time savings.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-8">
                {[
                  { label: "PDFs processed per month", value: pdfsPerMonth, setValue: setPdfsPerMonth, min: 5, max: 500, step: 5, suffix: " PDFs" },
                  { label: "Hours saved per PDF (manual vs AI)", value: hoursPerPdf, setValue: setHoursPerPdf, min: 0.5, max: 8, step: 0.5, suffix: " hrs" },
                  { label: "Engineer hourly rate", value: hourlyRate, setValue: setHourlyRate, min: 500, max: 10000, step: 500, suffix: "/hr", prefix: "₹" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">{s.label}</span>
                      <span className="text-white font-semibold">{s.prefix ?? ""}{s.value}{s.suffix}</span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={s.value}
                      onChange={(e) => s.setValue(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="p-8 space-y-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-center">
                    <p className="text-sm text-white/50 mb-1">Estimated Savings</p>
                    <div className="text-4xl font-black text-white">₹{annualSavings.toLocaleString()}</div>
                    <p className="text-xs text-blue-400 mt-1 uppercase tracking-widest font-bold">Per Year</p>
                  </div>
                  
                  <Link href="/auth/sign-up" className="block w-full py-4 bg-white text-black font-bold rounded-xl text-center hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">
                    Claim Your Savings
                  </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 max-w-6xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
           
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Simple, transparent pricing</h2>
            <p className="text-white/50">No per-seat fees. Pay for what you process.</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.1}>
              {p.highlighted ? (
                <ElectricBorder 
                  color="#3b82f6" 
                  speed={1.5} 
                  chaos={0.15} 
                  borderRadius={16}
                  className="h-full"
                >
                  <div className="relative rounded-2xl p-8 h-full flex flex-col bg-[#0D1425] border border-blue-500/30">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-xs font-bold rounded-full z-10">
                      Most Popular
                    </div>
                    <PricingContent p={p} />
                  </div>
                </ElectricBorder>
              ) : (
                <div className="relative rounded-2xl p-8 h-full flex flex-col bg-white/3 border border-white/10 hover:border-white/20 transition-all">
                  <PricingContent p={p} />
                </div>
              )}
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Testimonials</span>
              <h2 className="text-4xl font-bold mt-3">Trusted by real engineers</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="rounded-2xl border border-white/10 bg-white/3 p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role} · {t.org}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ───────────────────────────────────────────────────── */}
      <section id="about" className="py-20 max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-12">
          
            <h2 className="text-3xl font-bold mt-3 mb-3">Works with your existing tools</h2>
            <p className="text-white/50 text-sm">Drops into your current traffic engineering workflow , no new tooling required.</p>
          </div>
        </FadeIn>
        <div className="flex flex-wrap justify-center gap-4">
          {integrations.map((int, i) => (
            <FadeIn key={int.name} delay={i * 0.06}>
              <div className="px-6 py-3 rounded-xl border border-white/10 bg-white/3 hover:border-white/20 transition-all text-sm font-semibold text-white/70 hover:text-white">
                {int.name}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── SECURITY ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { icon: Lock, title: "SOC2-Ready", desc: "Encrypted at rest and in transit. Audit logs for every access." },
                { icon: Shield, title: "RBAC & SSO", desc: "Google & Microsoft SSO. Fine-grained role permissions per project." },
              ].map((s) => (
                <div key={s.title} className="flex flex-col items-center gap-3">
                  <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <s.icon className="size-5 text-white/60" />
                  </div>
                  <h3 className="font-semibold text-white">{s.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed max-w-52">{s.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <FadeIn>
          <div className="relative rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-600/15 to-blue-600/3 p-12 md:p-16">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/5 via-transparent to-violet-600/5" />
            <div className="relative">
              <TrendingUp className="size-10 text-blue-400 mx-auto mb-5" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to save <span className="text-blue-400">hundreds</span> of engineering hours?
              </h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">
                Join 38+ agencies already using Signal Phase Timing to automate their UTDF extraction workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link
  href="/auth/sign-up"
  className="px-8 py-4 bg-white text-black font-bold rounded-2xl border border-gray-200 hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 justify-center"
>
  Start Free Trial <ArrowRight className="size-4 text-black" />
</Link>
                <Link href="mailto:sales@signalphase.ai" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 justify-center">
                  <Mail className="size-4" />
                  Talk to sales
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl mb-3">
                <div className="size-12 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-lg">
                  <img 
                    src="https://www.clipartmax.com/png/middle/322-3226527_street-clipart-signal-light-traffic-signal-vector.png" 
                    alt="SignalPhase Logo"
                    className="size-full object-cover"
                  />
                </div>
                <span>Signal<span className="text-white">Phase</span></span>
              </div>
              <p className="text-xs text-white/40 max-w-52 leading-relaxed">
                AI-powered traffic signal PDF extraction for modern transportation agencies.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Solutions", links: ["Traffic Firms", "DOTs", "Municipalities", "API"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/30">
            <span>© 2026 Signal Phase Timing, Inc. All rights reserved.</span>
            <span>Built with Mistral OCR + Gemini 2.5 Pro + Next.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}