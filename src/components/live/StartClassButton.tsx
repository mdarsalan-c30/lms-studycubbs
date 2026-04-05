"use client";

import { useState } from "react";
import { Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrCreateLiveSession } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function StartClassButton({ batchId, batchName }: { batchId: string, batchName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await getOrCreateLiveSession(batchId);
      if (res.success && res.sessionId) {
        router.push(`/live/${res.sessionId}`);
      } else {
        alert("Failed to start session: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="sm" 
      onClick={handleStart}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-8 gap-1.5"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Video size={12} />}
      {loading ? "Starting..." : "Start Class"}
    </Button>
  );
}
