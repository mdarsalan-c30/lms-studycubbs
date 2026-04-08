import { Upload, CheckCircle2, Clock, AlertCircle, FileText, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { submitAssignment } from "@/lib/actions";
import { revalidatePath } from "next/cache";

export default async function StudentAssignmentsPage({ searchParams }: { searchParams: Promise<{ selected?: string }> }) {
  const session = await auth();
  const queryParams = await searchParams;
  const selectedId = queryParams.selected || null;

  // 1. Get student profile
  const student = await db.queryOne<any>("SELECT id FROM Student WHERE userId = ?", [session?.user?.id]);
  
  let myAssignments: any[] = [];
  if (student) {
    // 2. Fetch assignments for student's batches
    myAssignments = await db.query<any>(`
      SELECT a.id, a.title, b.name as batch, a.dueDate, a.instructions,
      s.id as submissionId, s.submittedAt, s.grade, s.score, s.feedback
      FROM Assignment a
      JOIN Batch b ON a.batchId = b.id
      JOIN Enrollment e ON b.id = e.batchId
      LEFT JOIN Submission s ON (a.id = s.assignmentId AND e.studentId = s.studentId)
      WHERE e.studentId = ?
      ORDER BY a.dueDate ASC
    `, [student.id]);
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const assignmentId = formData.get("assignmentId") as string;
    const notes = formData.get("notes") as string;
    const fileUrl = formData.get("fileUrl") as string;
    
    await submitAssignment({
      assignmentId,
      studentId: student.id,
      notes,
      fileUrl
    });
    revalidatePath("/student/assignments");
  }

  return (
    <div className="p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">My Assignments</h1>
        <p className="text-slate-500 mt-1 pb-5 border-b border-slate-100">Track your progress and submit your work below</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myAssignments.map(a => {
          const isSubmitted = !!a.submissionId;
          const isGraded = !!a.grade;
          
          return (
            <div key={a.id} className={`bg-white rounded-2xl border p-6 transition-all shadow-sm ${selectedId === a.id ? "border-blue-400 ring-2 ring-blue-50" : "border-slate-100"}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSubmitted ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                    {isSubmitted ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{a.title}</h3>
                    <p className="text-xs text-slate-400">{a.batch} · Due {new Date(a.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {isSubmitted ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isGraded ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                    {isGraded ? `Graded: ${a.grade}` : "Submitted"}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-100 text-amber-700">Pending</span>
                )}
              </div>

              <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100 italic line-clamp-3" title={a.instructions}>
                {a.instructions || "No specific instructions provided."}
              </p>

              {!isSubmitted ? (
                <form action={handleSubmit} className="space-y-4 pt-4 border-t border-slate-50">
                  <input type="hidden" name="assignmentId" value={a.id} />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><LinkIcon size={12} />Submission Link (Google Drive / PDF Link)</label>
                    <input name="fileUrl" className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="https://..." required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Submission Notes</label>
                    <textarea name="notes" className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="Any additional notes for the teacher?" rows={2} />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-9">
                    Submit My Work
                  </Button>
                </form>
              ) : (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-900 mb-2">My Submission</p>
                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-2">
                    <p><span className="font-semibold text-slate-700">Submitted On:</span> {new Date(a.submittedAt).toLocaleString()}</p>
                    <p className="truncate"><span className="font-semibold text-slate-700">Link:</span> <a href={a.fileUrl} target="_blank" className="text-blue-600 underline">{a.fileUrl}</a></p>
                    {a.feedback && (
                      <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="font-bold text-emerald-800 text-[10px] uppercase tracking-wide mb-1">Teacher's Feedback</p>
                        <p className="text-emerald-700 italic">{a.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {myAssignments.length === 0 && <div className="col-span-2 text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400">No assignments found for your batches. You're all caught up! ✨</div>}
      </div>
    </div>
  );
}
