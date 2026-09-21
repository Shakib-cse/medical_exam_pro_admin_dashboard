"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  Trash2,
  Search,
  RotateCw,
  Mail,
  ArrowUpRight,
  User,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

export interface SupportTicket {
  id: string;
  subject: string;
  email: string;
  description: string;
  userName: string;
  userId: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/overview/support");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
      showToast("Error loading support tickets");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleStatusChange = async (id: string, newStatus: "open" | "in_progress" | "resolved") => {
    const previous = [...tickets];
    const updated = tickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    setTickets(updated);
    showToast(`Ticket status updated to ${newStatus.replace("_", " ")}`);

    try {
      await api.patch(`/overview/support/${encodeURIComponent(id)}/status`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update ticket status on server:", err);
      setTickets(previous);
      showToast("Failed to update status on server");
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to delete this support inquiry?")) {
      return;
    }
    const previous = [...tickets];
    const updated = tickets.filter((t) => t.id !== id);
    setTickets(updated);
    showToast("Support ticket deleted");

    try {
      await api.delete(`/overview/support/${encodeURIComponent(id)}`);
    } catch (err) {
      console.error("Failed to delete support ticket on server:", err);
      setTickets(previous);
      showToast("Failed to delete ticket on server");
    }
  };

  const filteredTickets = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      if (!q) return matchesStatus;

      const subject = (t.subject || "").toLowerCase();
      const email = (t.email || "").toLowerCase();
      const name = (t.userName || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();

      return (
        matchesStatus &&
        (subject.includes(q) || email.includes(q) || name.includes(q) || desc.includes(q))
      );
    });
  }, [tickets, statusFilter, search]);

  const openCount = useMemo(() => tickets.filter((t) => t.status === "open").length, [tickets]);
  const inProgressCount = useMemo(() => tickets.filter((t) => t.status === "in_progress").length, [tickets]);
  const resolvedCount = useMemo(() => tickets.filter((t) => t.status === "resolved").length, [tickets]);

  return (
    <div className="space-y-6 sm:space-y-7 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Help &amp; Support Inquiries
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-bold">
              Candidate Assistance
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Manage inquiries, technical assistance requests, and messages submitted from the candidate Help &amp; Support page.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTickets}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Inquiries</span>
        </button>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{tickets.length}</p>
          <span className="text-[11px] text-slate-400">All time tickets</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Open / Needs Reply
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{openCount}</p>
          <span className="text-[11px] text-slate-400">Requires response</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-600">{inProgressCount}</p>
          <span className="text-[11px] text-slate-400">Under investigation</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Resolved
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
          <span className="text-[11px] text-slate-400">Completed inquiries</span>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-2xs">
        <div className="relative flex-1 flex items-center px-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate subject, email, name, description..."
            className="w-full bg-transparent border-none text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none py-1 pl-2.5 pr-2"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["all", "open", "in_progress", "resolved"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#1D82EB] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Support Tickets List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center space-y-3 border border-slate-200/90 shadow-2xs">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading inquiries...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200/90 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Support Inquiries Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Messages submitted by candidates via the Help &amp; Support form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const statusConfig = {
              open: {
                label: "Open / Needs Reply",
                badge: "bg-amber-50 text-amber-700 border-amber-200",
              },
              in_progress: {
                label: "In Progress",
                badge: "bg-sky-50 text-sky-700 border-sky-200",
              },
              resolved: {
                label: "Resolved",
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
              },
            };

            const currentCfg = statusConfig[ticket.status] || statusConfig.open;

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Reference, Status, Timestamp, Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#082138] text-white text-xs font-bold">
                      Ticket #{ticket.id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${currentCfg.badge}`}>
                      {currentCfg.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      Received: {ticket.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${ticket.email}?subject=Re: ${encodeURIComponent(ticket.subject)}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      title="Direct email reply"
                    >
                      <Mail className="w-3.5 h-3.5 text-sky-600" />
                      <span>Reply via Email</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteTicket(ticket.id)}
                      title="Delete Ticket"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 shadow-2xs">
                    {ticket.userName
                      ? ticket.userName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "C"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {ticket.userName || "Candidate"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {ticket.email}
                    </p>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Subject
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {ticket.subject}
                  </h3>
                </div>

                {/* Message Description Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    Candidate Message:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Status Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                  <span className="text-slate-400 font-medium">Update Inquiries Status:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(ticket.id, "open")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        ticket.status === "open"
                          ? "bg-amber-600 text-white shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(ticket.id, "in_progress")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        ticket.status === "in_progress"
                          ? "bg-sky-600 text-white shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(ticket.id, "resolved")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        ticket.status === "resolved"
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
