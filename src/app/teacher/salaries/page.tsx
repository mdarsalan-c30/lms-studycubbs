import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DollarSign, Calendar, CheckCircle2, Download, Receipt, TrendingUp, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SalarySlipModal } from "@/components/SalarySlipModal";

export default async function TeacherSalariesPage() {
  const session = await auth();
  if (!session?.user) return redirect("/auth/login");

  // 1. Get Teacher Details with User profile info
  const teacher = await db.queryOne<any>(`
    SELECT t.*, u.name, u.email, u.phone 
    FROM Teacher t 
    JOIN User u ON t.userId = u.id 
    WHERE t.userId = ?
  `, [session.user.id]);
  
  if (!teacher) return redirect("/teacher/dashboard");

  // 2. Fetch Salary History
  const payments = await db.query<any>(`
    SELECT * FROM SalaryPayment 
    WHERE teacherId = ? 
    ORDER BY createdAt DESC
  `, [teacher.id]);

  const totalEarned = payments.filter((p: any) => p.status === 'PAID').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
  const pendingPayout = payments.filter((p: any) => p.status !== 'PAID').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* ... previous code remains the same ... */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Earnings & Payouts</h1>
          <p className="text-slate-500 mt-1 font-medium">Track your professional income and monthly salary receipts.</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">Account Verified</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Total Lifetime Earnings</p>
            <p suppressHydrationWarning className="text-4xl font-black text-slate-900 text-center">₹{totalEarned.toLocaleString('en-IN')}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
             <TrendingUp size={120} />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Monthly Base Salary</p>
            <p suppressHydrationWarning className="text-4xl font-black text-blue-600 text-center">₹{parseFloat(teacher.monthlySalary || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 text-blue-600">
             <Wallet size={120} />
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl shadow-slate-200 relative overflow-hidden group text-white">
          <div className="relative z-10">
            <p className="text-xs font-black opacity-60 uppercase tracking-widest mb-2 text-center">Pending Payout</p>
            <p suppressHydrationWarning className="text-4xl font-black text-center">₹{pendingPayout.toLocaleString('en-IN')}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <Calendar size={120} />
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
           <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Receipt size={20} />
           </div>
           <h2 className="text-xl font-bold text-slate-900">Salary History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Billing Period</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Disbursement Info</th>
                <th className="px-8 py-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-extrabold text-slate-900">{payment.period}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Salary Component</p>
                  </td>
                  <td className="px-8 py-6">
                    <p suppressHydrationWarning className="text-lg font-black text-slate-900">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${
                        payment.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {payment.paidAt ? (
                      <div>
                        <p className="text-xs font-bold text-slate-900">Paid on {new Date(payment.paidAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reference: {payment.id.toUpperCase()}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-50">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Admin Action</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {payment.status === 'PAID' && (
                      <SalarySlipModal teacher={teacher} payment={payment} />
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                         <DollarSign className="text-slate-200" size={32} />
                      </div>
                      <p className="text-slate-900 font-bold">No payouts yet</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Your salary history will appear here once the administrator processes your first payout.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
