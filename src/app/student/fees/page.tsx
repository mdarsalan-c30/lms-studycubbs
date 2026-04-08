import { DollarSign, CheckCircle2, Download, AlertCircle, Receipt as ReceiptIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { StudentInvoiceModal } from "@/components/StudentInvoiceModal";

export default async function StudentFeesPage() {
  const session = await auth();
  if (!session?.user) return null;

  // 1. Get student profile with User info
  const student = await db.queryOne<any>(`
    SELECT s.*, u.name, u.email, u.phone 
    FROM Student s
    JOIN User u ON s.userId = u.id
    WHERE s.userId = ?
  `, [session.user.id]);

  let invoices: any[] = [];
  let totalPaid = 0;
  let totalOutstanding = 0;

  if (student) {
    // 2. Fetch payments from DB
    invoices = await db.query<any>(`
      SELECT f.id, f.amount, f.status, f.paidAt, f.dueDate, f.period, b.name as batch
      FROM FeePayment f
      JOIN Batch b ON f.batchId = b.id
      WHERE f.studentId = ?
      ORDER BY f.dueDate DESC
    `, [student.id]);

    totalPaid = invoices
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + Number(i.amount), 0);
    
    totalOutstanding = invoices
      .filter(i => i.status !== 'PAID')
      .reduce((sum, i) => sum + Number(i.amount), 0);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your course fees, download receipts, and track billing cycles.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${totalOutstanding > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {totalOutstanding > 0 ? 'Pending Dues' : 'Account Paid'}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Total Investment</p>
            <p suppressHydrationWarning className="text-4xl font-black text-slate-900">₹{totalPaid.toLocaleString('en-IN')}</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 w-fit mx-auto px-3 py-1 rounded-full">
               <CheckCircle2 size={12} /> Lifetime Paid
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-all duration-700">
             <DollarSign size={140} />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Current Outstanding</p>
            <p suppressHydrationWarning className={`text-4xl font-black ${totalOutstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </p>
            <div className={`mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest w-fit mx-auto px-3 py-1 rounded-full ${totalOutstanding > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
               <AlertCircle size={12} /> {totalOutstanding > 0 ? 'Action Required' : 'All Clear'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 relative overflow-hidden group">
           <div className="relative z-10 text-center text-white">
              <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-3">Active Invoices</p>
              <p className="text-4xl font-black">{invoices.length}</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-4">Subscription History</p>
           </div>
           <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:rotate-12 transition-all duration-700">
              <Receipt size={160} className="text-white" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-200">
                 <Receipt size={20} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-slate-900 tracking-tight">Billing & Receipts</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Verification & History</p>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory / Period</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Collection Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Payment Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Log</th>
                <th className="px-8 py-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-extrabold text-slate-900">{inv.batch}</p>
                    <span className="inline-block mt-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border border-slate-200">{inv.period}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p suppressHydrationWarning className="text-lg font-black text-slate-900 tracking-tight">₹{parseFloat(inv.amount).toLocaleString('en-IN')}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center">
                       <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border shadow-sm transition-all duration-300 ${
                         inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                       }`}>
                         {inv.status}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {inv.status === 'PAID' ? (
                       <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-bold text-slate-900">Paid on {new Date(inv.paidAt).toLocaleDateString()}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auth ID: {inv.id.substring(0,8).toUpperCase()}</p>
                       </div>
                    ) : (
                       <div className="flex items-center gap-2 text-amber-500 opacity-60">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Payment Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                       </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {inv.status === 'PAID' ? (
                      <StudentInvoiceModal student={student} invoice={inv} />
                    ) : (
                      <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-10 w-full shadow-lg shadow-slate-200 transition-all group-hover:scale-[1.02]">
                        Pay Fee Now
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center gap-4">
                         <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                             <ReceiptIcon size={48} />
                         </div>
                         <div className="space-y-1">
                            <p className="text-slate-900 font-bold text-lg">No Documents Found</p>
                            <p className="text-xs text-slate-400 font-medium">Official receipts and invoices for your enrollments will appear here once processed by admin.</p>
                         </div>
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

function Receipt({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/>
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
      <path d="M12 17.5V18.5"/>
      <path d="M12 5.5v1"/>
    </svg>
  );
}
