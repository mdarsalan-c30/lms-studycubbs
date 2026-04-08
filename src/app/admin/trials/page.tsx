"use client";

import React, { useState } from "react";
import { Bell, RefreshCw } from "lucide-react";

export default function TrialsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const iframeUrl = "https://studyucbs-leadss.vercel.app/";

  return (
    <div className="flex flex-col w-full h-full" style={{ height: "calc(100vh - 64px)" }}>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-800">CRM Leads Dashboard</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">External System</p>
        </div>
        <button 
          onClick={() => {
            setIsLoading(true);
            const iframe = document.getElementById('crm-iframe') as any;
            if (iframe) iframe.src = iframeUrl;
          }}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          title="Refresh CRM"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex-1 relative bg-slate-50">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-slate-500 uppercase tracking-widest">Loading CRM...</p>
          </div>
        )}
        <iframe
          id="crm-iframe"
          src={iframeUrl}
          className="w-full h-full border-none"
          title="StudyCubs CRM"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
