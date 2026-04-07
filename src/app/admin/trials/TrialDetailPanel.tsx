"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle, PhoneOff, PhoneIncoming, Star,
  CalendarClock, UserPlus, Trash2, Mail, Phone,
  User, MessageSquare
} from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  NEW:          { bg: "bg-blue-100",   text: "text-blue-700",   label: "New Lead" },
  CONTACTED:    { bg: "bg-emerald-100",text: "text-emerald-700",label: "Contacted" },
  RING_BELL:    { bg: "bg-amber-100",  text: "text-amber-700",  label: "Ring Bell" },
  INTERESTED:   { bg: "bg-violet-100", text: "text-violet-700", label: "Interested" },
  FOLLOW_UP_1:  { bg: "bg-indigo-100", text: "text-indigo-700", label: "Follow Up 1" },
  FOLLOW_UP_2:  { bg: "bg-purple-100", text: "text-purple-700", label: "Follow Up 2" },
  NOT_ANSWERED: { bg: "bg-rose-100",   text: "text-rose-700",   label: "No Answer" },
  CONVERTED:    { bg: "bg-teal-100",   text: "text-teal-700",   label: "Converted" },
};

const statusActions = [
  { label: "Contacted",     status: "CONTACTED",    icon: CheckCircle,  color: "text-emerald-600 hover:bg-emerald-50 border-emerald-100" },
  { label: "Ring Bell",     status: "RING_BELL",     icon: PhoneIncoming,color: "text-amber-600 hover:bg-amber-50 border-amber-100" },
  { label: "Interested",    status: "INTERESTED",    icon: Star,          color: "text-violet-600 hover:bg-violet-50 border-violet-100" },
  { label: "No Answer",     status: "NOT_ANSWERED",  icon: PhoneOff,     color: "text-rose-600 hover:bg-rose-50 border-rose-100" },
  { label: "Follow Up 1",   status: "FOLLOW_UP_1",   icon: CalendarClock,color: "text-indigo-600 hover:bg-indigo-50 border-indigo-100" },
  { label: "Follow Up 2",   status: "FOLLOW_UP_2",   icon: CalendarClock,color: "text-purple-600 hover:bg-purple-50 border-purple-100" },
  { label: "Lead Converted",status: "CONVERTED",     icon: UserPlus,     color: "text-teal-700 bg-teal-50/50 border-teal-200 col-span-2 shadow-lg shadow-teal-100 hover:bg-teal-100" },
];

interface Props {
  trial: any;
  search: string;
  filterStatus: string;
}

export default function TrialDetailPanel({ trial, search, filterStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (status: string) => {
    setLoading(status);
    try {
      const ref = doc(db, "trials", trial.id);
      await updateDoc(ref, { status, updatedAt: serverTimestamp() });
      router.refresh();
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const deleteTrial = async () => {
    if (!confirm("Delete this lead permanently?")) return;
    setLoading("delete");
    try {
      const ref = doc(db, "trials", trial.id);
      await deleteDoc(ref);
      router.push(`/admin/trials?q=${search}&status=${filterStatus}`);
      router.refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const statusInfo = statusColors[trial.status] || statusColors.NEW;

  return (
    <div className="w-[28rem] bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-0 flex-shrink-0 sticky top-8 h-fit overflow-hidden">
      {/* Header */}
      <div className={cn("p-10 pb-12 text-center relative overflow-hidden", statusInfo.bg)}>
        <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-black/5 rounded-full blur-3xl" />

        {/* Delete Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={deleteTrial}
            disabled={loading === "delete"}
            className="p-3 text-red-500 hover:text-white transition-all bg-white hover:bg-red-500 rounded-2xl shadow-lg border border-red-100 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="w-28 h-28 rounded-3xl bg-white flex items-center justify-center text-slate-900 text-4xl font-black mx-auto mb-6 shadow-2xl shadow-black/10 relative z-10">
          {(trial.childName || "U").charAt(0).toUpperCase()}
        </div>
        <h3 className="text-2xl font-black text-slate-900 leading-none relative z-10">{trial.childName}</h3>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm text-[10px] font-black text-slate-600 uppercase tracking-widest relative z-10">
          Grade {trial.grade} Student
        </div>
      </div>

      <div className="p-10 pt-8">
        {/* Contact Info */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
              <User size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Parent Name</p>
              <p className="text-sm font-bold text-slate-800">{trial.parentName}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                <Mail size={20} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-slate-800">{trial.email}</p>
              </div>
            </div>
            <a href={`mailto:${trial.email}`} className="p-2 text-slate-300 hover:text-violet-500 transition-colors">
              <MessageSquare size={18} />
            </a>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
              <Phone size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Phone</p>
              <p className="text-sm font-bold text-slate-800 font-mono">{trial.phone}</p>
            </div>
          </div>
        </div>

        {/* Status Update Buttons */}
        <div className="pt-8 border-t border-slate-100">
          <h4 className="text-[11px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em] text-center">
            Update Relationship Status
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {statusActions.map((action) => (
              <button
                key={action.status}
                onClick={() => updateStatus(action.status)}
                disabled={loading !== null}
                className={cn(
                  "flex items-center justify-center gap-3 h-14 px-4 text-xs font-black uppercase tracking-widest border-2 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed",
                  action.color,
                  action.status === "CONVERTED" ? "col-span-2" : ""
                )}
              >
                {loading === action.status ? (
                  <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <action.icon size={18} />
                )}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-4">
          <a href={`/admin/trials?q=${search}&status=${filterStatus}`}>
            <Button variant="ghost" className="w-full text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-600 h-12 rounded-2xl" size="sm">
              Dismiss View
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
