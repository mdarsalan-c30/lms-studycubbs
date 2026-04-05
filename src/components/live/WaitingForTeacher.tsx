"use client";

import { Clock, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WaitingForTeacher() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-slate-950">
      <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Clock size={40} className="text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 font-display">Class Not Started</h2>
      <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
        The teacher has not started this meeting yet. Please wait for the teacher to initiate the class from their dashboard.
      </p>
      <div className="mt-10">
        <Button 
          variant="outline" 
          className="text-slate-300 border-white/10 hover:bg-white/5 gap-2 px-8 py-6 rounded-2xl transition-all"
          onClick={() => window.location.reload()}
        >
          <RefreshCcw size={16} />
          Check Again
        </Button>
      </div>
      <p className="mt-20 text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
        StudyCubs Secure Learning Environment
      </p>
    </div>
  );
}
