"use client";

import { MagicCard } from "@/components/ui/MagicCard";
import { CreditCard, Wallet, Receipt, Zap, CheckCircle2, ArrowRight, Download, Lock } from "lucide-react";

export default function BillingSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Billing & Usage</h1>
          <p className="text-white/50">Manage your subscription, top up credits, and view payment history.</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-1">Available Credits</span>
          <div className="flex items-center gap-3">
             <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
               <Zap className="size-4 text-blue-400" />
             </div>
             <span className="text-4xl font-black text-white tracking-tight">0</span>
          </div>
        </div>
      </div>

      {/* Top Up / Tiers */}
      <div>
         <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="size-5 text-white/50" />
            Top Up Credits
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter Batch", credits: "1,000", price: "$49", desc: "For small intersection analyses." },
              { name: "Pro Batch", credits: "5,000", price: "$199", popular: true, desc: "For continuous monthly city-wide audits." },
              { name: "Enterprise", credits: "25,000", price: "$899", desc: "For large firms and massive historical data." }
            ].map((tier, i) => (
              <MagicCard key={i} mode="orb" glowFrom="#ffffff" className={`relative p-8 rounded-3xl backdrop-blur-2xl border transition-all ${tier.popular ? 'bg-white/[0.05] border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]' : 'bg-[#0D1425]/40 border-white/10 hover:border-white/20'}`}>
                 {tier.popular && (
                   <div className="absolute top-0 right-6 translate-y-[-50%] bg-white text-black px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl shadow-white/20">
                     Most Popular
                   </div>
                 )}
                 <h3 className="font-bold text-white mb-2 text-lg">{tier.name}</h3>
                 <p className="text-xs text-white/40 mb-8 leading-relaxed h-10">{tier.desc}</p>
                 <div className="flex items-baseline gap-2 mb-8 border-t border-white/5 pt-6">
                   <span className="text-4xl font-black text-white">{tier.price}</span>
                   <span className="text-xs font-semibold uppercase tracking-wider text-white/40">/ {tier.credits} cr</span>
                 </div>
                 <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${tier.popular ? 'bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10' : 'bg-white/5 text-white hover:bg-white/15 border border-white/10'}`}>
                    Purchase Now <ArrowRight className="size-4" />
                 </button>
              </MagicCard>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-white/5">
        {/* Payment Method */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="size-5 text-white/50" />
            Payment Method
          </h2>
          <div className="p-10 rounded-3xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-4 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all cursor-pointer h-40 shadow-inner">
             <div className="size-12 rounded-full bg-white/5 flex items-center justify-center">
                 <Wallet className="size-6 text-white/60" />
             </div>
             <span className="text-sm font-semibold tracking-wide">Add securely via Stripe</span>
          </div>
        </div>

        {/* Billing History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Receipt className="size-5 text-white/50" />
              Billing History
            </h2>
            <button className="text-xs font-bold text-white/50 hover:text-white transition-colors flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10">
              <Download className="size-3" /> Download All
            </button>
          </div>
          <div className="space-y-3">
             <div className="p-10 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center gap-4 h-40 shadow-inner">
                <Receipt className="size-8 text-white/20" />
                <div>
                   <h3 className="font-bold text-white/80">No Transactions Yet</h3>
                   <p className="text-xs text-white/40 mt-1 max-w-[200px]">Your invoices will appear here once you top up your account.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Secure footer */}
      <div className="flex items-center justify-center gap-2 pt-12 pb-4 text-white/20 text-xs font-semibold tracking-wide">
         <Lock className="size-3" />
         Payments processed securely via Stripe.
      </div>
    </div>
  );
}
