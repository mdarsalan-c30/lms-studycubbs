import { auth } from "@/lib/auth";
import { BookOpen, Users, ClipboardList, Clock } from "lucide-react";

import { db } from "@/lib/db";
import StartClassButton from "@/components/live/StartClassButton";

export default async function TeacherDashboard() {
  const session = await auth();
  
  // 1. Get teacher profile
  const teacher = await db.queryOne<any>(
    "SELECT id FROM Teacher WHERE userId = ?",
    [session?.user?.id]
  );

  let dashboardStats = [
    { label: "Active Batches", value: "0", icon: BookOpen, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Total Students", value: "0", icon: Users, bg: "bg-cyan-50", color: "text-cyan-600" },
    { label: "Pending Reviews", value: "0", icon: ClipboardList, bg: "bg-amber-50", color: "text-amber-600" },
  ];

  let teacherBatches = [];
  let assignments = [];

  if (teacher) {
    // 2. Fetch real stats
    const batchesRes = await db.query<any>(
      "SELECT id, name, status, (SELECT COUNT(*) FROM Enrollment WHERE batchId = Batch.id) as studentCount FROM Batch WHERE teacherId = ?",
      [teacher.id]
    );
    teacherBatches = batchesRes;

    const [totalStudents] = await db.query<any>(
      "SELECT COUNT(DISTINCT studentId) as count FROM Enrollment WHERE batchId IN (SELECT id FROM Batch WHERE teacherId = ?)",
      [teacher.id]
    );

    const [pendingReviews] = await db.query<any>(
      "SELECT COUNT(*) as count FROM Submission s JOIN Assignment a ON s.assignmentId = a.id WHERE a.teacherId = ? AND s.grade IS NULL",
      [teacher.id]
    );

    dashboardStats = [
      { label: "Active Batches", value: batchesRes.filter(b => b.status === 'ACTIVE').length.toString(), icon: BookOpen, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Total Students", value: (totalStudents?.count || 0).toString(), icon: Users, bg: "bg-cyan-50", color: "text-cyan-600" },
      { label: "Pending Reviews", value: (pendingReviews?.count || 0).toString(), icon: ClipboardList, bg: "bg-amber-50", color: "text-amber-600" },
    ];

    // 3. Fetch pending assignments details
    assignments = await db.query<any>(`
      SELECT a.title, b.name as batch, a.dueDate,
      (SELECT COUNT(*) FROM Submission WHERE assignmentId = a.id) as submissions,
      (SELECT COUNT(*) FROM Enrollment WHERE batchId = a.batchId) as total
      FROM Assignment a
      JOIN Batch b ON a.batchId = b.id
      WHERE a.teacherId = ?
      LIMIT 3
    `, [teacher.id]);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hello, {session?.user?.name} 👨‍🏫</h1>
        <p className="text-slate-500 mt-1">You have 2 classes scheduled today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {dashboardStats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}><s.icon size={18} className={s.color} /></div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900">My Batches</h2>
            <a href="/teacher/batches" className="text-sm text-blue-600 hover:underline font-medium">View all →</a>
          </div>
          <div className="p-4 space-y-3">
            {teacherBatches.length > 0 ? teacherBatches.map((batch: any) => (
              <div key={batch.id} className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-slate-900">{batch.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{batch.status}</span>
                    {batch.status === 'ACTIVE' && (
                      <StartClassButton batchId={batch.id} batchName={batch.name} />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Users size={13} /> {batch.studentCount} students</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 p-4">No batches assigned yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900">Assignment Reviews</h2>
            <a href="/teacher/assignments" className="text-sm text-blue-600 hover:underline font-medium">View all →</a>
          </div>
          <div className="p-4 space-y-3">
            {assignments.length > 0 ? assignments.map((a: any) => (
              <div key={a.title} className="p-4 rounded-xl bg-slate-50">
                <p className="font-semibold text-slate-900 text-sm mb-1">{a.title}</p>
                <p className="text-xs text-slate-500 mb-3">{a.batch} · Due {new Date(a.dueDate).toLocaleDateString()}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(a.submissions / (a.total || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{a.submissions}/{a.total} submitted</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 p-4">No assignments created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
