"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Lock } from "lucide-react";
import { MagicCard } from "@/components/ui/MagicCard";
import { authClient } from "@/lib/auth-client";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trustDevice, setTrustDevice] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (newCode.every((d) => d !== "")) handleVerify(newCode.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeStr?: string) => {
    const fullCode = codeStr ?? code.join("");
    if (fullCode.length < 6) return;
    setError(null);
    setIsLoading(true);

    const { error: authError } = await authClient.twoFactor.verifyTotp({
      code: fullCode,
      trustDevice,
    });

    if (authError) {
      setError(authError.message ?? "Invalid code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    await authClient.twoFactor.sendOtp();
    setIsResending(false);
    setError(null);
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#060B18] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 size-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <MagicCard
          mode="orb"
          glowFrom="#3b82f6"
          glowTo="#8b5cf6"
          glowSize={400}
          glowOpacity={0.4}
          className="w-full rounded-3xl border border-white/10 bg-[#0D1425]/40 backdrop-blur-2xl shadow-2xl overflow-hidden"
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
              </Link>
              <div className="flex justify-center mb-4">
                 <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Lock className="size-6 text-white" />
                 </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Two-Factor Auth</h1>
              <p className="text-white/50 text-sm">Enter the code from your authenticator app.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-5"
              >
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* OTP inputs */}
            <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`size-12 rounded-xl text-center text-xl font-bold text-white bg-white/5 border ${
                    digit ? "border-blue-500/60" : "border-white/10"
                  } focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                />
              ))}
            </div>

            {/* Trust device */}
            <label className="flex items-center gap-2.5 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="accent-blue-500 size-4 rounded"
              />
              <span className="text-sm text-white/50">Trust this device for 30 days</span>
            </label>

            {/* Verify button */}
            <button
              onClick={() => handleVerify()}
              disabled={code.some((d) => !d) || isLoading}
              className="w-full py-4 px-4 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5 disabled:bg-white/10 disabled:text-white/30 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin border-t-black" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Account
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            {/* Resend OTP */}
            <button
              onClick={handleResendOTP}
              disabled={isResending}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <RefreshCw className={`size-3.5 ${isResending ? "animate-spin" : ""}`} />
              {isResending ? "Sending..." : "Send code via email instead"}
            </button>
          </div>
        </MagicCard>

        <p className="text-center text-sm text-white/40 mt-6">
          <Link href="/auth/sign-in" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
