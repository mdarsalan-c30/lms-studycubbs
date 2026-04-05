import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Calendar, 
  ChevronLeft, 
  UserMinus, 
  UserPlus, 
  BookOpen, 
  Settings,
  Mail,
  Phone,
  Clock
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unenrollStudent, enrollStudentInBatch, updateBatch } from "@/lib/actions";
import CurriculumEditor from "@/components/teacher/CurriculumEditor";

export default async function BatchHubPage({ 
  params 
}: { 
  params: Promise<{ batchId: string }> 
}) {
  const { batchId } = await params;

  // 1. Fetch Batch Details
  const batch = await db.query<any>(`
    SELECT b.*, u.name as teacherName, u.email as teacherEmail
    FROM Batch b
    LEFT JOIN Teacher t ON b.teacherId = t.id
    LEFT JOIN User u ON t.userId = u.id
    WHERE b.id = ?
  `, [batchId]).then(res => res[0]);

  if (!batch) return notFound();

  // 2. Fetch Enrolled Students
  const enrolledStudents = await db.query<any>(`
    SELECT s.id, u.name, u.email, u.phone, e.enrolledAt
    FROM Enrollment e
    JOIN Student s ON e.studentId = s.id
    JOIN User u ON s.userId = u.id
    WHERE e.batchId = ?
    ORDER BY u.name ASC
  `, [batchId]);

  // 3. Fetch All Students (not in this batch) for "Add Member" dropdown
  const allStudents = await db.query<any>(`
    SELECT s.id, u.name 
    FROM Student s
    JOIN User u ON s.userId = u.id
    WHERE s.id NOT IN (SELECT studentId FROM Enrollment WHERE batchId = ?)
    ORDER BY u.name ASC
  `, [batchId]);

  // 4. Fetch All Teachers for assignment dropdown
  const allTeachers = await db.query<any>(`
    SELECT t.id, u.name 
    FROM Teacher t
    JOIN User u ON t.userId = u.id
    ORDER BY u.name ASC
  `);

  const capacityPercent = Math.round((enrolledStudents.length / (batch.capacity || 1)) * 100);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <Link href="/admin/batches" className="flex items-center gap-1 text-slate-500 hover:text-violet-600 transition-colors mb-4 text-sm font-medium w-fit">
          <ChevronLeft size={16} /> Back to Batches
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                <BookOpen size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{batch.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                batch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {batch.status}
              </span>
            </div>
            <p className="text-slate-500 flex items-center gap-2 px-1">
              <Calendar size={16} /> Starts on {new Date(batch.startDate).toLocaleDateString()} • {batch.schedule}
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm min-w-[240px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                <span>Batch Capacity</span>
                <span className={capacityPercent >= 90 ? 'text-red-500' : 'text-violet-600'}>{enrolledStudents.length} / {batch.capacity}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${capacityPercent >= 90 ? 'bg-red-500' : 'bg-violet-500'}`} 
                  style={{ width: `${capacityPercent}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Student Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="text-slate-400" size={20} />
                <h2 className="font-bold text-slate-900 text-lg">Enrolled Students</h2>
                <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-100 text-xs font-bold text-slate-500">{enrolledStudents.length}</span>
              </div>
              
              {/* Quick Add Form */}
              <form action={async (formData) => {
                "use server";
                const studentId = formData.get("studentId") as string;
                await enrollStudentInBatch(studentId, batchId);
              }} className="flex items-center gap-2">
                <select 
                  name="studentId" 
                  className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-violet-500/20 outline-none min-w-[180px]"
                  required
                >
                  <option value="">Enroll a member...</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1">
                  <UserPlus size={14} /> Add
                </Button>
              </form>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enrolledStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {student.name.substring(0,2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-500"><Mail size={12} /> {student.email}</div>
                          <div className="flex items-center gap-1.5 text-slate-500"><Phone size={12} /> {student.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium whitespace-nowrap">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={async () => {
                          "use server";
                          await unenrollStudent(student.id, batchId);
                        }}>
                          <Button 
                            type="submit" 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                          >
                            <UserMinus size={16} />
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {enrolledStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <Users size={48} />
                          <p className="text-sm font-medium">No students enrolled yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>

            {/* Curriculum Management Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-slate-400" size={20} />
                  <h2 className="font-bold text-slate-900 text-lg">Batch Curriculum & Roadmap</h2>
                </div>
              </div>
              <div className="p-6">
                <CurriculumEditor batchId={batchId} initialData={batch.curriculum ? JSON.parse(batch.curriculum) : []} />
              </div>
            </div>
          </div>

        {/* Right Column: Batch Settings & Teacher */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 text-slate-900">
              <Settings size={20} className="text-violet-600" />
              <h2 className="font-bold text-lg">Batch Settings</h2>
            </div>
            
            <form action={async (formData) => {
              "use server";
              const data = {
                name: formData.get("name") as string,
                teacherId: formData.get("teacherId") as string,
                schedule: formData.get("schedule") as string,
                capacity: parseInt(formData.get("capacity") as string),
                status: formData.get("status") as string,
              };
              await updateBatch(batchId, data);
            }} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Batch Name</label>
                <Input name="name" defaultValue={batch.name} className="rounded-xl border-slate-200 focus:ring-violet-500/20" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 text-nowrap">Assigned Teacher</label>
                <select 
                  name="teacherId" 
                  defaultValue={batch.teacherId}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-violet-500/20 outline-none"
                >
                  {allTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Class Schedule</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input name="schedule" defaultValue={batch.schedule} className="rounded-xl pl-9 border-slate-200 focus:ring-violet-500/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Capacity</label>
                  <Input name="capacity" type="number" defaultValue={batch.capacity} className="rounded-xl border-slate-200 focus:ring-violet-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={batch.status}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-violet-500/20 outline-none font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/10 font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-violet-900 rounded-3xl p-6 text-white overflow-hidden relative group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 opacity-80">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Next Class</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{batch.schedule}</h3>
              <p className="text-sm opacity-60">Automated Jitsi link is active for this batch.</p>
              
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                  {batch.teacherName.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{batch.teacherName}</p>
                  <p className="text-[10px] opacity-60 uppercase tracking-widest">Master Instructor</p>
                </div>
              </div>
            </div>
            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
