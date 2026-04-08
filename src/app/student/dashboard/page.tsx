import { auth } from "@/lib/auth";
import { Video, ClipboardList, DollarSign, TrendingUp, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { db } from "@/lib/db";

export default async function StudentDashboard() {
  const session = await auth();

  // 1. Get student profile
  const student = await db.queryOne<any>(
    "SELECT id FROM Student WHERE userId = ?",
    [session?.user?.id]
  );

  let dashboardStats = [
    { label: "Attendance", value: "0%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Assignments Done", value: "0/0", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Fees Paid", value: "₹0", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Fees Due", value: "₹0", icon: AlertCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  let upcomingClasses = [];
  let pendingAssignments = [];
  let feesPaid = 0;
  let feesDueCount = 0;

  if (student) {
    // 2. Attendance
    const [attRes] = await db.query<any>(
      "SELECT (COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) * 100 / COUNT(*)) as rate FROM Attendance WHERE studentId = ?",
      [student.id]
    );
    const attendanceRate = attRes?.rate ? Math.round(attRes.rate) : 0;

    // 3. Assignments
    const [subRes] = await db.query<any>(
      "SELECT COUNT(*) as count FROM Submission WHERE studentId = ?",
      [student.id]
    );
    const [totalAssRes] = await db.query<any>(`
      SELECT COUNT(*) as count FROM Assignment a
      JOIN Enrollment e ON a.batchId = e.batchId
      WHERE e.studentId = ?
    `, [student.id]);

    // 4. Fees
    const [paidRes] = await db.query<any>(
      "SELECT SUM(amount) as total FROM FeePayment WHERE studentId = ? AND status = 'PAID'",
      [student.id]
    );
    const [dueRes] = await db.query<any>(
      "SELECT COUNT(*) as count FROM FeePayment WHERE studentId = ? AND status IN ('PENDING', 'OVERDUE')",
      [student.id]
    );
    feesPaid = paidRes?.total || 0;
    feesDueCount = dueRes?.count || 0;

    dashboardStats = [
      { label: "Attendance", value: `${attendanceRate}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Assignments Done", value: `${subRes?.count || 0}/${totalAssRes?.count || 0}`, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Fees Paid", value: `₹${Number(feesPaid).toLocaleString()}`, icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
      { label: "Fees Due", value: feesDueCount > 0 ? `${feesDueCount} Pending` : "₹0", icon: AlertCircle, color: feesDueCount > 0 ? "text-amber-600" : "text-emerald-600", bg: feesDueCount > 0 ? "bg-amber-50" : "bg-emerald-50" },
    ];

    // 5. Upcoming Classes
    upcomingClasses = await db.query<any>(`
      SELECT cs.topic, b.name as subject, cs.scheduledAt as time, cs.liveLink as link, cs.status
      FROM ClassSession cs
      JOIN Batch b ON cs.batchId = b.id
      JOIN Enrollment e ON b.id = e.batchId
      WHERE e.studentId = ? AND cs.scheduledAt >= NOW()
      ORDER BY cs.scheduledAt ASC
      LIMIT 2
    `, [student.id]);

    // 6. Pending Assignments
    pendingAssignments = await db.query<any>(`
      SELECT a.title, b.name as batch, a.dueDate as due
      FROM Assignment a
      JOIN Batch b ON a.batchId = b.id
      JOIN Enrollment e ON b.id = e.batchId
      LEFT JOIN Submission s ON a.id = s.assignmentId AND s.studentId = ?
      WHERE e.studentId = ? AND s.id IS NULL
      ORDER BY a.dueDate ASC
      LIMIT 1
    `, [student.id, student.id]);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {session?.user?.name} 🎓</h1>
        <p className="text-slate-500 mt-1">You have a class starting soon. Get ready!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {dashboardStats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}><stat.icon size={18} className={stat.color} /></div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900">Upcoming Classes</h2>
            <Link href="/student/classes" className="text-sm text-emerald-600 hover:underline font-medium">Full schedule →</Link>
          </div>
          <div className="p-4 space-y-3">
            {upcomingClasses.length > 0 ? upcomingClasses.map((cls: any) => (
              <div key={cls.topic} className={`p-4 rounded-xl border transition-all ${cls.status === 'LIVE' ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cls.status === 'LIVE' ? "bg-emerald-500" : "bg-slate-200"}`}>
                      <Video size={16} className={cls.status === 'LIVE' ? "text-white" : "text-slate-500"} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">{cls.subject}</p>
                        {cls.status === 'LIVE' && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE SOON</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(cls.time).toLocaleString()}</p>
                      <p className="text-sm text-emerald-700 font-medium mt-1">📚 {cls.topic}</p>
                    </div>
                  </div>
                  <a href={cls.link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className={`gap-1.5 text-xs ${cls.status === 'LIVE' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      <ExternalLink size={12} />Join Class
                    </Button>
                  </a>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 p-4">No upcoming classes scheduled.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-50">
              <h2 className="font-semibold text-slate-900">Pending Work</h2>
              <Link href="/student/assignments" className="text-sm text-emerald-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="p-4 space-y-3">
              {pendingAssignments.length > 0 ? pendingAssignments.map((a: any) => (
                <div key={a.title} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.batch}</p>
                  <p className="text-xs text-amber-700 font-medium mt-1">⏰ Due {new Date(a.due).toLocaleDateString()}</p>
                  <Link href="/student/assignments">
                    <Button size="sm" className="mt-2 w-full text-xs bg-amber-500 hover:bg-amber-600 text-white">Submit Now</Button>
                  </Link>
                </div>
              )) : (
                <p className="text-sm text-slate-400 p-4">All caught up! No pending work.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center"><DollarSign size={18} className="text-emerald-600" /></div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Fees Status</p>
                <p className={`text-xs font-medium ${feesDueCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {feesDueCount > 0 ? `${feesDueCount} Pending Invoices` : 'All clear! ✓'}
                </p>
              </div>
            </div>
            <Link href="/student/fees">
              <Button variant="outline" className="w-full text-xs">View Invoices</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
