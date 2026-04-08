"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalarySlipTemplate } from "./SalarySlipTemplate";

interface SalarySlipModalProps {
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

export function SalarySlipModal({ teacher, payment }: SalarySlipModalProps) {
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-slate-900 gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200 shadow-sm h-9">
          <Download size={14} /> Salary Slip
        </Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 rounded-[2.5rem] shadow-2xl p-4 md:p-8 z-[101] animate-in zoom-in-95 duration-300 focus:outline-none scrollbar-hide print:fixed print:inset-0 print:m-0 print:p-0 print:max-w-none print:max-h-none print:bg-white print:rounded-none">
          
          {/* Header Controls - Hidden on Print */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg ring-4 ring-slate-100">
                  <Printer size={20} />
               </div>
               <div>
                  <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight">Voucher Preview</Dialog.Title>
                  <Dialog.Description className="text-xs font-bold text-slate-400 uppercase tracking-widest">Review & Disburse Artifact</Dialog.Description>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handlePrint}
                className="bg-slate-900 hover:bg-slate-800 text-white gap-2 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-12 shadow-xl shadow-slate-200 active:scale-95 transition-all"
              >
                <Printer size={16} /> Print / Save PDF
              </Button>
              <Dialog.Close asChild>
                <button className="p-3 hover:bg-slate-200 rounded-xl transition-colors outline-none text-slate-400 hover:text-slate-900">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* The Content to Print */}
          <div className="print-area">
            <SalarySlipTemplate teacher={teacher} payment={payment} />
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
