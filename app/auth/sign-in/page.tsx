"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { MagicCard } from "@/components/ui/MagicCard";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<"google" | "microsoft" | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: authError } = await signIn.email(
      {
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onSuccess(ctx) {
          if (ctx.data.twoFactorRedirect) {
            router.push("/auth/2fa");
          } else {
            router.push("/dashboard");
          }
        },
        onError(ctx) {
          setError(ctx.error.message ?? "Invalid email or password.");
          setIsLoading(false);
        },
      }
    );

    if (authError) {
      setError(authError.message ?? "Sign in failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "microsoft") => {
    setSocialLoading(provider);
    await signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen bg-[#060B18] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/3 size-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 size-64 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        <MagicCard
          mode="orb"
          glowFrom="#ffffff"
          glowTo="#ffffff"
          glowSize={350}
          glowOpacity={0.25}
          className="w-full rounded-3xl border border-white/10 bg-[#0D1425]/60 backdrop-blur-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="size-12 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-xl transition-transform group-hover:scale-110">
                  <img 
                    src="https://www.clipartmax.com/png/middle/322-3226527_street-clipart-signal-light-traffic-signal-vector.png" 
                    alt="SignalPhase Logo"
                    className="size-full object-cover"
                  />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  Signal<span className="text-white">Phase</span>
                </span>
              </Link>
              <p className="text-white/40 text-sm">Sign in to your workspace</p>
            </div>

            {/* Social sign-in */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={() => handleSocialSignIn("google")}
                disabled={!!socialLoading || isLoading}
                className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 text-white/80 hover:text-white text-sm font-medium transition-all disabled:opacity-50 group"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/500px-Google_%22G%22_logo.svg.png" 
                  alt="Google" 
                  className="size-4 group-hover:scale-110 transition-transform" 
                />
                {socialLoading === "google" ? "Redirecting..." : "Continue with Google"}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-white/30">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm text-white/60 font-medium">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.gov"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <label htmlFor="password" className="text-sm text-white/60 font-medium">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !!socialLoading}
                className="mt-2 w-full py-4 px-4 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    Signing in...
                  </>
                ) : "Sign in"}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-8">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="text-white hover:text-white/80 font-bold transition-all underline underline-offset-4 decoration-white/20">
                Sign up free
              </Link>
            </p>
          </div>
        </MagicCard>
      </div>
    </div>
  );
}
