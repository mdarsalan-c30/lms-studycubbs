import { Search, ChevronRight, TrendingUp, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function TeacherStudentsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; batch?: string; selected?: string }> 
}) {
  const session = await auth();
  const queryParams = await searchParams;
  const search = queryParams.q || "";
  const filterBatch = queryParams.batch || "All";
  const selectedId = queryParams.selected || null;

  // 1. Get teacher profile
  const teacher = await db.queryOne<any>(
    "SELECT id FROM Teacher WHERE userId = ?",
    [session?.user?.id]
  );

  let teacherStudents: any[] = [];
  let myBatches: any[] = [];

  if (teacher) {
    // 2. Fetch teacher's batches for filter
    myBatches = await db.query<any>(
      "SELECT id, name FROM Batch WHERE teacherId = ?",
      [teacher.id]
    );

    // 3. Fetch students joining Enrollment and Batch
    let sql = `
      SELECT s.id, u.name, u.email, b.name as batch, e.enrolledAt, b.id as batchId,
      (SELECT (COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) * 100 / COUNT(*)) FROM Attendance WHERE studentId = s.id) as attendanceRate
      FROM Student s
      JOIN User u ON s.userId = u.id
      JOIN Enrollment e ON s.id = e.studentId
      JOIN Batch b ON e.batchId = b.id
      WHERE b.teacherId = ? AND (u.name LIKE ? OR u.email LIKE ?)
    `;
    const params: any[] = [teacher.id, `%${search}%`, `%${search}%`];

    if (filterBatch !== "All") {
      sql += " AND b.id = ?";
      params.push(filterBatch);
    }

    teacherStudents = await db.query<any>(sql, params);
  }

  const selected = selectedId ? teacherStudents.find(s => s.id === selectedId) : null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
        <p className="text-slate-500 mt-1">{teacherStudents.length} students across your batches</p>
      </div>

      <form className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            name="q"
            placeholder="Search students..." 
            className="pl-9" 
            defaultValue={search} 
          />
        </div>
        <select 
          name="batch"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white" 
          defaultValue={filterBatch}
        >
          <option value="All">All Batches</option>
          {myBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <Button type="submit" className="bg-slate-800 text-white">Filter</Button>
      </form>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Batch</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Attendance</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Enrolled</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teacherStudents.map(student => (
                <tr 
                  key={student.id} 
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedId === student.id ? "bg-blue-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <Link 
                      href={`/teacher/students?q=${search}&batch=${filterBatch}&selected=${student.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold whitespace-nowrap">
                        {student.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{student.batch}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-14 bg-slate-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${Number(student.attendanceRate) >= 85 ? "bg-emerald-500" : Number(student.attendanceRate) >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${Number(student.attendanceRate || 0)}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 text-nowrap">{Math.round(Number(student.attendanceRate || 0))}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{new Date(student.enrolledAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4"><ChevronRight size={16} className="text-slate-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {teacherStudents.length === 0 && <p className="text-center py-12 text-slate-400 text-sm">No students found.</p>}
        </div>

        {selected && (
          <div className="w-64 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-shrink-0 sticky top-8 h-fit">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold mb-3">{selected.name.substring(0,2).toUpperCase()}</div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{selected.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selected.email}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><BookOpen size={13} className="text-slate-400" /><span className="text-slate-600 text-xs">{selected.batch}</span></div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Attendance</span><span className="font-medium">{Math.round(Number(selected.attendanceRate || 0))}%</span></div>
                <div className="bg-slate-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${Number(selected.attendanceRate) >= 85 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Number(selected.attendanceRate || 0)}%` }} /></div>
              </div>
              <div className="flex justify-between text-xs pt-2"><span className="text-slate-400 text-wrap">Enrolled Date</span><span className="font-medium whitespace-nowrap">{new Date(selected.enrolledAt).toLocaleDateString()}</span></div>
            </div>
            <div className="mt-6">
              <Link href={`/teacher/students?q=${search}&batch=${filterBatch}`}>
                <Button variant="outline" className="w-full text-xs" size="sm">Close Details</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
