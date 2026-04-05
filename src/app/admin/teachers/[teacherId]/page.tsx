import { query, queryOne } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  ChevronLeft, 
  Briefcase, 
  Clock, 
  Calendar,
  BookOpen,
  Users,
  ClipboardList,
  ShieldCheck,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Receipt
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTeacherProfile, disburseMonthSalary } from "@/lib/actions";
import { revalidatePath } from "next/cache";

export default async function AdminTeacherHubPage({ 
  params 
}: { 
  params: Promise<{ teacherId: string }> 
}) {
  const { teacherId } = await params;
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // 1. Fetch Teacher Details
  const teacher = await queryOne<any>(`
    SELECT t.*, u.name, u.email, u.phone
    FROM Teacher t
    JOIN User u ON t.userId = u.id
    WHERE t.id = ?
  `, [teacherId]);

  if (!teacher) return notFound();

  // 2. Fetch Assigned Batches
  const assignedBatches = await query<any>(`
    SELECT b.id, b.name, b.status, b.schedule,
    (SELECT COUNT(*) FROM Enrollment WHERE batchId = b.id) as studentCount
    FROM Batch b
    WHERE b.teacherId = ?
    ORDER BY b.createdAt DESC
  `, [teacherId]);

  // 3. Fetch Salary History
  const salaryHistory = await query<any>(`
    SELECT * FROM SalaryPayment 
    WHERE teacherId = ? 
    ORDER BY createdAt DESC
  `, [teacherId]);

  // Check if current month is already disbursed
  const currentMonthPaid = salaryHistory.find((p: any) => p.period === currentMonth);

  async function handleUpdate(formData: FormData) {
    "use server";
    const data = {
      name: (formData.get("name") as string) || "",
      phone: (formData.get("phone") as string) || "",
      specialization: (formData.get("specialization") as string) || "",
      availability: (formData.get("availability") as string) || "",
      monthlySalary: parseFloat(formData.get("monthlySalary") as string) || 0,
    };
    await updateTeacherProfile(teacherId, data);
  }

  async function handleDisburse(formData: FormData) {
    "use server";
    const manualAmount = parseFloat(formData.get("amount") as string);
    const amount = !isNaN(manualAmount) ? manualAmount : teacher.monthlySalary;
    await disburseMonthSalary(teacherId, amount, currentMonth);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Navigation & Header */}
      <div>
        <Link href="/admin/teachers" className="flex items-center gap-1 text-slate-400 hover:text-slate-900 transition-all mb-6 text-xs font-black uppercase tracking-widest w-fit">
          <ChevronLeft size={16} /> Back to Directory
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-slate-200">
              {teacher.name.substring(0,1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black text-slate-900 tracking-tight">{teacher.name}</h1>
                 <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">Professional Staff</span>
              </div>
              <p className="text-slate-400 font-bold flex items-center gap-2 mt-2">
                <Briefcase size={16} /> {teacher.specialization || "Instructor"} • Joined {new Date(teacher.joiningDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 min-w-[160px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Base Salary</p>
              <p suppressHydrationWarning className="text-3xl font-black text-slate-900 leading-none text-center">₹{parseFloat(teacher.monthlySalary || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Pay / Monthly Status */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Billing Period: {currentMonth}</p>
                <h2 className="text-2xl font-black">{currentMonthPaid ? 'Salary Disbursed' : 'Salary Pending Approval'}</h2>
             </div>
             {!currentMonthPaid ? (
               <form action={handleDisburse}>
                 <Button className="bg-white text-emerald-600 hover:bg-slate-50 font-black uppercase tracking-widest px-8 h-12 rounded-xl shadow-lg active:scale-95 transition-all">
                    Release ₹{parseFloat(teacher.monthlySalary).toLocaleString('en-IN')}
                 </Button>
               </form>
             ) : (
                <div className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-xl border border-white/30 backdrop-blur-sm">
                   <ShieldCheck size={20} />
                   <span className="font-black uppercase tracking-widest text-xs">Payment Cleared</span>
                </div>
             )}
          </div>

          {/* Assigned Batches */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                     <BookOpen size={20} />
                  </div>
                  <h2 className="font-black text-slate-900 text-xl tracking-tight">Active Batches</h2>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Group Title</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Enrollment</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {assignedBatches.map(batch => (
                    <tr key={batch.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5">
                         <p className="font-bold text-slate-900">{batch.name}</p>
                         <p className="text-xs text-slate-400 font-medium">{batch.schedule}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="bg-white border border-slate-100 px-3 py-1 rounded-lg text-xs font-black text-slate-900 shadow-sm">{batch.studentCount} St.</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${batch.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{batch.status}</span>
                      </td>
                    </tr>
                  ))}
                  {assignedBatches.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-10 text-center text-slate-400 italic text-sm">No batches assigned.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                     <TrendingUp size={20} />
                  </div>
                  <h2 className="font-black text-slate-900 text-xl tracking-tight">Salary History</h2>
               </div>
            </div>
            <div className="divide-y divide-slate-50">
              {salaryHistory.map((pay: any) => (
                <div key={pay.id} className="p-8 flex items-center justify-between hover:bg-slate-50/30 transition-colors group">
                  <div>
                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{pay.period}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <Clock size={12} className="text-slate-400" />
                       <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
                         {pay.status === 'PAID' ? `Disbursed ${new Date(pay.paidAt).toLocaleDateString()}` : 'Payment Pending'}
                       </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p suppressHydrationWarning className="text-2xl font-black text-slate-900">₹{parseFloat(pay.amount).toLocaleString('en-IN')}</p>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border mt-1 inline-block ${
                        pay.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {pay.status}
                      </span>
                    </div>
                    {pay.status === 'PAID' && (
                       <Button variant="outline" size="icon" className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                          <Receipt size={18} />
                       </Button>
                    )}
                  </div>
                </div>
              ))}
              {salaryHistory.length === 0 && (
                <div className="p-16 text-center text-slate-300 italic text-sm">No transaction records found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-slate-900 rounded-xl text-white">
                 <ShieldCheck size={20} />
              </div>
              <h2 className="font-black text-xl text-slate-900 tracking-tight">Staff Credentials</h2>
            </div>
            
            <form action={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Full Name</label>
                <Input name="name" defaultValue={teacher.name} className="rounded-xl border-slate-200 h-12 font-bold px-4" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-emerald-600">Agreed Monthly Pay (₹)</label>
                <Input name="monthlySalary" type="number" defaultValue={teacher.monthlySalary} className="rounded-xl border-slate-200 h-12 font-black text-emerald-600 text-lg px-4" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Reach</label>
                <Input name="phone" defaultValue={teacher.phone || ""} className="rounded-xl border-slate-200 h-12 font-bold px-4" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expertise Domain</label>
                <Input name="specialization" defaultValue={teacher.specialization || ""} className="rounded-xl border-slate-200 h-12 font-bold px-4" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operational Hours</label>
                <Input name="availability" defaultValue={teacher.availability || ""} className="rounded-xl border-slate-200 h-12 font-bold px-4" />
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest h-14 shadow-xl shadow-slate-200 active:scale-95 transition-all">Update Database</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
