"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Mail, Lock, User, Eye, EyeOff, Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await signup(fullName.trim(), email.trim(), password);
    } catch (err: any) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "text-rose-400", "text-amber-400", "text-emerald-400"];
  const strengthBar = ["", "w-1/3 bg-rose-500", "w-2/3 bg-amber-500", "w-full bg-emerald-500"];

  return (
    <div className="min-h-screen bg-[#06141b] text-[#ccd0cf] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#253745] border border-[#4a5c6a] flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-[#ccd0cf]" />
            </div>
            <span className="text-2xl font-extrabold text-[#ccd0cf] tracking-tight">
              Kalemly<span className="text-[#9ba8ab]">AI</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#ccd0cf] mb-1">Create your account</h1>
          <p className="text-xs text-[#9ba8ab]">Start building custom AI chatbots for your business</p>
        </div>

        {/* Perks */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {["RAG-powered", "Multi-turn Memory", "Human Escalation"].map((f) => (
            <span key={f} className="flex items-center gap-1 text-[11px] text-[#ccd0cf] font-medium bg-[#11212d] border border-[#253745] px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {f}
            </span>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#11212d] border border-[#253745] rounded-3xl p-8 shadow-xl">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#ccd0cf] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5c6a]" />
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#ccd0cf] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5c6a]" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#ccd0cf] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5c6a]" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#06141b] border border-[#253745] text-xs text-[#ccd0cf] placeholder-[#4a5c6a] focus:outline-none focus:border-[#4a5c6a] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a5c6a] hover:text-[#ccd0cf] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full bg-[#06141b] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strengthBar[passwordStrength]}`} />
                  </div>
                  <p className={`text-[11px] font-medium ${strengthColor[passwordStrength]}`}>
                    {strengthLabel[passwordStrength]} password
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#253745] hover:bg-[#4a5c6a] border border-[#4a5c6a] text-[#ccd0cf] font-semibold text-xs shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#ccd0cf]" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#9ba8ab]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#ccd0cf] hover:underline font-bold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
