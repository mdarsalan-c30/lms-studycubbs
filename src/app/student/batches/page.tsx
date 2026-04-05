import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, GraduationCap, Calendar, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentBatchesPage() {
  const session = await auth();
  if (!session?.user) return redirect("/login");

  // 1. Get student profile
  const student = await db.queryOne<any>(
    "SELECT id FROM Student WHERE userId = ?",
    [session.user.id]
  );

  let enrolledBatches: any[] = [];
  if (student) {
    // 2. Fetch enrolled batches with teacher and metadata
    enrolledBatches = await db.query<any>(`
      SELECT b.*, u.name as teacherName,
      (SELECT COUNT(*) FROM Enrollment e2 WHERE e2.batchId = b.id) as studentCount
      FROM Batch b
      JOIN Enrollment e ON b.id = e.batchId
      JOIN Teacher t ON b.teacherId = t.id
      JOIN User u ON t.userId = u.id
      WHERE e.studentId = ?
    `, [student.id]);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Courses & Batches</h1>
        <p className="text-slate-500 mt-1">Track your enrolled batches and view your learning roadmap.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledBatches.map((batch) => {
          // Parse curriculum to calculate progress
          let curriculum = [];
          try {
            curriculum = batch.curriculum ? JSON.parse(batch.curriculum) : [];
          } catch (e) {
            curriculum = [];
          }
          
          const completedCount = curriculum.filter((i: any) => i.isCompleted).length;
          const totalCount = curriculum.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div key={batch.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              {/* Card Header Illustration/Gradient */}
              <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 relative p-6">
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                  {batch.status}
                </div>
                <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-teal-600">
                  <BookOpen size={24} />
                </div>
              </div>

              <div className="p-6 pt-10">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate">{batch.name}</h3>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <GraduationCap size={16} className="text-slate-400" />
                    <span>Teacher: <span className="font-semibold text-slate-700">{batch.teacherName}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Schedule: <span className="font-semibold text-slate-700">{batch.schedule}</span></span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <span>Syllabus Progress</span>
                    <span className="text-teal-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 italic">
                    {completedCount} topics covered out of {totalCount} total
                  </p>
                </div>

                <div className="mt-6">
                  <Link href={`/student/batches/${batch.id}`}>
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl gap-2 font-bold h-11">
                      View Batch Details
                      <ChevronRight size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {enrolledBatches.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-bold text-lg">No enrolled batches yet.</p>
            <p className="text-slate-400 max-w-xs mx-auto mt-2">Contact administrator to get enrolled in your favorite courses!</p>
            <Link href="/student/dashboard" className="mt-6 inline-block">
              <Button variant="outline" className="rounded-xl px-8">Back to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
