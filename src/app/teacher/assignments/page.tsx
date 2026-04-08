import { Plus, Upload, CheckCircle2, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { gradeSubmission, createBatch } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function TeacherAssignmentsPage({ searchParams }: { searchParams: Promise<{ expanded?: string; showAdd?: string }> }) {
  const session = await auth();
  const queryParams = await searchParams;
  const expandedId = queryParams.expanded || null;
  const showAdd = queryParams.showAdd === "true";

  // 1. Get teacher profile
  const teacher = await db.queryOne<any>("SELECT id FROM Teacher WHERE userId = ?", [session?.user?.id]);

  let assignments: any[] = [];
  let teacherBatches: any[] = [];

  if (teacher) {
    // 2. Fetch assignments created by this teacher
    assignments = await db.query<any>(`
      SELECT a.id, a.title, b.name as batch, a.dueDate, a.batchId,
      (SELECT COUNT(*) FROM Submission WHERE assignmentId = a.id) as submissionCount,
      (SELECT COUNT(*) FROM Enrollment WHERE batchId = a.batchId) as totalStudents
      FROM Assignment a
      JOIN Batch b ON a.batchId = b.id
      WHERE a.teacherId = ?
      ORDER BY a.createdAt DESC
    `, [teacher.id]);

    teacherBatches = await db.query<any>("SELECT id, name FROM Batch WHERE teacherId = ?", [teacher.id]);
  }

  // 3. Fetch submissions for the expanded assignment
  let selectedSubmissions: any[] = [];
  if (expandedId) {
    selectedSubmissions = await db.query<any>(`
      SELECT s.id, u.name as student, s.submittedAt, s.grade, s.score, s.fileUrl, s.notes
      FROM Submission s
      JOIN Student st ON s.studentId = st.id
      JOIN User u ON st.userId = u.id
      WHERE s.assignmentId = ?
    `, [expandedId]);
  }

  async function handleGrade(formData: FormData) {
    "use server";
    const subId = formData.get("subId") as string;
    const grade = formData.get("grade") as string;
    const score = parseInt(formData.get("score") as string);
    const feedback = formData.get("feedback") as string;
    await gradeSubmission(subId, grade, score, feedback);
  }

  async function handleCreateAssignment(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const batchId = formData.get("batchId") as string;
    const dueDate = formData.get("dueDate") as string;
    const instructions = formData.get("instructions") as string;
    
    const id = `a_${Date.now()}`;
    await db.execute(
      "INSERT INTO Assignment (id, batchId, teacherId, title, instructions, dueDate) VALUES (?, ?, ?, ?, ?, ?)",
      [id, batchId, teacher.id, title, instructions, dueDate]
    );
    revalidatePath("/teacher/assignments");
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-500 mt-1">Manage and review student work from MySQL</p>
        </div>
        <Link href={showAdd ? "/teacher/assignments" : "/teacher/assignments?showAdd=true"}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus size={16} />{showAdd ? "Close Form" : "New Assignment"}
          </Button>
        </Link>
      </div>

      {showAdd && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-blue-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Create New Assignment</h3>
          <form action={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Title</label>
              <Input name="title" placeholder="e.g. Week 1 Essay" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Batch</label>
              <select name="batchId" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" required>
                <option value="">Select Batch</option>
                {teacherBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Due Date</label>
              <Input name="dueDate" type="date" required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Instructions</label>
              <textarea name="instructions" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Explain what students need to do..." />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-blue-600 text-white">Post Assignment</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {assignments.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Link 
              href={expandedId === a.id ? "/teacher/assignments" : `/teacher/assignments?expanded=${a.id}`}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-4 text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"><Upload size={18} className="text-blue-600" /></div>
                <div>
                  <p className="font-semibold text-slate-900">{a.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{a.batch} · Due {new Date(a.dueDate).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400 mt-1">{a.submissionCount}/{a.totalStudents} submitted</p>
                </div>
              </div>
              <ChevronDown size={18} className={`text-slate-400 transition-transform ${expandedId === a.id ? "rotate-180" : ""}`} />
            </Link>

            {expandedId === a.id && (
              <div className="border-t border-slate-50 p-6 bg-slate-50/30">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Submissions</h4>
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-6 py-3 font-semibold text-slate-500">Student</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-500">Submitted At</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-500">Links/Notes</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-500">Grade/Score</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedSubmissions.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{sub.student}</td>
                          <td className="px-4 py-4 text-slate-500">{new Date(sub.submittedAt).toLocaleString()}</td>
                          <td className="px-4 py-4 max-w-[200px] truncate" title={sub.notes}>
                            {sub.fileUrl && <a href={sub.fileUrl} target="_blank" className="text-blue-600 underline block text-xs mb-1">View File</a>}
                            <span className="text-xs text-slate-400 truncate block">{sub.notes || "No notes"}</span>
                          </td>
                          <td className="px-4 py-4">
                            {sub.grade ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-emerald-600">{sub.grade}</span>
                                <span className="text-[10px] text-slate-400">{sub.score} points</span>
                              </div>
                            ) : (
                              <span className="text-amber-500 italic text-xs">Waiting for grade</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {!sub.grade && (
                              <form action={handleGrade} className="flex flex-wrap gap-2 items-center">
                                <input type="hidden" name="subId" value={sub.id} />
                                <input suppressHydrationWarning name="grade" placeholder="A+" className="w-12 border border-slate-200 rounded px-1.5 py-1 text-xs" required />
                                <input suppressHydrationWarning name="score" type="number" placeholder="95" className="w-12 border border-slate-200 rounded px-1.5 py-1 text-xs" required />
                                <Button suppressHydrationWarning type="submit" size="sm" className="bg-emerald-600 text-white text-[10px] px-2 h-7 font-bold">Grade</Button>
                              </form>
                            )}
                          </td>
                        </tr>
                      ))}
                      {selectedSubmissions.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-8 text-slate-400 italic">No submissions yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
        {assignments.length === 0 && <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">No assignments created yet. Click "New Assignment" to start.</div>}
      </div>
    </div>
  );
}

// Small helper since I can't use Client Input here easily
function Input({ ...props }: any) {
  return <input suppressHydrationWarning {...props} className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm ${props.className || ''}`} />;
}
