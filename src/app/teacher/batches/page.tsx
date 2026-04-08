import { BookOpen, Users, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export default async function TeacherBatchesPage() {
  const session = await auth();

  // 1. Get teacher profile
  const teacher = await db.queryOne<any>(
    "SELECT id FROM Teacher WHERE userId = ?",
    [session?.user?.id]
  );

  let myBatches: any[] = [];
  if (teacher) {
    // 2. Fetch real batches from DB
    myBatches = await db.query<any>(`
      SELECT b.id, b.name, b.capacity, b.schedule, b.status, 
      (SELECT COUNT(*) FROM Enrollment e WHERE e.batchId = b.id) as studentCount,
      (SELECT topic FROM ClassSession WHERE batchId = b.id AND scheduledAt >= NOW() ORDER BY scheduledAt ASC LIMIT 1) as nextTopic,
      (SELECT scheduledAt FROM ClassSession WHERE batchId = b.id AND scheduledAt >= NOW() ORDER BY scheduledAt ASC LIMIT 1) as nextDate
      FROM Batch b
      WHERE b.teacherId = ?
    `, [teacher.id]);
  }

  const colors = [
    "from-blue-500 to-cyan-500",
    "from-indigo-500 to-blue-500",
    "from-violet-500 to-purple-500",
    "from-emerald-500 to-teal-500"
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Batches</h1>
        <p className="text-slate-500 mt-1">{myBatches.length} active batches assigned to you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myBatches.map((batch, index) => (
          <div key={batch.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            {/* Batch Header */}
            <div className={`bg-gradient-to-r ${colors[index % colors.length]} p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{batch.name}</h2>
                  <p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
                    <Calendar size={13} />{batch.schedule}
                  </p>
                </div>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">{batch.status}</span>
              </div>
            </div>

            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{batch.studentCount}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Enrolled Students</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{batch.capacity - batch.studentCount}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Seats Remaining</p>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Capacity</span>
                  <span>{batch.studentCount}/{batch.capacity}</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2">
                  <div className={`bg-gradient-to-r ${colors[index % colors.length]} h-2 rounded-full`} style={{ width: `${(batch.studentCount / (batch.capacity || 1)) * 100}%` }} />
                </div>
              </div>

              {/* Next Class */}
              {batch.nextDate && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Next: {new Date(batch.nextDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1 ml-5">Topic: {batch.nextTopic || 'TBD'}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Link href="/teacher/students" className="flex-1">
                    <Button variant="outline" className="w-full gap-1.5 text-xs h-9"><Users size={14} />Students</Button>
                  </Link>
                  <Link href="/teacher/assignments" className="flex-1">
                    <Button variant="outline" className="w-full gap-1.5 text-xs h-9"><BookOpen size={14} />Tasks</Button>
                  </Link>
                </div>
                <Link href={`/teacher/batches/${batch.id}/manage`}>
                  <Button className="w-full gap-2 text-sm bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 shadow-lg shadow-slate-200">
                    <Calendar size={16} /> Manage Batch & Curriculum
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {myBatches.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500">No batches assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
