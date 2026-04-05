"use client";

import { useEffect, useState } from "react";
import { Loader2, Video, CheckCircle2, HelpCircle, Mail, ShieldCheck, Mic, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EnteringClassroom({ onComplete }: { onComplete: () => void }) {
  const [status, setStatus] = useState("Preparing your classroom...");
  const [complete, setComplete] = useState(false);
  const [checks, setChecks] = useState({ mic: false, cam: false, att: false });

  useEffect(() => {
    // Simulated pre-flight checks for better UX
    const t1 = setTimeout(() => setChecks(prev => ({ ...prev, mic: true })), 800);
    const t2 = setTimeout(() => setChecks(prev => ({ ...prev, cam: true })), 1600);
    const t3 = setTimeout(() => setChecks(prev => ({ ...prev, att: true })), 2400);

    const timer2 = setTimeout(() => {
      setStatus("Everything is ready! You can now enter the classroom.");
      setComplete(true);
    }, 3200);

    return () => {
      [t1, t2, t3, timer2].forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center w-full max-w-2xl mx-auto">
      {/* Branded Logo Section */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-2 mb-2 w-full">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter italic whitespace-nowrap">STUDYCUBS <span className="text-emerald-500">LIVE</span></span>
        </div>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Official Learning Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
        {/* Loading State Area */}
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 relative z-10 shadow-2xl overflow-hidden group">
              {complete ? (
                <div className="bg-emerald-500/10 w-full h-full flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
              ) : (
                <Video size={40} className="text-emerald-500/50 animate-pulse" />
              )}
            </div>
            {!complete && (
              <div className="absolute inset-0 w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-3xl animate-spin" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Classroom Session</h2>
          <p className="text-slate-400 text-sm h-12 italic max-w-[200px]">
            {status}
          </p>
          
          {/* THE LAUNCH BUTTON - Only shows when complete */}
          {complete && (
            <Button 
              size="lg"
              className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-6 rounded-2xl shadow-xl shadow-emerald-600/20 gap-2 text-md transition-all active:scale-95 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500"
              onClick={onComplete}
            >
              <Video size={18} />
              Launch Secure Classroom
            </Button>
          )}
        </div>

        {/* Pre-flight Checks & Support */}
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 text-left space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Pre-flight Status</h3>
            <div className="space-y-3">
              <StatusItem icon={Mic} label="Audio Input" active={checks.mic} />
              <StatusItem icon={Camera} label="Video Input" active={checks.cam} />
              <StatusItem icon={CheckCircle2} label="Attendance Logged" active={checks.att} />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
            <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20"><HelpCircle size={14} /></div>
              <span className="text-[11px] font-medium leading-tight">Classroom FAQ</span>
            </a>
            <a href="mailto:support@studycubs.com" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20"><Mail size={14} /></div>
              <span className="text-[11px] font-medium leading-tight">Contact Support</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-16 text-slate-600 text-[10px] uppercase tracking-widest flex items-center gap-2">
        Initializing Secure Stream <Loader2 size={10} className="animate-spin" />
      </div>
    </div>
  );
}

function StatusItem({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) {
  return (
    <div className={`flex items-center gap-3 transition-opacity duration-500 ${active ? "opacity-100" : "opacity-30"}`}>
      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${active ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-slate-500"}`}>
        <Icon size={12} />
      </div>
      <span className="text-xs font-medium text-slate-300">{label}</span>
      {active && <CheckCircle2 size={10} className="ml-auto text-emerald-500" />}
    </div>
  );
}
