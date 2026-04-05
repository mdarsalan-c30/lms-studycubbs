import { Search, ChevronRight, Mail, Phone, BookOpen, UserPlus, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import Link from "next/link";
import { createPortalUser, assignTeacherToBatch } from "@/lib/actions";

export default async function TeachersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; selected?: string; showAdd?: string }> 
}) {
  const queryParams = await searchParams;
  const search = queryParams.q || "";
  const selectedId = queryParams.selected || null;
  const showAdd = queryParams.showAdd === "true";

  // 1. Fetch teachers from DB
  const teachers = await db.query<any>(`
    SELECT t.id, u.name, u.email, u.phone, t.specialization, t.availability,
    (SELECT COUNT(*) FROM Batch b WHERE b.teacherId = t.id) as batchCount,
    (SELECT COUNT(DISTINCT e.studentId) FROM Enrollment e JOIN Batch b ON e.batchId = b.id WHERE b.teacherId = t.id) as studentCount
    FROM Teacher t
    JOIN User u ON t.userId = u.id
    WHERE u.name LIKE ? OR u.email LIKE ?
  `, [`%${search}%`, `%${search}%`]);

  // 2. Fetch specific teacher details if selected
  let selectedTeacher = null;
  let selectedBatches: any[] = [];
  if (selectedId) {
    selectedTeacher = teachers.find(t => t.id === selectedId);
    if (selectedTeacher) {
      selectedBatches = await db.query<any>(
        "SELECT name FROM Batch WHERE teacherId = ?",
        [selectedTeacher.id]
      );
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teachers</h1>
          <p className="text-slate-500 mt-1">{teachers.length} teachers registered</p>
        </div>
        <Link href={`/admin/teachers?showAdd=true&q=${search}`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <UserPlus size={18} />
            Add New Teacher
          </Button>
        </Link>
      </div>

      {/* Add Teacher Form */}
      {showAdd && (
        <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-900">Create New Teacher Account</h2>
            <Link href="/admin/teachers">
              <Button variant="ghost" size="sm" className="text-blue-600">Cancel</Button>
            </Link>
          </div>
          <form action={async (formData) => {
            "use server";
            const name = formData.get("name") as string;
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            const phone = formData.get("phone") as string;
            const specialization = formData.get("specialization") as string;
            await createPortalUser({ name, email, password, phone, specialization, role: 'TEACHER' });
          }} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input name="name" placeholder="Full Name" required className="bg-white" />
            <Input name="email" type="email" placeholder="Email Address" required className="bg-white" />
            <Input name="password" type="password" placeholder="Password" required className="bg-white" />
            <Input name="specialization" placeholder="Specialization (e.g. IELTS)" required className="bg-white" />
            <div>
              <Button type="submit" className="w-full bg-blue-600 text-white shadow-sm">Create Credentials</Button>
            </div>
          </form>
        </div>
      )}

      <form className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input 
          name="q"
          placeholder="Search teachers..." 
          className="pl-9" 
          defaultValue={search} 
        />
      </form>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Teacher</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Batches</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Students</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Salary</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teachers.map(teacher => (
                <tr 
                  key={teacher.id} 
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedId === teacher.id ? "bg-blue-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/teachers/${teacher.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {teacher.name.substring(0,2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{teacher.name}</p>
                        <p className="text-xs text-slate-400 truncate">{teacher.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{teacher.batchCount} batches</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{teacher.studentCount}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Paid</span>
                  </td>
                  <td className="px-4 py-4"><ChevronRight size={16} className="text-slate-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedTeacher && (
          <div className="w-80 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex-shrink-0 sticky top-8 h-fit">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg shadow-blue-500/20">{selectedTeacher.name.substring(0,2).toUpperCase()}</div>
              <h3 className="font-bold text-slate-900">{selectedTeacher.name}</h3>
              <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                <Briefcase size={12} className="text-blue-400" />
                {selectedTeacher.specialization || 'General Instructor'}
              </p>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Mail size={14} className="text-slate-400" />{selectedTeacher.email}</div>
              <div className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" />{selectedTeacher.phone || "No phone"}</div>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2 text-blue-600">
                  <BookOpen size={14} /> Assigned Batches
                </p>
                <div className="space-y-2 mb-4">
                  {selectedBatches.map(b => (
                    <div key={b.name} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs font-medium text-slate-700">
                      {b.name}
                    </div>
                  ))}
                  {selectedBatches.length === 0 && <p className="text-xs text-slate-400 italic">No active batches.</p>}
                </div>

                <p className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wider text-slate-400">Quick Assign</p>
                <form action={async (formData) => {
                  "use server";
                  const batchId = formData.get("batchId") as string;
                  await assignTeacherToBatch(batchId, selectedTeacher.id);
                }} className="space-y-2">
                  <select 
                    name="batchId"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                    required
                  >
                    <option value="">Select a batch...</option>
                    {(await db.query<any>("SELECT id, name FROM Batch WHERE teacherId IS NULL OR teacherId = '' OR teacherId != ?", [selectedTeacher.id])).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-sm" size="sm">Add to Batch</Button>
                </form>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <Link href={`/admin/teachers?q=${search}`}>
                <Button variant="ghost" className="w-full text-slate-500 text-xs h-8" size="sm">Close Details</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
