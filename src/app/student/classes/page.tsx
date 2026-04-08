import { Video, Calendar, ExternalLink, Clock, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function StudentClassesPage() {
  const session = await auth();

  // 1. Get student profile
  const student = await db.queryOne<any>(
    "SELECT id FROM Student WHERE userId = ?",
    [session?.user?.id]
  );

  let upcomingClasses: any[] = [];
  let todayClass: any = null;
  let myBatches: any[] = [];

  if (student) {
    // 2. Fetch upcoming classes from DB
    upcomingClasses = await db.query<any>(`
      SELECT cs.id, b.name as subject, cs.scheduledAt, cs.topic, cs.liveLink as link,
      CASE WHEN DATE(cs.scheduledAt) = CURDATE() THEN 1 ELSE 0 END as isToday
      FROM ClassSession cs
      JOIN Batch b ON cs.batchId = b.id
      JOIN Enrollment e ON b.id = e.batchId
      WHERE e.studentId = ? 
      AND (DATE(cs.scheduledAt) = CURDATE() OR cs.status = 'LIVE' OR cs.scheduledAt >= NOW())
      ORDER BY cs.scheduledAt ASC
      LIMIT 10
    `, [student.id]);

    todayClass = upcomingClasses.find(c => c.isToday === 1);

    // 3. Fetch Batch Curriculums
    const batchData = await db.query<any>(`
      SELECT b.id, b.name, b.curriculum
      FROM Batch b
      JOIN Enrollment e ON b.id = e.batchId
      WHERE e.studentId = ?
    `, [student.id]);
    
    myBatches = batchData.map(b => ({
      ...b,
      curriculum: b.curriculum ? JSON.parse(b.curriculum) : []
    }));
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Live Classes</h1>
        <p className="text-slate-500 mt-1">Your schedule and class join links</p>
      </div>

      {/* Today's class highlight */}
      {todayClass ? (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">● LIVE TODAY</span>
                </div>
                <h2 className="text-xl font-bold">{todayClass.subject}</h2>
                <p className="text-white/80 mt-0.5 flex items-center gap-1.5">
                  <Clock size={14} />{new Date(todayClass.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-white/70 text-sm mt-1">📚 {todayClass.topic}</p>
              </div>
            </div>
            <Link href={`/live/${todayClass.id}`}>
              <Button className="bg-white text-emerald-700 hover:bg-white/90 font-semibold gap-2">
                <Video size={16} />
                Join Class
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
            <Calendar size={20} className="text-slate-500" />
          </div>
          <div>
            <p className="text-slate-900 font-semibold text-sm">No classes scheduled for today.</p>
            <p className="text-slate-500 text-xs mt-0.5">Check your upcoming schedule below.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Classes List */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900">All Upcoming Classes</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingClasses.map(cls => (
              <div key={cls.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${cls.isToday ? "bg-emerald-50/50" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cls.isToday ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                  <Video size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{cls.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(cls.scheduledAt).toLocaleDateString()} · {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium italic">Topic: {cls.topic}</p>
                </div>
                <Link href={`/live/${cls.id}`}>
                  <Button size="sm" variant={cls.isToday ? "default" : "outline"} className={`text-xs gap-1.5 px-4 ${cls.isToday ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}>
                    <Video size={12} />Join
                  </Button>
                </Link>
              </div>
            ))}
            {upcomingClasses.length === 0 && (
              <div className="p-12 text-center">
                <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-slate-500 text-sm">No upcoming classes found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Batch Roadmap / Syllabus */}
        <div className="space-y-6">
          {myBatches.map((batch: any) => (
            <div key={batch.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                <BookOpen size={18} className="text-violet-600" />
                <h3 className="font-bold text-slate-800 text-sm truncate">{batch.name} Roadmap</h3>
              </div>
              <div className="p-5 space-y-4 max-h-[600px] overflow-auto custom-scrollbar">
                {batch.curriculum && batch.curriculum.length > 0 ? (
                  batch.curriculum.map((item: any, index: number) => (
                    <div key={index} className="relative pl-7 pb-4 last:pb-0 border-l border-slate-100 last:border-0 ml-2">
                      {/* Timeline Dot */}
                      <div className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ring-2 ${item.isCompleted ? 'bg-emerald-500 ring-emerald-100' : 'bg-slate-200 ring-slate-100'}`} />
                      
                      <div className="flex justify-between items-start gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${item.isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {item.date || `Step ${index + 1}`}
                        </span>
                        {item.isCompleted && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> DONE
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm font-bold leading-tight ${item.isCompleted ? 'text-slate-400' : 'text-slate-800'}`}>
                        {item.topic}
                      </h4>
                      {item.description && (
                        <p className={`text-xs mt-1 leading-relaxed ${item.isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-xs italic">No curriculum uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-violet-100">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-violet-200" />
              Quick Tip
            </h3>
            <p className="text-sm text-violet-100/80 leading-relaxed">
              Check the roadmap to stay ahead! Your teachers update this syllabus with upcoming topics and prerequisites.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
