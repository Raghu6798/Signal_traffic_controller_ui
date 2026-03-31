"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, ShieldAlert, Key, Clipboard, 
  RotateCw, CheckCircle2, AlertCircle, Loader2,
  Lock, Copy, Shield, ShieldX, Smartphone
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { MagicCard } from "@/components/ui/MagicCard";
import { toast } from "sonner";
import Link from "next/link";

export default function SecuritySettingsPage() {
  const [isEnabling, setIsEnabling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordGate, setShowPasswordGate] = useState(false);

  const { data: session } = authClient.useSession();
  const twoFactorEnabled = session?.user.twoFactorEnabled;

  const handleEnableStart = async () => {
    // If user is Google/OAuth only, they won't have a password. 
    // We try to enable without password first. If it fails due to missing password, we show the gate.
    setIsLoading(true);
    try {
      // Conditionally pass password only if it exists to satisfy TS and avoid unnecessary prompts for OAuth users
      const options = confirmPassword ? { password: confirmPassword } : {};
      const { data, error } = await authClient.twoFactor.enable(options as any);
      
      if (error) {
        // Better Auth error for missing password usually looks like this
        if (error.status === 400 && !confirmPassword) {
          setShowPasswordGate(true);
          setIsLoading(false);
          return;
        }
        throw error;
      }
      
      setQrCode(data.totpURI);
      setIsEnabling(true);
      setShowPasswordGate(false);
      setConfirmPassword("");
      toast.info("Scan the QR code to continue");
    } catch (err: any) {
      toast.error(err.message || "Failed to start 2FA enablement.");
      setConfirmPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code: otp,
      });
      if (error) throw error;

      setBackupCodes((data as any).backupCodes || []);
      setQrCode(null);
      toast.success("2FA successfully enabled!");
    } catch (err: any) {
      toast.error(err.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirmPassword) {
      setShowPasswordGate(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const options = confirmPassword ? { password: confirmPassword } : {};
      const { error } = await authClient.twoFactor.disable(options as any);
      
      if (error) {
        if (error.status === 400 && !confirmPassword) {
           setShowPasswordGate(true);
           setIsLoading(false);
           return;
        }
        throw error;
      }
      
      toast.success("2FA has been disabled.");
      setShowPasswordGate(false);
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to disable 2FA");
      setConfirmPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Page Hero */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Security</h1>
        <p className="text-white/50">Secure your account with two-factor authentication and advanced protections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Security Card */}
        <div className="lg:col-span-2 space-y-6">
          <MagicCard 
            mode="orb"
            glowFrom={twoFactorEnabled ? "#10b981" : "#3b82f6"}
            className="w-full rounded-3xl border border-white/10 bg-[#0D1425]/40 backdrop-blur-xl p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${twoFactorEnabled ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-white/5 border border-white/10 text-white/40"}`}>
                  {twoFactorEnabled ? <ShieldCheck className="size-8" /> : <ShieldAlert className="size-8" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Two-Factor Authentication 
                    {twoFactorEnabled && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>}
                  </h2>
                  <p className="text-sm text-white/50 mt-1 max-w-sm">
                    {twoFactorEnabled 
                      ? "Your account is protected by an additional verification layer." 
                      : "Add an extra layer of security to your account by requiring more than just a password to log in."}
                  </p>
                </div>
              </div>

              {!twoFactorEnabled ? (
                <button
                  onClick={handleEnableStart}
                  disabled={isLoading || isEnabling}
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm transition-all hover:scale-[1.03] active:scale-95 shadow-xl shadow-white/5"
                >
                  Enable 2FA
                </button>
              ) : (
                <button
                  onClick={handleDisable}
                  disabled={isLoading}
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl text-sm transition-all border border-red-500/20"
                >
                  Disable
                </button>
              )}
            </div>

            {/* Password Gate */}
            <AnimatePresence>
              {showPasswordGate && !isEnabling && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-white/5 space-y-4"
                >
                  <p className="text-sm text-white/60">Please confirm your password to manage security settings.</p>
                  <div className="flex gap-3 max-w-sm">
                    <input 
                      type="password"
                      placeholder="Current password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/40 transition-all"
                    />
                    <button
                      onClick={handleEnableStart}
                      disabled={isLoading || !confirmPassword}
                      className="px-6 py-2.5 bg-white text-black font-bold rounded-xl text-sm transition-all hover:bg-white/90 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="size-4 animate-spin border-t-black" /> : "Confirm"}
                    </button>
                    <button
                      onClick={() => setShowPasswordGate(false)}
                      className="px-4 py-2.5 text-white/30 hover:text-white transition-colors text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enablement Workflow */}
            <AnimatePresence>
              {isEnabling && qrCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-10 pt-10 border-t border-white/5 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <span className="size-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                        Scan QR Code
                      </h3>
                      <p className="text-sm text-white/40 leading-relaxed">
                        Open your authenticator app (Google Authenticator, Authy, etc.) and scan the QR code below.
                      </p>
                      <div className="size-48 p-3 bg-white rounded-2xl shadow-2xl mx-auto md:mx-0">
                         <img 
                           src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(qrCode)}&choe=UTF-8`} 
                           alt="QR Code"
                           className="size-full object-contain"
                         />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <span className="size-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                        Verify Code
                      </h3>
                      <p className="text-sm text-white/40 leading-relaxed">
                        Enter the 6-digit code currently displayed in your authenticator app to complete setup.
                      </p>
                      <input 
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-black tracking-[0.4em] text-center focus:outline-none focus:border-white/40 transition-all placeholder:text-white/10"
                        maxLength={6}
                      />
                      <button
                        onClick={handleVerifyAndEnable}
                        disabled={isLoading || otp.length !== 6}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-xl shadow-white/5 hover:bg-white/90 transition-all"
                      >
                        Complete Activation
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Backup Codes */}
            {backupCodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-10 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4"
              >
                <div className="flex items-center gap-3 text-amber-400">
                  <AlertCircle className="size-5" />
                  <h3 className="font-bold">Save your backup codes!</h3>
                </div>
                <p className="text-sm text-white/50">If you lose access to your authenticator app, these codes are the only way back into your account.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {backupCodes.map(code => (
                    <div key={code} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs font-mono text-white/70 text-center">
                      {code}
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors">
                  <Copy className="size-3" /> Copy all codes
                </button>
              </motion.div>
            )}
          </MagicCard>

          {/* Secondary protections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="rounded-2xl border border-white/5 bg-white/3 p-6 space-y-4 hover:bg-white/5 transition-colors">
                <div className="size-10 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-400">
                   <Key className="size-5" />
                </div>
                <h3 className="font-bold text-white">Password</h3>
                <p className="text-sm text-white/40 leading-relaxed">Update your password to prevent unauthorized access.</p>
                <button className="text-sm font-bold text-white hover:text-blue-400 transition-colors">Update password →</button>
             </div>
             <div className="rounded-2xl border border-white/5 bg-white/3 p-6 space-y-4 hover:bg-white/5 transition-colors">
                <div className="size-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                   <Smartphone className="size-5" />
                </div>
                <h3 className="font-bold text-white">Sessions</h3>
                <p className="text-sm text-white/40 leading-relaxed">View and manage all your active browser sessions.</p>
                <button className="text-sm font-bold text-white hover:text-blue-400 transition-colors">Manage sessions →</button>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="rounded-2xl border border-white/10 bg-[#0D1425] p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                 <Shield className="size-4 text-blue-400" />
                 Safety Tips
              </h3>
              <ul className="space-y-3 text-sm text-white/40">
                 <li className="flex gap-3">
                    <span className="size-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    Use a dedicated authenticator app like Authy or Google Authenticator.
                 </li>
                 <li className="flex gap-3">
                    <span className="size-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    Never share your backup codes or verification codes with anyone. 
                 </li>
                 <li className="flex gap-3">
                    <span className="size-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    Enable 2FA for all team members in the Team Settings.
                 </li>
              </ul>
           </div>

           <Link href="/support" className="block p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
              <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Lost Access?</h3>
              <p className="text-sm text-white/40 mt-1">Contact our security team if you've lost your device and backup codes.</p>
           </Link>
        </div>
      </div>
    </div>
  );
}
