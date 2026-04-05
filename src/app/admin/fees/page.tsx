import { DollarSign, Clock, AlertCircle, FileText, Send, UserCheck, TrendingUp, Filter, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { query, queryOne } from "@/lib/db";
import { disburseMonthSalary, submitFeePayment, generateMonthlyFees, generateMonthlySalaries } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { MonthFilter } from "@/components/MonthFilter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ month?: string }> 
}) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const { month } = await searchParams;
  const selectedMonth = month || currentMonth;

  // 1. Fetch Students Fee Status
  const students = await query<any>(`
    SELECT 
      s.id as studentId,
      u.name,
      b.id as batchId,
      b.name as batchName,
      b.fee as amount,
      fp.id as paymentId,
      fp.status,
      fp.invoiceNo
    FROM Enrollment e
    JOIN Student s ON e.studentId = s.id
    JOIN User u ON s.userId = u.id
    JOIN Batch b ON e.batchId = b.id
    LEFT JOIN FeePayment fp ON s.id = fp.studentId AND b.id = fp.batchId AND fp.period = ?
  `, [selectedMonth]);

  // 2. Fetch Teacher Salaries
  const teachers = await query<any>(`
    SELECT 
      t.id as teacherId,
      u.name,
      t.monthlySalary as amount,
      sp.id as paymentId,
      sp.status
    FROM Teacher t
    JOIN User u ON t.userId = u.id
    LEFT JOIN SalaryPayment sp ON t.id = sp.teacherId AND sp.period = ?
  `, [selectedMonth]);

  // 3. Stats
  const stats = await queryOne<any>(`
    SELECT 
      COALESCE(SUM(amount), 0) as totalRevenue,
      COUNT(CASE WHEN status = 'PAID' THEN 1 END) as totalPayments
    FROM FeePayment
    WHERE status = 'PAID' AND period = ?
  `, [selectedMonth]);

  const teacherStats = await queryOne<any>(`
    SELECT COALESCE(SUM(amount), 0) as totalPayouts
    FROM SalaryPayment
    WHERE status = 'PAID' AND period = ?
  `, [selectedMonth]);

  async function handleAction(record: any, type: string, formData: FormData) {
    "use server";
    console.log(`[FeesPage handleAction] Entry: ${type} - ${record.name} - Period: ${selectedMonth}`);
    const manualAmount = parseFloat(formData.get("amount") as string);
    const amount = !isNaN(manualAmount) ? manualAmount : record.amount;

    try {
      let result;
      if (type === "STUDENT") {
        result = await submitFeePayment(record.studentId, record.batchId, amount, selectedMonth);
      } else {
        result = await disburseMonthSalary(record.teacherId, amount, selectedMonth);
      }
      console.log(`[FeesPage handleAction] Result:`, result);
      revalidatePath("/admin/fees");
    } catch (error) {
      console.error("[FeesPage handleAction] FATAL ERROR:", error);
    }
  }

  async function handleBulkGenerate(type: string) {
    "use server";
    if (type === "FEES") await generateMonthlyFees(selectedMonth);
    else await generateMonthlySalaries(selectedMonth);
    revalidatePath("/admin/fees");
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header & Month Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Finance Center</h1>
          <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Operational Oversight & Cash Flow</p>
        </div>
        <div className="flex items-center gap-4">
          <MonthFilter currentMonth={selectedMonth} />
          <form action={handleBulkGenerate.bind(null, "FEES")}>
             <Button variant="outline" className="rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[10px] h-12 px-6 hover:bg-slate-50 transition-all">Generate Invoices</Button>
          </form>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200 flex items-center justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Collected Revenue</p>
            <h2 suppressHydrationWarning className="text-4xl font-black tracking-tight">₹{parseFloat(stats?.totalRevenue || 0).toLocaleString('en-IN')}</h2>
            <div className="mt-4 flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">Live Sync</span>
            </div>
          </div>
          <DollarSign className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Teacher Payouts</p>
            <h2 suppressHydrationWarning className="text-4xl font-black text-slate-900 tracking-tight">₹{parseFloat(teacherStats?.totalPayouts || 0).toLocaleString('en-IN')}</h2>
            <p className="mt-4 text-xs font-bold text-slate-400">Total Disbursements Made</p>
          </div>
          <TrendingUp className="w-24 h-24 absolute -right-4 -bottom-4 text-slate-50 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Receipts</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{stats?.totalPayments || 0}</h2>
            <p className="mt-4 text-xs font-bold text-slate-400">Verified Transactions</p>
          </div>
          <Receipt className="w-24 h-24 absolute -right-4 -bottom-4 text-slate-50 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Student Collections */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">Student Fees</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Payment Reconciliation</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {students.map((s: any) => (
              <div key={s.studentId + (s.batchId || '')} className="p-10 hover:bg-slate-50/50 transition-all group">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">{s.name}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.batchName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {!s.status || s.status === 'PENDING' ? (
                        <div className="flex flex-col items-end gap-3">
                          <form action={handleAction.bind(null, s, "STUDENT")} className="flex items-center gap-3">
                            <div className="relative group/input">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                              <input 
                                name="amount" 
                                type="number" 
                                defaultValue={s.amount}
                                className="w-28 h-12 pl-8 pr-4 bg-slate-100 border-none rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                              />
                            </div>
                            <Button 
                              type="submit"
                              className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 active:scale-95 transition-all"
                            >
                              Collect Now
                            </Button>
                          </form>
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-amber-100">
                             {s.status || 'UNBILLED'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-2xl font-black text-slate-900">₹{parseFloat(s.amount).toLocaleString('en-IN')}</p>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-emerald-100">
                            COLLECTED
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Payouts */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Send size={24} />
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">Staff Payroll</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monthly Distributions</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {teachers.map((t: any) => (
              <div key={t.teacherId} className="p-10 hover:bg-slate-50/50 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">{t.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Monthly Disbursement</p>
                  </div>
                  <div className="text-right">
                    {!t.status || t.status === 'PENDING' ? (
                      <form action={handleAction.bind(null, t, "TEACHER")} className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-sm">₹</span>
                            <input 
                              name="amount" 
                              type="number" 
                              defaultValue={t.amount}
                              className="w-28 h-12 pl-8 pr-4 bg-emerald-50 border-none rounded-xl font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            />
                          </div>
                          <Button 
                            type="submit"
                            className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                          >
                            Disburse
                          </Button>
                        </div>
                        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-slate-100">
                           {t.status || 'UNBILLED'}
                        </span>
                      </form>
                    ) : (
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-2xl font-black text-slate-900">₹{parseFloat(t.amount).toLocaleString('en-IN')}</p>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-emerald-100">
                          PAID
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
