"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { MagicCard } from "@/components/ui/MagicCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await (authClient as any).forgetPassword({
        email,
        redirectTo: "/auth/resetPassword",
      });

      if (error) throw error;
      
      setIsSent(true);
      toast.success("Password reset link sent to your email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060B18] p-6 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 size-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 size-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <MagicCard mode="orb" glowFrom="#60a5fa" className="relative w-full max-w-md p-8 rounded-3xl bg-[#0D1425]/40 border border-white/10 backdrop-blur-2xl z-10">
        <Link href="/auth/sign-in" className="inline-flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-white transition-colors mb-8">
           <ArrowLeft className="size-3" /> Back to Log in
        </Link>
        
        <div className="size-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 shadow-inner">
           <KeyRound className="size-5" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Forgot Password?</h1>
        <p className="text-sm text-white/50 mb-8 leading-relaxed">
          {isSent 
            ? "We've sent a secure password reset link to your email address. Please check your inbox." 
            : "No worries! Enter the email address associated with your account, and we'll send you a secure reset link."}
        </p>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-white/70 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/20 text-white shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl text-sm transition-all hover:bg-white/90 active:scale-95 shadow-xl shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin text-black" /> : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => {
              setIsSent(false);
              setEmail("");
            }}
            className="w-full py-3.5 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 font-bold border border-white/10 rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2"
          >
            Different Email? Try Again
          </button>
        )}
      </MagicCard>
    </div>
  );
}
