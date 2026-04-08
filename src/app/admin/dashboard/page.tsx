import { auth } from "@/lib/auth";
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp } from "lucide-react";

import { db } from "@/lib/db";

const feesColors: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

export default async function AdminDashboard() {
  const session = await auth();

  // Fetch real statistics
  const [studentRes] = await db.query<any>("SELECT COUNT(*) as count FROM Student");
  const [teacherRes] = await db.query<any>("SELECT COUNT(*) as count FROM Teacher");
  const [batchRes] = await db.query<any>("SELECT COUNT(*) as count FROM Batch WHERE status = 'ACTIVE'");
  const [revenueRes] = await db.query<any>("SELECT SUM(amount) as total FROM FeePayment WHERE status = 'PAID'");

  const totalStudents = studentRes?.count || 0;
  const activeTeachers = teacherRes?.count || 0;
  const activeBatchesCount = batchRes?.count || 0;
  const totalRevenue = revenueRes?.total || 0;

  const dashboardStats = [
    { label: "Total Students", value: totalStudents.toString(), change: "From database", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Active Teachers", value: activeTeachers.toString(), change: "From database", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Batches", value: activeBatchesCount.toString(), change: "From database", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Revenue (Collected)", value: `₹${Number(totalRevenue).toLocaleString()}`, change: "From database", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  // Fetch recent enrollments
  const recentEnrollments = await db.query<any>(`
    SELECT u.name, b.name as batch, e.enrolledAt, e.id as enrollmentId
    FROM Enrollment e
    JOIN Student s ON e.studentId = s.id
    JOIN User u ON s.userId = u.id
    JOIN Batch b ON e.batchId = b.id
    ORDER BY e.enrolledAt DESC
    LIMIT 5
  `);

  // Fetch active batches with student counts
  const batches = await db.query<any>(`
    SELECT b.name, u.name as teacher, b.capacity, b.status,
    (SELECT COUNT(*) FROM Enrollment e WHERE e.batchId = b.id) as studentCount
    FROM Batch b
    JOIN Teacher t ON b.teacherId = t.id
    JOIN User u ON t.userId = u.id
    WHERE b.status = 'ACTIVE'
    LIMIT 4
  `);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Good morning, {session?.user?.name} 👋</h1>
        <p className="text-slate-500 mt-1">Here's what's happening at StudyCubs today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm font-medium text-slate-600 mt-0.5">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900">Recent Enrollments</h2>
            <a href="/admin/students" className="text-sm text-violet-600 hover:underline font-medium">View all →</a>
          </div>
          <div className="divide-y divide-slate-50">
            {recentEnrollments.map((student: any) => (
              <div key={student.enrollmentId} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {student.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-400">{student.batch}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700`}>
                    Active
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{new Date(student.enrolledAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900">Active Batches</h2>
            <a href="/admin/batches" className="text-sm text-violet-600 hover:underline font-medium">Manage →</a>
          </div>
          <div className="p-4 space-y-3">
            {batches.map((batch: any) => (
              <div key={batch.name} className="p-3 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{batch.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${batch.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {batch.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">👨‍🏫 {batch.teacher}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                    <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${(batch.studentCount / batch.capacity) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{batch.studentCount}/{batch.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          { href: "/admin/batches", icon: BookOpen, label: "Create New Batch", sub: "Set up a new batch", bg: "bg-violet-100 group-hover:bg-violet-600", ic: "text-violet-600 group-hover:text-white", border: "hover:border-violet-200" },
          { href: "/admin/students", icon: Users, label: "Enroll Student", sub: "Add or manage students", bg: "bg-blue-100 group-hover:bg-blue-600", ic: "text-blue-600 group-hover:text-white", border: "hover:border-blue-200" },
          { href: "/admin/fees", icon: DollarSign, label: "Record Payment", sub: "Mark fees as paid", bg: "bg-amber-100 group-hover:bg-amber-600", ic: "text-amber-600 group-hover:text-white", border: "hover:border-amber-200" },
        ].map(q => (
          <a key={q.href} href={q.href} className={`flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm ${q.border} hover:shadow-md transition-all group`}>
            <div className={`w-10 h-10 ${q.bg} rounded-xl flex items-center justify-center transition-colors`}>
              <q.icon size={18} className={`${q.ic} transition-colors`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{q.label}</p>
              <p className="text-xs text-slate-400">{q.sub}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
