import React from "react";
import { Receipt, Mail, Phone, Briefcase, Calendar, CheckCircle2, TrendingUp } from "lucide-react";

interface SalarySlipProps {
  teacher: {
    name: string;
    email: string;
    phone?: string;
    specialization: string;
    monthlySalary: number;
  };
  payment: {
    id: string;
    period: string;
    amount: number;
    paidAt: string;
    status: string;
  };
}

export const SalarySlipTemplate = ({ teacher, payment }: SalarySlipProps) => {
  const earnings = [
    { label: "Basic Salary", amount: payment.amount },
    { label: "Academic Bonus", amount: 0 },
    { label: "Performance Incentive", amount: 0 },
  ];

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const deductions = [
    { label: "Professional Tax", amount: 0 },
    { label: "Provident Fund", amount: 0 },
  ];
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  return (
    <div className="bg-white p-12 max-w-[800px] mx-auto border border-slate-100 shadow-2xl rounded-3xl print:shadow-none print:border-none print:p-0 my-8 print:my-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-950 p-3 rounded-2xl text-white">
              <Receipt size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">StudyCubs LMS</h1>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Academic Operations Center</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Salary Disbursement</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">Official Payment Voucher</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <CheckCircle2 size={14} /> {payment.status} - VERIFIED
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Employee Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Briefcase size={16} /></div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase">{teacher.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{teacher.specialization}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={16} /></div>
              <p className="text-xs font-bold text-slate-600">{teacher.email}</p>
            </div>
          </div>
        </div>
        <div className="space-y-6 text-right">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Payment Context</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Cycle</p>
              <p className="text-sm font-black text-slate-900 uppercase mt-1">{payment.period}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
              <p className="text-[10px] font-mono font-bold text-slate-900 mt-1 uppercase">{payment.id}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Date</p>
              <p className="text-xs font-black text-slate-900 mt-1 uppercase">{new Date(payment.paidAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Figures Table */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden mb-12">
        <div className="bg-white p-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Earnings Breakdown</h4>
          <div className="space-y-4">
            {earnings.map((e, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{e.label}</span>
                <span className="text-sm font-black text-slate-900">₹{e.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <span className="text-xs font-black text-slate-900 uppercase">Gross Total</span>
              <span className="text-lg font-black text-slate-900">₹{totalEarnings.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Deductions Reconciliation</h4>
          <div className="space-y-4">
            {deductions.map((d, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{d.label}</span>
                <span className="text-sm font-black text-slate-900">₹{d.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <span className="text-xs font-black text-slate-900 uppercase">Total Reductions</span>
              <span className="text-lg font-black text-slate-900">₹{totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div className="bg-slate-900 rounded-3xl p-10 flex items-center justify-between text-white mb-16">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-2">Net Disbursement Amount</p>
          <div className="flex items-baseline gap-4">
             <h2 className="text-5xl font-black tracking-tighter">₹{netPay.toLocaleString()}</h2>
             <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Indian Rupee Only</span>
          </div>
        </div>
        <div className="hidden md:block">
           < TrendingUp size={80} className="opacity-10" />
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-12 pt-10 border-t-2 border-slate-100">
        <div className="space-y-4">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Verification</h4>
           <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center p-3 opacity-30 grayscale hover:grayscale-0 transition-all">
              <Receipt size={32} />
           </div>
           <p className="text-[8px] text-slate-400 font-mono tracking-tighter uppercase leading-tight">
              SIGNED_DIGITALLY_ADMIN_SC_LMS_2026<br/>
              SECURE_PAYMENT_HASH_TXN_{payment.id.toUpperCase()}
           </p>
        </div>
        <div className="text-right flex flex-col justify-end">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Powered by StudyCubs Administration</p>
           <p className="text-[9px] font-bold text-slate-300 mt-1 tracking-widest">© 2026 StudyCubs. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          @page {
            size: auto;
            margin: 0;
          }
          :global(body) {
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-area {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 20mm !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Hide the modal background/overlay just for the print */
          :global(div[role="dialog"]), :global([data-state="open"]) {
            background: white !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
