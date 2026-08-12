"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  Trash2,
  Loader2,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  X,
  UserPlus,
} from "lucide-react";
import { adminUserApi, AdminUserData } from "@/services/adminUserApi";

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create User Form State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoleName, setNewRoleName] = useState("user");
  const [newTargetExam, setNewTargetExam] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUserApi.getAllUsers();
      if (res?.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load users:", err);
      showFeedback("error", err.message || "Failed to load users from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newFirstName) {
      showFeedback("error", "Please complete all required fields");
      return;
    }

    try {
      setIsSubmittingUser(true);
      const res = await adminUserApi.createUser({
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        password: newPassword,
        roleName: newRoleName,
        targetExam: newTargetExam,
      });

      showFeedback("success", res.message || `User created with ${newRoleName} role`);
      setCreateModalOpen(false);
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPassword("");
      setNewRoleName("user");
      setNewTargetExam("");
      await fetchUsers();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to create user");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: any) => {
    try {
      setUpdatingUserId(userId);
      await adminUserApi.updateUserStatus(userId, newStatus);
      showFeedback("success", `User status updated to ${newStatus}`);
      await fetchUsers();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setUpdatingUserId(userId);
      await adminUserApi.deleteUser(userId);
      showFeedback("success", "User account removed successfully");
      setDeleteConfirmId(null);
      await fetchUsers();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to delete user");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filtering
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = fullName.includes(q) || email.includes(q);
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending_verification").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${
            feedbackMsg.type === "success"
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
      <div className="bg-gradient-to-r from-[#072438] to-[#0f3856] text-white p-6 sm:p-7 rounded-2xl shadow-md border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-950/80 rounded-lg border border-cyan-800 text-cyan-400">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              User & Candidate Management
            </h2>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            View registered candidates, activate or suspend accounts, and manage user access permissions across the platform.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User / Admin</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</div>
          <div className="text-2xl font-black text-slate-900">{totalUsers}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Accounts</div>
          <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Verification</div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspended</div>
          <div className="text-2xl font-black text-rose-600">{suspendedCount}</div>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 placeholder:text-slate-400 text-xs rounded-xl py-2.5 pl-9 pr-3.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">User Directory ({filteredUsers.length})</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">USER</th>
                <th className="py-3.5 px-6">EMAIL</th>
                <th className="py-3.5 px-6">ROLE</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6">REGISTERED</th>
                <th className="py-3.5 px-6 text-right">MANAGE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No users matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isUpdating = updatingUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-6 font-bold text-slate-900 leading-snug">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center justify-center text-xs shrink-0">
                            {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <div>{user.firstName} {user.lastName}</div>
                            {user.targetExam && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                Target: {user.targetExam}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.5 font-black rounded text-[10px] uppercase border ${
                            user.role?.name === "admin"
                              ? "bg-purple-100 text-purple-800 border-purple-200"
                              : user.role?.name === "moderator"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {user.role?.name || "user"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit ${
                            user.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : user.status === "pending_verification"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {user.status === "active" && <CheckCircle2 className="w-3 h-3" />}
                          {user.status === "pending_verification" && <Clock className="w-3 h-3" />}
                          {user.status === "suspended" && <Ban className="w-3 h-3" />}
                          <span className="capitalize">{user.status.replace("_", " ")}</span>
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-6 text-slate-500 font-medium text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Status Action Buttons */}
                          {user.status !== "active" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(user.id, "active")}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              title="Activate Account"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </button>
                          )}

                          {user.status === "active" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(user.id, "suspended")}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              title="Suspend Account"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            disabled={isUpdating}
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#072438] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">Add New User or Admin</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Doe"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. candidate@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assign Role</label>
                  <select
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 font-medium bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="user">User (Candidate)</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Exam (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. MSRA, PLAB"
                    value={newTargetExam}
                    onChange={(e) => setNewTargetExam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-5 py-2 bg-[#FF6B00] hover:bg-[#ea6200] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Delete User Account?</h3>
              <p className="text-xs text-slate-500">
                This action will mark the user account as deleted. They will no longer be able to sign in or take practice exams.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
