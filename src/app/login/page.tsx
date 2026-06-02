"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, ArrowRight, Copy, Check, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Smartcode Mode states
  const [email, setEmail] = useState("");
  const [smartcodeStatus, setSmartcodeStatus] = useState<"idle" | "loading" | "setup" | "challenge">("idle");
  const [totpCode, setTotpCode] = useState("");
  const [setupDetails, setSetupDetails] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect them to dashboard
    const token = localStorage.getItem("authToken");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleInitiateTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setErrorMessage("");
    setSmartcodeStatus("loading");

    try {
      const res = await fetch("/api/auth/totp/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate login");
      }

      if (data.status === "setup") {
        setSetupDetails({
          secret: data.secret,
          otpauthUrl: data.otpauthUrl,
        });
        setSmartcodeStatus("setup");
      } else {
        setSmartcodeStatus("challenge");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate login");
      setSmartcodeStatus("idle");
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) return;
    setErrorMessage("");
    setSmartcodeStatus("loading");

    try {
      const res = await fetch("/api/auth/totp/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: totpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid code");
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify({ username: data.username, email: data.email }));
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid authenticator code");
      setSmartcodeStatus("setup");
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) return;
    setErrorMessage("");
    setSmartcodeStatus("loading");

    try {
      const res = await fetch("/api/auth/totp/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: totpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid code");
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify({ username: data.username, email: data.email }));
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid authenticator code");
      setSmartcodeStatus("challenge");
    }
  };

  const copyToClipboard = () => {
    if (setupDetails) {
      navigator.clipboard.writeText(setupDetails.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#091B11] text-[#FFFFF0] uppercase tracking-wider relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-[30px] border border-gold/15 relative z-10 shadow-2xl text-center mx-4"
      >
        {/* Architectural Gold Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal via-gold to-teal rounded-t-[30px]" />

        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
            <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22V2H11V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 6H15V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
              <path d="M15 11H19V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </svg>
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold tracking-widest text-white mb-2">
          SILVER <span className="text-gold font-normal">CROWN</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-semibold tracking-widest mb-8 normal-case">
          Secure Authenticator Portal
        </p>

        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-rose-950/40 border border-rose-900/60 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2 normal-case leading-relaxed"
            >
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {smartcodeStatus === "idle" && (
            <motion.form 
              key="email-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleInitiateTotp} 
              className="space-y-6 text-left"
            >
              <div className="space-y-2">
                <label htmlFor="email" className="text-[9px] text-white/50 tracking-[0.2em] uppercase ml-1 block font-bold">
                  Corporate Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@silvercrown.com"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-white transition-all font-sans lowercase"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold hover:bg-white text-[#091B11] font-bold tracking-[0.3em] uppercase py-5 text-[10px] transition-colors duration-300 flex items-center justify-center gap-2 active:scale-[0.99] shadow-lg shadow-gold/10"
              >
                <span>Request Smartcode</span>
                <ArrowRight size={14} />
              </button>
            </motion.form>
          )}

          {smartcodeStatus === "loading" && (
            <motion.div 
              key="loading-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Authorizing Secure Protocol...</p>
            </motion.div>
          )}

          {smartcodeStatus === "setup" && setupDetails && (
            <motion.div 
              key="setup-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 flex flex-col items-center"
            >
              <div className="bg-white p-3.5 rounded-[20px] inline-block shadow-2xl border border-white/10">
                <QRCodeSVG
                  value={setupDetails.otpauthUrl}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="w-full text-left space-y-4">
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider leading-relaxed normal-case text-center">
                  Scan this QR code with Google Authenticator, or input the secret key below manually.
                </p>

                <div className="p-3 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-between font-mono text-xs text-slate-300">
                  <span className="break-all select-all font-bold pr-2">{setupDetails.secret}</span>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="shrink-0 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gold transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <form onSubmit={handleVerifySetup} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="setupCode" className="text-[9px] text-white/50 tracking-[0.2em] uppercase ml-1 block font-bold text-center">
                      6-Digit Authenticator Code
                    </label>
                    <input
                      id="setupCode"
                      type="text"
                      required
                      maxLength={6}
                      pattern="\d{6}"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 text-center text-xl font-mono tracking-[0.6em] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-white transition-all"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { setSmartcodeStatus("idle"); setTotpCode(""); }}
                      className="flex-1 border border-white/15 hover:border-white/30 text-white font-bold tracking-widest uppercase py-4 text-[9px] transition-colors rounded-none"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={totpCode.length !== 6}
                      className="flex-1 bg-gold disabled:opacity-50 hover:bg-white text-[#091B11] font-bold tracking-widest uppercase py-4 text-[9px] transition-all"
                    >
                      Verify & Access
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {smartcodeStatus === "challenge" && (
            <motion.form 
              key="challenge-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleVerifyLogin} 
              className="space-y-6 text-left"
            >
              <div className="text-center space-y-2">
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider leading-relaxed normal-case">
                  Please enter the 6-digit smartcode generated by your Google Authenticator app for:
                </p>
                <p className="text-xs font-bold text-white lowercase tracking-normal font-sans bg-emerald-950/40 py-2.5 px-4 rounded-xl border border-emerald-900/40 inline-block">
                  {email}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="loginCode" className="text-[9px] text-white/50 tracking-[0.2em] uppercase ml-1 block font-bold text-center">
                  6-Digit Authenticator Code
                </label>
                <input
                  id="loginCode"
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 text-center text-xl font-mono tracking-[0.6em] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-white transition-all"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setSmartcodeStatus("idle"); setTotpCode(""); }}
                  className="flex-1 border border-white/15 hover:border-white/30 text-white font-bold tracking-widest uppercase py-4 text-[9px] transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={totpCode.length !== 6}
                  className="flex-1 bg-gold disabled:opacity-50 hover:bg-white text-[#091B11] font-bold tracking-widest uppercase py-4 text-[9px] transition-all"
                >
                  Verify & Access
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
