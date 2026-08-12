"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { adminSettingsApi } from "@/services/adminSettingsApi";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("admin");
  const [targetExam, setTargetExam] = useState("");
  const [bio, setBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Feedback Notification
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await adminSettingsApi.getProfile();
        if (res?.data) {
          const user = res.data;
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setEmail(user.email || "");
          setRoleName(user.role?.name || "admin");
          setTargetExam(user.targetExam || "");
          setBio(user.bio || "");
        }
      } catch (err: any) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      showFeedback("error", "First name is required");
      return;
    }

    try {
      setIsSavingProfile(true);
      const res = await adminSettingsApi.updateProfile({
        firstName,
        lastName,
        targetExam,
        bio,
      });

      showFeedback("success", res.message || "Personal information updated successfully!");
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showFeedback("error", "Please complete all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showFeedback("error", "New password and confirmation do not match");
      return;
    }

    if (newPassword.length < 6) {
      showFeedback("error", "Password must be at least 6 characters long");
      return;
    }

    try {
      setIsSavingPassword(true);
      const res = await adminSettingsApi.changePassword({
        currentPassword,
        newPassword,
      });

      showFeedback("success", res.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${feedbackMsg.type === "success"
              ? "bg-emerald-950 text-emerald-300 border-emerald-700"
              : "bg-rose-950 text-rose-300 border-rose-700"
            }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#072438] to-[#0f3856] text-white p-6 sm:p-7 rounded-2xl shadow-md border border-slate-700/60 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-950/80 rounded-lg border border-cyan-800 text-cyan-400">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Admin Platform Settings
            </h2>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Manage your administrator profile details, credentials, and password security.
          </p>
        </div>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-cyan-400 shrink-0" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Own Information</h3>
                <p className="text-xs text-slate-500">Update your administrator name & specialty details</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address (Read-only)</label>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Role Badge</label>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-1.5 font-bold text-xs uppercase text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    <span>{roleName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Specialty / Exam</label>
                  <input
                    type="text"
                    placeholder="e.g. MSRA Administrator"
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Bio / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Administrator bio or specialty notes..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 px-4 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSavingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Information</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SECTION 2: CHANGE PASSWORD */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Change Password</h3>
                <p className="text-xs text-slate-500">Update your account security password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Current Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">New Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Confirm New Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="w-full py-2.5 px-4 bg-[#072438] hover:bg-[#0d3654] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSavingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-cyan-400" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
