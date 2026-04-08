import { 
  Search, 
  ChevronRight, 
  Mail, 
  Phone, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle, 
  PhoneOff, 
  Bell, 
  CalendarClock, 
  UserPlus, 
  MoreVertical,
  Trash2,
  PhoneIncoming,
  GraduationCap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import Link from "next/link";
import { updateTrialStatus, deleteTrial } from "@/lib/actions";
import { cn } from "@/lib/utils";

const statusColors: Record<string, { bg: string, text: string, icon: any }> = {
  NEW: { bg: "bg-blue-100", text: "text-blue-700", icon: Bell },
  CONTACTED: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle },
  NOT_ANSWERED: { bg: "bg-red-100", text: "text-red-700", icon: PhoneOff },
  RING_BELL: { bg: "bg-amber-100", text: "text-amber-700", icon: PhoneIncoming },
  FOLLOW_UP_1: { bg: "bg-indigo-100", text: "text-indigo-700", icon: CalendarClock },
  FOLLOW_UP_2: { bg: "bg-purple-100", text: "text-purple-700", icon: CalendarClock },
  CONVERTED: { bg: "bg-teal-100", text: "text-teal-700", icon: UserPlus },
};

export default async function TrialsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; status?: string; selected?: string }> 
}) {
  const queryParams = await searchParams;
  const search = queryParams.q || "";
  const filterStatus = queryParams.status || "All";
  const selectedId = queryParams.selected || null;

  // 1. Fetch trials from DB
  let sql = `
    SELECT * FROM Trial 
    WHERE (childName LIKE ? OR parentName LIKE ? OR email LIKE ? OR phone LIKE ?)
  `;
  const params: any[] = Array(4).fill(`%${search}%`);

  if (filterStatus !== "All") {
    sql += " AND status = ?";
    params.push(filterStatus);
  }

  sql += " ORDER BY createdAt DESC";

  const trials = await db.query<any>(sql, params);
  const selected = selectedId ? trials.find(t => t.id === selectedId) : null;

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trial Session Bookings</h1>
          <p className="text-slate-500 mt-1">Manage potential students and follow-up requests</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="text-center px-4 border-r border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-lg font-bold text-slate-900">{trials.length}</p>
            </div>
            <div className="text-center px-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Leads</p>
                <p className="text-lg font-bold text-blue-600">{trials.filter(t => t.status === 'NEW').length}</p>
            </div>
        </div>
      </div>

      <form className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            name="q" 
            placeholder="Search by name, email, or phone..." 
            className="pl-12 bg-white border-slate-200 focus:ring-violet-500/20 rounded-xl h-12 shadow-sm" 
            defaultValue={search} 
          />
        </div>
        <select 
          name="status"
          className="border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 bg-white shadow-sm focus:ring-2 focus:ring-violet-500/20 outline-none h-12 min-w-[180px]"
          defaultValue={filterStatus}
        >
          <option value="All">All Statuses</option>
          {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-xl h-12 transition-all shadow-md shadow-slate-900/10">Filter Results</Button>
      </form>

      <div className="flex gap-8">
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-xs font-bold text-slate-500 px-6 py-4 uppercase tracking-wider">Child / Parent</th>
                  <th className="text-xs font-bold text-slate-500 px-6 py-4 uppercase tracking-wider">Course & Grade</th>
                  <th className="text-xs font-bold text-slate-500 px-6 py-4 uppercase tracking-wider">Schedule</th>
                  <th className="text-xs font-bold text-slate-500 px-6 py-4 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trials.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                            No trial bookings found.
                        </td>
                    </tr>
                ) : trials.map(trial => {
                  const StatusIcon = statusColors[trial.status]?.icon || Bell;
                  return (
                    <tr
                      key={trial.id}
                      className={cn(
                        "group hover:bg-slate-50/80 transition-all duration-200 cursor-pointer",
                        selected?.id === trial.id && "bg-violet-50/50"
                      )}
                    >
                      <td className="px-6 py-5">
                        <Link 
                          href={`/admin/trials?q=${search}&status=${filterStatus}&selected=${trial.id}`}
                          className="flex items-center gap-4"
                        >
                          <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm",
                              trial.status === 'CONVERTED' ? "bg-gradient-to-br from-teal-500 to-emerald-500" : "bg-gradient-to-br from-violet-500 to-indigo-500"
                          )}>
                            {trial.childName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{trial.childName}</p>
                            <p className="text-[11px] text-slate-400 font-medium">Parent: {trial.parentName}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">{trial.course}</span>
                            <span className="text-xs text-slate-400">Grade: {trial.grade}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                            <div className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-300" /> {trial.preferredDate}</div>
                            <div className="flex items-center gap-1.5"><Clock size={12} className="text-slate-300" /> {trial.preferredTime}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ring-1 ring-inset",
                          statusColors[trial.status]?.bg || "bg-slate-100",
                          statusColors[trial.status]?.text || "text-slate-700",
                          trial.status === 'NEW' ? "ring-blue-200" : 
                          trial.status === 'CONTACTED' ? "ring-emerald-200" : 
                          trial.status === 'CONVERTED' ? "ring-teal-200" : "ring-slate-200"
                        )}>
                          <StatusIcon size={14} />
                          {trial.status.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link 
                          href={`/admin/trials?q=${search}&status=${filterStatus}&selected=${trial.id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
                        >
                          Actions <ChevronRight size={14} />
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
          <div className="w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-0 flex-shrink-0 sticky top-8 h-fit overflow-hidden">
            <div className={cn(
                "p-8 pb-10 text-center relative",
                statusColors[selected.status]?.bg || "bg-slate-50"
            )}>
              <div className="absolute top-4 right-4 flex gap-2">
                 <form action={async () => {
                    "use server";
                    await deleteTrial(selected.id);
                  }}>
                    <button type="submit" className="p-2 text-red-400 hover:text-red-600 transition-colors bg-white/50 hover:bg-white rounded-lg shadow-sm" title="Delete lead">
                      <Trash2 size={16} />
                    </button>
                 </form>
              </div>

              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-slate-800 text-3xl font-black mx-auto mb-4 shadow-xl shadow-slate-200/50">
                {selected.childName.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{selected.childName}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">{selected.grade} Student</p>
            </div>
            
            <div className="p-8 pt-6">
              <div className="space-y-5 mb-8">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><User size={16} className="text-slate-400" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Parent</p>
                    <p className="text-sm font-semibold text-slate-700">{selected.parentName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><Mail size={16} className="text-slate-400" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{selected.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><Phone size={16} className="text-slate-400" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-semibold text-slate-700 font-mono tracking-tighter">{selected.phone}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-500 mb-4 uppercase tracking-widest">Pipeline Actions</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Contacted", status: "CONTACTED", icon: CheckCircle, color: "text-emerald-600 hover:bg-emerald-50 border-emerald-100" },
                    { label: "Ring Bell", status: "RING_BELL", icon: PhoneIncoming, color: "text-amber-600 hover:bg-amber-50 border-amber-100" },
                    { label: "No Answer", status: "NOT_ANSWERED", icon: PhoneOff, color: "text-red-600 hover:bg-red-50 border-red-100" },
                    { label: "Follow Up 1", status: "FOLLOW_UP_1", icon: CalendarClock, color: "text-indigo-600 hover:bg-indigo-50 border-indigo-100" },
                    { label: "Follow Up 2", status: "FOLLOW_UP_2", icon: CalendarClock, color: "text-purple-600 hover:bg-purple-50 border-purple-100" },
                    { label: "Convert", status: "CONVERTED", icon: UserPlus, color: "text-teal-600 hover:bg-teal-50 border-teal-100" },
                  ].map(action => (
                    <form 
                        key={action.status} 
                        action={async () => {
                            "use server";
                            await updateTrialStatus(selected.id, action.status);
                        }}
                    >
                        <Button 
                            variant="outline" 
                            className={cn(
                                "w-full justify-start gap-2 h-10 px-3 text-[11px] font-bold border rounded-xl transition-all",
                                action.color
                            )}
                        >
                            <action.icon size={14} />
                            {action.label}
                        </Button>
                    </form>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link href={`/admin/trials?q=${search}&status=${filterStatus}`}>
                  <Button variant="ghost" className="w-full text-slate-400 text-xs hover:text-slate-600 h-10 rounded-xl" size="sm">
                    Close Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
