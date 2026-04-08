import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import CurriculumEditor from "@/components/teacher/CurriculumEditor";

export default async function TeacherManageBatchPage({ 
  params 
}: { 
  params: Promise<{ batchId: string }> 
}) {
  const { batchId } = await params;
  const session = await auth();

  // 1. Verify teacher ownership
  const teacher = await db.queryOne<any>(
    "SELECT id FROM Teacher WHERE userId = ?",
    [session?.user?.id]
  );
  if (!teacher) return redirect("/login");

  const batch = await db.queryOne<any>(
    "SELECT * FROM Batch WHERE id = ? AND teacherId = ?",
    [batchId, teacher.id]
  );
  if (!batch) return notFound();

  // Parse curriculum data
  let curriculum = [];
  try {
    curriculum = batch.curriculum ? JSON.parse(batch.curriculum) : [];
  } catch (e) {
    curriculum = [];
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/teacher/batches" 
          className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors mb-4 text-sm font-medium w-fit"
        >
          <ChevronLeft size={16} /> Back to Batches
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{batch.name}</h1>
                <p className="text-slate-500 flex items-center gap-1.5 mt-1 text-sm">
                  <CalendarIcon size={14} /> {batch.schedule}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <CurriculumEditor batchId={batchId} initialData={curriculum} />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-indigo-500" /> Batch Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Capacity</span>
                  <span className="font-bold text-slate-900">{batch.capacity} Students</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{batch.status}</span>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    All curriculum updates are instantly visible to your students on their dashboard. Use the roadmap to plan your upcoming lectures and share syllabus details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
            <h3 className="font-bold mb-2">Student Focus</h3>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              When you add specific dates and topics, students can better prepare for your classes, leading to better participation and results!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
