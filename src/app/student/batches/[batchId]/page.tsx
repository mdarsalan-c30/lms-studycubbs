import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  ChevronLeft, 
  Calendar, 
  ClipboardList, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  Mail, 
  Phone,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function StudentBatchDetailPage({ 
  params 
}: { 
  params: Promise<{ batchId: string }> 
}) {
  const { batchId } = await params;
  const session = await auth();
  if (!session?.user) return redirect("/login");

  // 1. Get student profile
  const student = await db.queryOne<any>(
    "SELECT id FROM Student WHERE userId = ?",
    [session.user.id]
  );
  if (!student) return redirect("/login");

  // 2. Fetch Batch Details & Verify Enrollment
  const batch = await db.queryOne<any>(`
    SELECT b.*, u.name as teacherName, u.email as teacherEmail, u.phone as teacherPhone
    FROM Batch b
    JOIN Enrollment e ON b.id = e.batchId
    JOIN Teacher t ON b.teacherId = t.id
    JOIN User u ON t.userId = u.id
    WHERE b.id = ? AND e.studentId = ?
  `, [batchId, student.id]);

  if (!batch) return notFound();

  // 3. Fetch Assignments for this batch
  const assignments = await db.query<any>(`
    SELECT a.*, 
    (SELECT COUNT(*) FROM Submission s WHERE s.assignmentId = a.id AND s.studentId = ?) as isSubmitted
    FROM Assignment a
    WHERE a.batchId = ?
    ORDER BY a.dueDate DESC
  `, [student.id, batchId]);

  // Parse curriculum data
  let curriculum = [];
  try {
    curriculum = batch.curriculum ? JSON.parse(batch.curriculum) : [];
  } catch (e) {
    curriculum = [];
  }

  const completedCount = curriculum.filter((i: any) => i.isCompleted).length;
  const progressPercent = curriculum.length > 0 ? Math.round((completedCount / curriculum.length) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <Link 
          href="/student/batches" 
          className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors mb-4 text-sm font-medium w-fit"
        >
          <ChevronLeft size={16} /> Back to My Batches
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                <BookOpen size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{batch.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                batch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {batch.status}
              </span>
            </div>
            <p className="text-slate-500 flex items-center gap-2 px-1 text-sm">
              <Calendar size={16} className="text-slate-400" /> 
              Schedule: <span className="font-semibold text-slate-700">{batch.schedule}</span>
            </p>
          </div>
          
          <Link href="/student/classes">
            <Button className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl gap-2 font-bold px-8 shadow-xl shadow-emerald-200">
              <Clock size={18} /> Join Next Live Class
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Curriculum & Progress */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Progress Overview */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Learning Roadmap</h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-500 leading-none">{progressPercent}%</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Syllabus Covered</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-8 shadow-inner shadow-slate-200">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {curriculum.map((item: any, index: number) => (
                <div key={index} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${item.isCompleted ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/30 border-slate-100'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${item.isCompleted ? 'bg-emerald-500 border-emerald-200 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                    {item.isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold font-mono">{index + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className={`font-bold leading-tight ${item.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{item.topic}</h4>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {item.date || `Week ${index + 1}`}
                      </span>
                    </div>
                    {item.description && (
                      <p className={`text-xs mt-1 leading-relaxed ${item.isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {curriculum.length === 0 && (
                <div className="py-12 text-center text-slate-400 italic text-sm">
                  The syllabus hasn't been shared yet. Check back soon!
                </div>
              )}
            </div>
          </div>

          {/* Assignments Section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-emerald-500" size={20} />
                <h2 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Assignments & Tasks ({assignments.length})</h2>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {assignments.map((task: any) => (
                <div key={task.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-base">{task.title}</h4>
                        {task.isSubmitted ? (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-200">Submitted</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-200">Pending</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 max-w-2xl mb-3">{task.instructions}</p>
                      <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-slate-400 uppercase tracking-widest">
                          <Clock size={12} /> Due: <span className={new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-slate-600'}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 uppercase tracking-widest">Max Score: {task.maxScore}</span>
                      </div>
                    </div>
                    <Link href={`/student/assignments/${task.id}`}>
                      <Button size="sm" variant={task.isSubmitted ? "outline" : "default"} className={`rounded-xl px-6 font-bold h-10 ${!task.isSubmitted && 'bg-emerald-600 hover:bg-emerald-700'}`}>
                        {task.isSubmitted ? 'View Submission' : 'Submit Task'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="p-20 text-center text-slate-300 flex flex-col items-center gap-2">
                  <ClipboardList size={40} />
                  <p className="text-sm font-medium">No assignments posted yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Teacher Info & Quick Stats */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-6 flex items-center gap-2">
              <GraduationCap size={16} /> Course Instructor
            </h3>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black text-white border border-white/10">
                  {batch.teacherName?.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold tracking-tight">{batch.teacherName}</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Expert Lead Teacher</p>
                </div>
              </div>
              
              <div className="space-y-5 text-sm">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-white/60" />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-0.5">Official Email</p>
                    <p className="font-medium truncate opacity-90">{batch.teacherEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-white/60" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-0.5">Support Phone</p>
                    <p className="font-medium opacity-90">{batch.teacherPhone || '+91 8234-XXX-XXX'}</p>
                  </div>
                </div>
              </div>
              
              <Link href={`/messages?to=${batch.teacherId}`} className="block mt-8">
                <Button className="w-full bg-white text-slate-900 hover:bg-white/90 rounded-2xl font-black h-12 shadow-xl shadow-black/20">
                  Send a Message
                </Button>
              </Link>
            </div>
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-tight text-sm">Batch Quick Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">Batch ID</span>
                <span className="text-xs font-mono font-bold text-slate-900">{batch.id.substring(0,8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">Enrolled on</span>
                <span className="text-xs font-bold text-slate-900">{new Date(batch.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Start Date</span>
                <span className="text-xs font-bold text-slate-900">{new Date(batch.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
