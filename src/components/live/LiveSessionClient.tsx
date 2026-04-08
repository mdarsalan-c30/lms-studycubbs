"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EnteringClassroom from "./EnteringClassroom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveSessionClientProps {
  roomUrl: string;
  isHost: boolean;
}

export default function LiveSessionClient({ roomUrl, isHost }: LiveSessionClientProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const handleComplete = () => {
    setIsRedirecting(true);
    // 1. Open Jitsi in a new tab to bypass IFrame limits and allow better navigation
    window.open(roomUrl, '_blank');
    
    // 2. Redirect the current dashboard tab back to the dashboard immediately
    const dashboardPath = isHost ? '/teacher/dashboard' : '/student/dashboard';
    router.push(dashboardPath);
  };

  if (isRedirecting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold text-white mb-2">Connecting to Secure Server...</h2>
        <p className="text-slate-400 text-sm animate-pulse">Establishing unlimited session protocol</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <EnteringClassroom onComplete={handleComplete} />
    </div>
  );
}
