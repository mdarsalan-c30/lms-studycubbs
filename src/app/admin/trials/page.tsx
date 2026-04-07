"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import {
  Search, ChevronRight, Bell, CheckCircle, PhoneOff, PhoneIncoming,
  Star, CalendarClock, UserPlus, Trash2, Mail, Phone, User, MessageSquare
} from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  NEW:          { bg: "bg-blue-100",    text: "text-blue-700",    icon: Bell,          label: "New Lead" },
  CONTACTED:    { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle,   label: "Contacted" },
  RING_BELL:    { bg: "bg-amber-100",   text: "text-amber-700",   icon: PhoneIncoming, label: "Ring Bell" },
  INTERESTED:   { bg: "bg-violet-100",  text: "text-violet-700",  icon: Star,          label: "Interested" },
  FOLLOW_UP_1:  { bg: "bg-indigo-100",  text: "text-indigo-700",  icon: CalendarClock, label: "Follow Up 1" },
  FOLLOW_UP_2:  { bg: "bg-purple-100",  text: "text-purple-700",  icon: CalendarClock, label: "Follow Up 2" },
  NOT_ANSWERED: { bg: "bg-rose-100",    text: "text-rose-700",    icon: PhoneOff,      label: "No Answer" },
  CONVERTED:    { bg: "bg-teal-100",    text: "text-teal-700",    icon: UserPlus,      label: "Converted" },
};

const statusActions = [
  { label: "Contacted",     status: "CONTACTED",   icon: CheckCircle,  color: "text-emerald-600 hover:bg-emerald-50 border-emerald-200" },
  { label: "Ring Bell",     status: "RING_BELL",    icon: PhoneIncoming,color: "text-amber-600 hover:bg-amber-50 border-amber-200" },
  { label: "Interested",    status: "INTERESTED",   icon: Star,          color: "text-violet-600 hover:bg-violet-50 border-violet-200" },
  { label: "No Answer",     status: "NOT_ANSWERED", icon: PhoneOff,     color: "text-rose-600 hover:bg-rose-50 border-rose-200" },
  { label: "Follow Up 1",   status: "FOLLOW_UP_1",  icon: CalendarClock,color: "text-indigo-600 hover:bg-indigo-50 border-indigo-200" },
  { label: "Follow Up 2",   status: "FOLLOW_UP_2",  icon: CalendarClock,color: "text-purple-600 hover:bg-purple-50 border-purple-200" },
  { label: "Lead Converted",status: "CONVERTED",    icon: UserPlus,     color: "text-teal-700 bg-teal-50 border-teal-200 col-span-2 hover:bg-teal-100" },
];

