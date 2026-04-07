import { Search, ChevronRight, Bell, CheckCircle, PhoneOff, PhoneIncoming, Star, CalendarClock, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import Link from "next/link";
import { cn } from "@/lib/utils";
import TrialDetailPanel from "./TrialDetailPanel";

const statusColors: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  NEW:          { bg: "bg-blue-100",   text: "text-blue-700",   icon: Bell,          label: "New Lead" },
  CONTACTED:    { bg: "bg-emerald-100",text: "text-emerald-700",icon: CheckCircle,   label: "Contacted" },
  RING_BELL:    { bg: "bg-amber-100",  text: "text-amber-700",  icon: PhoneIncoming, label: "Ring Bell" },
  INTERESTED:   { bg: "bg-violet-100", text: "text-violet-700", icon: Star,          label: "Interested" },
  FOLLOW_UP_1:  { bg: "bg-indigo-100", text: "text-indigo-700", icon: CalendarClock, label: "Follow Up 1" },
  FOLLOW_UP_2:  { bg: "bg-purple-100", text: "text-purple-700", icon: CalendarClock, label: "Follow Up 2" },
  NOT_ANSWERED: { bg: "bg-rose-100",   text: "text-rose-700",   icon: PhoneOff,      label: "No Answer" },
  CONVERTED:    { bg: "bg-teal-100",   text: "text-teal-700",   icon: UserPlus,      label: "Converted" },
};

export default async function TrialsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; selected?: string }>
}) {
  const queryParams = await searchParams;
  const search = queryParams.q?.toLowerCase() || "";
  const filterStatus = queryParams.status || "All";
  const selectedId = queryParams.selected || null;


  // Helper to safely handle different date formats from Firestore
  const safeDate = (date: any) => {
    if (!date) return new Date().toISOString();
    if (typeof date.toDate === 'function') return date.toDate().toISOString();
    if (date instanceof Date) return date.toISOString();
    if (typeof date === 'string') return date;
    return new Date().toISOString();
  };

  let trials: any[] = [];
  let errorMsg: string | null = null;

  try {
    const trialsRef = collection(db, "trials");
    const q = query(trialsRef); // Removing orderBy temporarily to rule out index issues
    const querySnapshot = await getDocs(q);
    
    trials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: safeDate(doc.data().createdAt),
      status: doc.data().status || "NEW"
    }));

    // Re-apply sorting in-memory for safety
    trials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err: any) {
    console.error("Firestore getDocs Error:", err);
    errorMsg = err.message || "Failed to connect to lead database.";
  }

  // 2. Filter in-memory (Firestore basic search is limited)
  if (search) {
    trials = trials.filter(t => 
      t.childName?.toLowerCase().includes(search) || 
      t.parentName?.toLowerCase().includes(search) || 
      t.email?.toLowerCase().includes(search) || 
      t.phone?.includes(search)
    );
  }

  if (filterStatus !== "All") {
    trials = trials.filter(t => t.status === filterStatus);
  }

  const selected = selectedId ? trials.find(t => t.id === selectedId) : null;

  return (
    <div className="p-8 bg-slate-50/30 min-h-screen font-sans">
      {errorMsg && (
        <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-4 text-red-600 font-bold animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
             <PhoneOff size={20} />
          </div>
          <div>
            <p className="text-sm">Database Connection Issue: {errorMsg}</p>
            <p className="text-[10px] uppercase tracking-widest opacity-70">Please check your Firebase console or refresh the page.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <Star className="text-white fill-white" size={24} />
            </div>
            Lead Management CRM
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Track and convert potential students from trial sessions</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="text-center pr-6 border-r border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Enquiries</p>
                    <p className="text-2xl font-black text-slate-900">{trials.length}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">New Leads</p>
                    <p className="text-2xl font-black text-blue-600">{trials.filter(t => t.status === 'NEW').length}</p>
                </div>
            </div>
        </div>
      </div>

      <form className="flex flex-wrap gap-4 mb-10">
        <div className="relative flex-1 min-w-[400px]">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            name="q" 
            placeholder="Search leads by name, email, or contact..." 
            className="pl-14 bg-white border-slate-200 focus:ring-violet-500/20 rounded-2xl h-14 text-base shadow-sm border-2 focus:border-violet-500 transition-all" 
            defaultValue={search} 
          />
        </div>
        <select 
          name="status"
          className="border-2 border-slate-200 rounded-2xl px-6 py-2 text-sm font-bold text-slate-700 bg-white shadow-sm focus:ring-4 focus:ring-violet-500/10 outline-none h-14 min-w-[200px] cursor-pointer"
          defaultValue={filterStatus}
        >
          <option value="All">All Statuses</option>
          {Object.entries(statusColors).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
        <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-10 rounded-2xl h-14 font-bold text-base transition-all shadow-xl shadow-violet-200 active:scale-95">
          Apply Filter
        </Button>
      </form>

      <div className="flex gap-10">
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-[11px] font-black text-slate-400 px-8 py-5 uppercase tracking-[0.2em]">Student Information</th>
                  <th className="text-[11px] font-black text-slate-400 px-8 py-5 uppercase tracking-[0.2em]">Program & Grade</th>
                  <th className="text-[11px] font-black text-slate-400 px-8 py-5 uppercase tracking-[0.2em]">Lead Status</th>
                  <th className="px-8 py-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {trials.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Search size={48} className="text-slate-200" />
                                <p className="text-slate-400 font-medium text-lg">No enquiries match your criteria</p>
                            </div>
                        </td>
                    </tr>
                ) : trials.map(trial => {
                  const statusInfo = statusColors[trial.status] || statusColors.NEW;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr
                      key={trial.id}
                      className={cn(
                        "group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer",
                        selected?.id === trial.id && "bg-violet-50/80 hover:bg-violet-50"
                      )}
                    >
                      <td className="px-8 py-6">
                        <Link 
                          href={`/admin/trials?q=${search}&status=${filterStatus}&selected=${trial.id}`}
                          className="flex items-center gap-5"
                        >
                          <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-inner",
                              trial.status === 'CONVERTED' ? "bg-gradient-to-br from-teal-400 to-emerald-500" : 
                              trial.status === 'NEW' ? "bg-gradient-to-br from-blue-400 to-indigo-500" :
                              "bg-gradient-to-br from-slate-400 to-slate-600"
                          )}>
                            {(trial.childName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-base font-bold text-slate-900 leading-tight mb-1">{trial.childName}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Parent:</span>
                                <span className="text-xs text-slate-600 font-medium">{trial.parentName}</span>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-slate-800">{trial.course}</span>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 w-fit">
                                Grade {trial.grade}
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ring-1 ring-inset",
                          statusInfo.bg,
                          statusInfo.text,
                          trial.status === 'NEW' ? "ring-blue-200 shadow-sm shadow-blue-100" : 
                          trial.status === 'CONVERTED' ? "ring-teal-200 shadow-sm shadow-teal-100" : 
                          "ring-slate-200"
                        )}>
                          <StatusIcon size={16} />
                          {statusInfo.label}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link 
                          href={`/admin/trials?q=${search}&status=${filterStatus}&selected=${trial.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-violet-600 bg-violet-50 hover:bg-violet-100 hover:scale-105 transition-all active:scale-95 shadow-sm"
                        >
                          View Profile <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <TrialDetailPanel trial={selected} search={search} filterStatus={filterStatus} />
        )}
      </div>
    </div>
  );
}
