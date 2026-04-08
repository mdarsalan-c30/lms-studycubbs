"use client";

import { 
  Phone, 
  Mail, 
  Trash2,
  RefreshCcw,
  AlertCircle,
  Clock,
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import { updateFirestoreLeadStatus, deleteFirestoreLead } from "@/lib/actions";
import { cn } from "@/lib/utils";

const FIREBASE_API_KEY = "AIzaSyBYK3-y01q4G613EWVk8fXAEIMpwLlrx-Y";
const PROJECT_ID = "trialleads-cc2e7";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/leads?key=${FIREBASE_API_KEY}`;

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "converted",
  "not interested",
  "not answered call",
  "follow up 1",
  "follow up 2",
  "soch ke btaung"
];

const statusStyles: Record<string, string> = {
  "new": "bg-blue-100 text-blue-700 border-blue-200",
  "contacted": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "converted": "bg-teal-600 text-white border-teal-700",
  "not interested": "bg-slate-100 text-slate-600 border-slate-200",
  "not answered call": "bg-red-100 text-red-700 border-red-200",
  "follow up 1": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "follow up 2": "bg-purple-100 text-purple-700 border-purple-200",
  "soch ke btaung": "bg-amber-100 text-amber-700 border-amber-200",
};

export default function TrialsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(FIRESTORE_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data.documents || []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    const res = await updateFirestoreLeadStatus(id, newStatus);
    if (res.success) {
      // Update local state for immediate feedback
      setLeads(current => current.map(doc => {
        if (doc.name.endsWith(id)) {
          return {
            ...doc,
            fields: {
              ...doc.fields,
              status: { stringValue: newStatus }
            }
          };
        }
        return doc;
      }));
    } else {
      alert("Error: " + res.error);
    }
    setUpdating(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    
    setUpdating(id);
    const res = await deleteFirestoreLead(id);
    if (res.success) {
      setLeads(current => current.filter(doc => !doc.name.endsWith(id)));
    } else {
      alert("Error: " + res.error);
    }
    setUpdating(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trial Leads (Firestore)</h1>
          <p className="text-sm text-gray-500 mt-1">Direct management of website inquiries</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchLeads}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            title="Refresh Data"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="text-right border-l pl-4">
            <p className="text-xs font-semibold text-gray-400 uppercase">Leads Count</p>
            <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      <div className="overflow-hidden border border-gray-100 rounded-xl shadow-sm bg-white min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Info</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCcw size={32} className="animate-spin text-blue-500" />
                    <p className="text-gray-400">Loading leads...</p>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                  <p>No leads found in your Firestore "leads" collection.</p>
                </td>
              </tr>
            ) : leads.map((doc: any) => {
              const id = doc.name.split('/').pop();
              const fields = doc.fields || {};
              const name = fields.name?.stringValue || fields.childName?.stringValue || "Parent Name (Unknown)";
              const child = fields.childName?.stringValue || "";
              const email = fields.email?.stringValue || "";
              const phone = fields.phone?.stringValue || "";
              const course = fields.course?.stringValue || "";
              const status = fields.status?.stringValue || "new";
              const timestamp = doc.createTime ? new Date(doc.createTime).toLocaleDateString() : "-";

              return (
                <tr key={id} className={cn(
                  "hover:bg-gray-50/50 transition-colors",
                  updating === id && "opacity-50 pointer-events-none"
                )}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-none mb-1">{name}</p>
                        {child && <p className="text-[11px] text-gray-400 font-medium">Child: {child}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">{course || "Trial Inquiry"}</p>
                    <div className="flex items-center gap-3 mt-1 underline-offset-4">
                      {phone && <a href={`tel:${phone}`} className="text-gray-400 hover:text-blue-600 transition-colors"><Phone size={14} /></a>}
                      {email && <a href={`mailto:${email}`} className="text-gray-400 hover:text-blue-600 transition-colors"><Mail size={14} /></a>}
                      <span className="text-[10px] text-gray-300 ml-1 flex items-center gap-1"><Clock size={10} /> {timestamp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      value={status}
                      onChange={(e) => handleStatusChange(id!, e.target.value)}
                      className={cn(
                        "text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all appearance-none",
                        statusStyles[status] || "bg-gray-50 border-gray-200"
                      )}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="bg-white text-gray-900">{opt.toUpperCase()}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(id!)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      title="Delete Lead"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
