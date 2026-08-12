"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, ShieldCheck, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      if (res.data?.data?.token) {
        const user = res.data.data.user;
        const roleName = user?.role?.name?.toLowerCase();

        if (roleName !== "admin" && roleName !== "superadmin") {
          setErrorMsg("Access Denied: Only administrators can access this portal.");
          return;
        }

        localStorage.setItem("auth_token", res.data.data.token);
        if (user) {
          localStorage.setItem("admin_user", JSON.stringify(user));
        }
        router.push("/dashboard");
      } else {
        setErrorMsg("Invalid server response. Token missing.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials or unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07192b] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0b2238] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image width={160} height={24} src="/images/commonLayout/headerlogo.png" alt="MedicalExamPro" priority />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 rounded-full text-[10px] font-black tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Admin Control Portal</span>
          </div>
          <p className="text-slate-400 text-xs">
            Sign in with authorized administrator credentials to manage platform content.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#081827] text-white placeholder:text-slate-500 text-xs sm:text-sm rounded-xl py-2.5 pl-9 pr-3.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#081827] text-white placeholder:text-slate-500 text-xs sm:text-sm rounded-xl py-2.5 pl-9 pr-3.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-800">
          MedicalExamPro Admin System &copy; 2026
        </div>
      </div>
    </div>
  );
}
