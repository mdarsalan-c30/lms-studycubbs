import { Plus, Search, BookOpen, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";

import { createBatch } from "@/lib/actions";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  UPCOMING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function BatchesPage({ searchParams }: { searchParams: Promise<{ q?: string; showAdd?: string }> }) {
  const queryParams = await searchParams;
  const search = queryParams.q || "";
  const showAdd = queryParams.showAdd === "true";

  // Fetch real batches from DB
  const batches = await db.query<any>(`
    SELECT b.id, b.name, u.name as teacher, b.capacity, b.status, b.schedule, b.startDate,
    (SELECT COUNT(*) FROM Enrollment e WHERE e.batchId = b.id) as studentCount
    FROM Batch b
    LEFT JOIN Teacher t ON b.teacherId = t.id
    LEFT JOIN User u ON t.userId = u.id
    WHERE b.name LIKE ? OR u.name LIKE ?
    ORDER BY b.createdAt DESC
  `, [`%${search}%`, `%${search}%`]);

  // Fetch teachers for the form
  const teachers = await db.query<any>("SELECT t.id, u.name FROM Teacher t JOIN User u ON t.userId = u.id");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Batches</h1>
          <p className="text-slate-500 mt-1">{batches.length} batches total from MySQL</p>
        </div>
        <Link href={showAdd ? "/admin/batches" : "/admin/batches?showAdd=true"}>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus size={16} />{showAdd ? "Close Form" : "New Batch"}
          </Button>
        </Link>
      </div>

      {showAdd && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-violet-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-slate-900 mb-4">Create New Batch</h3>
          <form action={async (formData) => {
            "use server";
            const data = {
              name: formData.get("name") as string,
              teacherId: formData.get("teacherId") as string,
              capacity: parseInt(formData.get("capacity") as string),
              schedule: formData.get("schedule") as string,
              fee: parseFloat(formData.get("fee") as string),
              startDate: formData.get("startDate") as string,
            };
            await createBatch(data);
          }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Name</label>
              <Input name="name" placeholder="e.g. English A1" required className="text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Teacher</label>
              <select name="teacherId" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" required>
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Capacity</label>
              <Input name="capacity" type="number" defaultValue={20} required className="text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Schedule</label>
              <Input name="schedule" placeholder="Mon, Wed, Fri - 6 PM" required className="text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Fee (₹)</label>
              <Input name="fee" type="number" defaultValue={5000} required className="text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Start Date</label>
              <Input name="startDate" type="date" required className="text-sm" />
            </div>
            <div className="md:col-span-3 pt-2">
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold">Create Batch</Button>
            </div>
          </form>
        </div>
      )}

      <form className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input 
          name="q"
          placeholder="Search batches..." 
          className="pl-9" 
          defaultValue={search} 
        />
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {batches.map(batch => (
          <div key={batch.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-violet-600" />
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[batch.status] || "bg-slate-100 text-slate-700"}`}>{batch.status}</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{batch.name}</h3>
            <p className="text-sm text-slate-500 mb-4">👨‍🏫 {batch.teacher}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600"><Users size={14} className="text-slate-400" />{batch.studentCount}/{batch.capacity} students</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar size={14} className="text-slate-400" />{batch.schedule}</div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Capacity</span>
                <span>{Math.round((batch.studentCount / (batch.capacity || 1)) * 100)}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-1.5">
                <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${(batch.studentCount / (batch.capacity || 1)) * 100}%` }} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link href={`/admin/batches/${batch.id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full text-xs">View Students</Button>
              </Link>
              <Link href={`/admin/batches/${batch.id}`} className="flex-1">
                <Button size="sm" className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white">Manage</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
