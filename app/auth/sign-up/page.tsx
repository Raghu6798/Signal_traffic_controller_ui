"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, User, AlertCircle, Check, Chrome, Building2 } from "lucide-react";
import { MagicCard } from "@/components/ui/MagicCard";
import { signUp, signIn } from "@/lib/auth-client";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number or symbol", pass: /[\d\W]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
            i < score
              ? score === 1 ? "bg-red-500" : score === 2 ? "bg-amber-500" : "bg-emerald-500"
              : "bg-white/10"
          }`} />
        ))}
      </div>
      <div className="flex gap-4">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1 text-xs transition-colors ${c.pass ? "text-emerald-400" : "text-white/30"}`}>
            <Check className="size-3" />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<"google" | "microsoft" | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: authError } = await signUp.email(
      {
        name,
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onSuccess() {
          router.push("/dashboard");
        },
        onError(ctx) {
          setError(ctx.error.message ?? "Sign up failed. Please try again.");
          setIsLoading(false);
        },
      }
    );

    if (authError) {
      setError(authError.message ?? "Something went wrong.");
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "microsoft") => {
    setSocialLoading(provider);
    await signIn.social({ provider, callbackURL: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-[#060B18] flex items-center justify-center px-4 relative overflow-hidden py-12">
      {/* Background glows */}
      <div className="absolute top-1/4 right-1/3 size-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 size-64 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6 my-12">
        <MagicCard
          mode="orb"
          glowFrom="#ffffff"
          glowTo="#ffffff"
          glowSize={350}
          glowOpacity={0.25}
          className="w-full rounded-3xl border border-white/10 bg-[#0D1425]/60 backdrop-blur-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
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
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>

            </div>

            {/* Social buttons */}
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
                {socialLoading === "google" ? "Redirecting..." : "Sign up with Google"}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-white/30">or with email</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
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

              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm text-white/60 font-medium">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith, PE"
                    required
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm text-white/60 font-medium">Work email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@kimley-horn.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm text-white/60 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    autoComplete="new-password"
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
                {password && <PasswordStrength password={password} />}
              </div>

              {/* Terms */}
              <p className="text-xs text-white/30 mt-1">
                By signing up you agree to our{" "}
                <Link href="/terms" className="text-white/50 hover:text-white underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-white/50 hover:text-white underline">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={isLoading || !!socialLoading}
                className="w-full py-4 px-4 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    Creating account...
                  </>
                ) : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-8">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="text-white hover:text-white/80 font-bold transition-all underline underline-offset-4 decoration-white/20">
                Sign in
              </Link>
            </p>
          </div>
        </MagicCard>
      </div>
    </div>
  );
}
