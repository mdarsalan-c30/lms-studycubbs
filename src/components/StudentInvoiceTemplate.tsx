import React from "react";
import { Receipt, Mail, User, BookOpen, Calendar, CheckCircle2, ShieldCheck } from "lucide-react";

interface StudentInvoiceProps {
  student: {
    name: string;
    email: string;
    phone?: string;
  };
  invoice: {
    id: string;
    batch: string;
    period: string;
    amount: number;
    paidAt: string;
    status: string;
  };
}

export const StudentInvoiceTemplate = ({ student, invoice }: StudentInvoiceProps) => {
  const items = [
    { label: "Tuition Fees", description: `${invoice.batch} - ${invoice.period}`, amount: invoice.amount },
    { label: "Registration Charges", description: "Standard Enrollment", amount: 0 },
    { label: "LMS Access", description: "Digital Learning Platform", amount: 0 },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = 0;
  const total = subtotal + tax;

  return (
    <div className="bg-white p-12 max-w-[800px] mx-auto border border-slate-100 shadow-2xl rounded-3xl print:shadow-none print:border-none print:p-0 my-8 print:my-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <BookOpen size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">StudyCubs LMS</h1>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Education & Enrollment Portal</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">Fee Invoice</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">Academic Receipt</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <CheckCircle2 size={14} /> {invoice.status} - VERIFIED
          </div>
        </div>
      </div>

      {/* Student & Invoice Info */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Billed To</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><User size={16} /></div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase">{student.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">LMS Student ID: {student.name.substring(0,3).toUpperCase()}{invoice.id.substring(0,4)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={16} /></div>
              <p className="text-xs font-bold text-slate-600">{student.email}</p>
            </div>
          </div>
        </div>
        <div className="space-y-6 text-right">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Invoice Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document No.</p>
              <p className="text-xs font-black text-slate-900 uppercase mt-1">SC-INV-{invoice.id.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Cycle</p>
              <p className="text-sm font-black text-slate-900 uppercase mt-1">{invoice.period}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Transaction</p>
              <p className="text-xs font-black text-slate-900 mt-1 uppercase">{new Date(invoice.paidAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-12 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-900 uppercase">{item.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.description}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <p className="text-sm font-black text-slate-900">₹{item.amount.toLocaleString()}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-16">
        <div className="w-full max-w-[300px] space-y-4">
           <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
              <span className="text-sm font-black text-slate-900">₹{subtotal.toLocaleString()}</span>
           </div>
           <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST (0.0%)</span>
              <span className="text-sm font-black text-slate-900">₹0</span>
           </div>
           <div className="bg-blue-600 rounded-2xl p-6 flex justify-between items-center text-white shadow-xl shadow-blue-100">
              <span className="text-xs font-black uppercase tracking-widest opacity-60">Total Paid</span>
              <span className="text-2xl font-black">₹{total.toLocaleString()}</span>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-12 pt-10 border-t-2 border-slate-100">
        <div className="space-y-4">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} className="text-blue-600" /> Administrative Verification
           </h4>
           <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center p-3 opacity-20 grayscale border border-slate-100">
              <Receipt size={32} />
           </div>
           <p className="text-[8px] text-slate-300 font-mono tracking-tighter uppercase leading-tight">
              STUDYCUBS.LMS.SECURE.RECEIPT<br/>
              HASH_VERIFY_{invoice.id.toUpperCase()}<br/>
              TIMESTAMP_{new Date(invoice.paidAt).getTime()}
           </p>
        </div>
        <div className="text-right flex flex-col justify-end">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Powered by StudyCubs Administration</p>
           <p className="text-[9px] font-bold text-slate-300 mt-1 tracking-widest">Official Academic Statement • 2026</p>
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