export default function TrialsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get("q")?.toLowerCase() || "";
  const filterStatus = searchParams.get("status") || "All";
  const selectedId = searchParams.get("selected") || null;

  const [allTrials, setAllTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  const fetchTrials = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(query(collection(db, "trials")));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        status: d.data().status || "NEW",
        createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      }));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllTrials(data);
    } catch (err: any) {
      setError(err.message || "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrials(); }, []);

  const trials = allTrials.filter(t => {
    const matchSearch = !search ||
      t.childName?.toLowerCase().includes(search) ||
      t.parentName?.toLowerCase().includes(search) ||
      t.email?.toLowerCase().includes(search) ||
      t.phone?.includes(search);
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const selected = selectedId ? trials.find(t => t.id === selectedId) : null;

  const applyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value;
    const status = (form.elements.namedItem("status") as HTMLSelectElement).value;
    router.push(`/admin/trials?q=${q}&status=${status}`);
  };

  const updateStatus = async (trialId: string, status: string) => {
    setActionLoading(status);
    try {
      await updateDoc(doc(db, "trials", trialId), { status, updatedAt: serverTimestamp() });
      setAllTrials(prev => prev.map(t => t.id === trialId ? { ...t, status } : t));
    } catch (err: any) {
      alert("Update failed: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteTrial = async (trialId: string) => {
    if (!confirm("Delete this lead permanently?")) return;
    setActionLoading("delete");
    try {
      await deleteDoc(doc(db, "trials", trialId));
      setAllTrials(prev => prev.filter(t => t.id !== trialId));
      router.push(`/admin/trials?q=${search}&status=${filterStatus}`);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg">
              <Star className="text-white" style={{ fill: "white" }} size={24} />
            </div>
            Lead Management CRM
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Track and convert potential students from trial sessions</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
          <div className="text-center pr-6 border-r border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl font-black text-slate-900">{loading ? "—" : allTrials.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">New Leads</p>
            <p className="text-2xl font-black text-blue-600">{loading ? "—" : allTrials.filter(t => t.status === "NEW").length}</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium text-sm flex items-center gap-3">
          <PhoneOff size={18} />
          {error}
          <button onClick={fetchTrials} className="ml-auto px-4 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600">
            Retry
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <form onSubmit={applyFilter} className="flex flex-wrap gap-4 mb-10">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={search}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-12 pr-4 bg-white border-2 border-slate-200 focus:border-violet-500 rounded-2xl h-14 text-sm outline-none shadow-sm transition-all"
          />
        </div>
        <select
          name="status"
          defaultValue={filterStatus}
          className="border-2 border-slate-200 rounded-2xl px-6 h-14 text-sm font-bold text-slate-700 bg-white shadow-sm outline-none min-w-[180px]"
        >
          <option value="All">All Statuses</option>
          {Object.entries(statusColors).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-10 rounded-2xl h-14 font-bold text-sm shadow-lg transition-all">
          Filter
        </button>
      </form>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Table */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Loading leads...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-[11px] font-black text-slate-400 px-8 py-5 uppercase tracking-widest">Student</th>
                    <th className="text-[11px] font-black text-slate-400 px-8 py-5 uppercase tracking-widest">Program</th>
                    <th className="text-[11px] font-black text-slate-400 px-8 py-5 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {trials.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <Search size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No leads found</p>
                      </td>
                    </tr>
                  ) : trials.map(trial => {
                    const si = statusColors[trial.status] || statusColors.NEW;
                    const SIcon = si.icon;
                    const isSelected = selected?.id === trial.id;
                    return (
                      <tr
                        key={trial.id}
                        className={cn("hover:bg-slate-50 transition-colors cursor-pointer", isSelected && "bg-violet-50")}
                        onClick={() => router.push(`/admin/trials?q=${search}&status=${filterStatus}&selected=${trial.id}`)}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base",
                              trial.status === "CONVERTED" ? "bg-gradient-to-br from-teal-400 to-emerald-500" :
                              trial.status === "NEW" ? "bg-gradient-to-br from-blue-400 to-indigo-500" :
                              "bg-gradient-to-br from-slate-400 to-slate-600"
                            )}>
                              {(trial.childName || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{trial.childName}</p>
                              <p className="text-xs text-slate-400">Parent: {trial.parentName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-800 text-sm">{trial.course}</p>
                          <span className="text-[11px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">Grade {trial.grade}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest", si.bg, si.text)}>
                            <SIcon size={13} />
                            {si.label}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors">
                            View <ChevronRight size={14} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-96 bg-white rounded-3xl border border-slate-200 shadow-xl flex-shrink-0 sticky top-8 overflow-hidden" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            {/* Header */}
            <div className={cn("p-8 text-center relative", (statusColors[selected.status] || statusColors.NEW).bg)}>
              <button
                onClick={() => deleteTrial(selected.id)}
                disabled={actionLoading === "delete"}
                className="absolute top-4 right-4 p-2.5 bg-white text-red-400 hover:text-white hover:bg-red-500 rounded-xl border border-red-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-slate-900 text-3xl font-black mx-auto mb-4 shadow-xl">
                {(selected.childName || "U").charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-black text-slate-900">{selected.childName}</h3>
              <span className="text-[11px] bg-white/60 text-slate-600 font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 inline-block">
                Grade {selected.grade}
              </span>
            </div>

            <div className="p-6">
              {/* Contact Info */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: User,    label: "Parent",  value: selected.parentName },
                  { icon: Mail,    label: "Email",   value: selected.email, href: `mailto:${selected.email}` },
                  { icon: Phone,   label: "Phone",   value: selected.phone },
                  { icon: MessageSquare, label: "Course", value: selected.course },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-100 flex-shrink-0">
                      <Icon size={16} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-bold text-violet-600 truncate block hover:underline">{value}</a>
                      ) : (
                        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Buttons */}
              <div className="border-t border-slate-100 pt-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Update Status</p>
                <div className="grid grid-cols-2 gap-3">
                  {statusActions.map(action => (
                    <button
                      key={action.status}
                      onClick={() => updateStatus(selected.id, action.status)}
                      disabled={actionLoading !== null}
                      className={cn(
                        "flex items-center justify-center gap-2 h-12 px-3 text-[11px] font-black uppercase tracking-widest border-2 rounded-2xl transition-all disabled:opacity-50",
                        action.color,
                        action.status === "CONVERTED" ? "col-span-2" : ""
                      )}
                    >
                      {actionLoading === action.status
                        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : <action.icon size={15} />
                      }
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => router.push(`/admin/trials?q=${search}&status=${filterStatus}`)}
                className="w-full mt-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors rounded-2xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
