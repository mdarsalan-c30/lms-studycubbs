import { Search, ChevronRight, Mail, Phone, Plus, UserPlus, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import Link from "next/link";
import { createPortalUser, enrollStudentInBatch } from "@/lib/actions";

const feesColors: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default async function StudentsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; fees?: string; batch?: string; selected?: string; showAdd?: string }> 
}) {
  const queryParams = await searchParams;
  const search = queryParams.q || "";
  const filterFees = queryParams.fees || "All";
  const filterBatch = queryParams.batch || "All";
  const selectedId = queryParams.selected || null;
  const showAdd = queryParams.showAdd === "true";

  // 1. Fetch available batches for filter/enrollment
  const allBatches = await db.query<any>("SELECT id, name FROM Batch");
  
  // 2. Fetch students from DB
  let sql = `
    SELECT s.id, u.name, u.email, u.phone, 
           GROUP_CONCAT(b.name) as batch, 
           MAX(e.enrolledAt) as enrolledAt, 
           MAX(b.id) as batchId,
           (SELECT status FROM FeePayment WHERE studentId = s.id ORDER BY dueDate DESC LIMIT 1) as lastFeeStatus
    FROM Student s
    JOIN User u ON s.userId = u.id
    LEFT JOIN Enrollment e ON s.id = e.studentId
    LEFT JOIN Batch b ON e.batchId = b.id
    WHERE (u.name LIKE ? OR u.email LIKE ?)
  `;
  const params: any[] = [`%${search}%`, `%${search}%`];

  if (filterBatch !== "All") {
    sql += " AND b.id = ?";
    params.push(filterBatch);
  }

  sql += " GROUP BY s.id, u.name, u.email, u.phone";

  const students = await db.query<any>(sql, params);

  const filteredStudents = students.filter(s => {
    if (filterFees === "All") return true;
    return s.lastFeeStatus === filterFees.toUpperCase();
  });

  const selected = selectedId ? filteredStudents.find(s => s.id === selectedId) : null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 mt-1">{filteredStudents.length} students total</p>
        </div>
        <Link href={`/admin/students?showAdd=true&q=${search}`}>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <UserPlus size={18} />
            Add New Student
          </Button>
        </Link>
      </div>

      {/* Add Student Form */}
      {showAdd && (
        <div className="mb-8 p-6 bg-violet-50 rounded-2xl border border-violet-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-violet-900">Create New Student Account</h2>
            <Link href="/admin/students">
              <Button variant="ghost" size="sm" className="text-violet-600">Cancel</Button>
            </Link>
          </div>
          <form action={async (formData) => {
            "use server";
            const name = formData.get("name") as string;
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            const phone = formData.get("phone") as string;
            await createPortalUser({ name, email, password, phone, role: 'STUDENT' });
          }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input name="name" placeholder="Full Name" required className="bg-white" />
            <Input name="email" type="email" placeholder="Email Address" required className="bg-white" />
            <Input name="password" type="password" placeholder="Password" required className="bg-white" />
            <Input name="phone" placeholder="Phone Number" className="bg-white" />
            <div className="md:col-start-4">
              <Button type="submit" className="w-full bg-violet-600 text-white">Create Credentials</Button>
            </div>
          </form>
        </div>
      )}

      <form className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            name="q" 
            placeholder="Search students..." 
            className="pl-9" 
            defaultValue={search} 
          />
        </div>
        <select 
          name="fees"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white" 
          defaultValue={filterFees}
        >
          {["All", "Paid", "Pending", "Overdue"].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select 
          name="batch"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white" 
          defaultValue={filterBatch}
        >
          <option value="All">All Batches</option>
          {allBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <Button type="submit" className="bg-slate-800 text-white">Filter</Button>
      </form>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Batch</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Fees</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 text-nowrap">Last Update</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map(student => (
                <tr
                  key={student.id}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${selected?.id === student.id ? "bg-violet-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/students?q=${search}&fees=${filterFees}&batch=${filterBatch}&selected=${student.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {student.name.substring(0,2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{student.name}</p>
                        <p className="text-xs text-slate-400 truncate">{student.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {student.batch ? (
                      <span className="text-slate-600">{student.batch}</span>
                    ) : (
                      <Link 
                        href={`/admin/students?q=${search}&fees=${filterFees}&batch=${filterBatch}&selected=${student.id}`}
                        className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-600 font-bold text-[10px] uppercase tracking-wider border border-amber-100 hover:bg-amber-100 transition-colors"
                      >
                        Enroll Now
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${feesColors[student.lastFeeStatus] || "bg-slate-100 text-slate-700"}`}>
                      {student.lastFeeStatus || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    <Link 
                      href={`/admin/students?q=${search}&fees=${filterFees}&batch=${filterBatch}&selected=${student.id}`}
                      className="flex items-center gap-1 text-violet-600 font-semibold hover:underline"
                    >
                      Manage <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="w-80 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex-shrink-0 sticky top-8 h-fit">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg shadow-violet-500/20">
                {selected.name.substring(0,2).toUpperCase()}
              </div>
              <h3 className="font-bold text-slate-900">{selected.name}</h3>
              <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${feesColors[selected.lastFeeStatus] || "bg-slate-100 text-slate-700"}`}>
                Fees: {selected.lastFeeStatus || 'N/A'}
              </span>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Mail size={14} className="text-slate-400" />{selected.email}</div>
              <div className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" />{selected.phone || "No phone"}</div>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2 text-violet-600">
                  <BookOpen size={14} /> Batch Enrollment
                </p>
                
                <form action={async (formData) => {
                  "use server";
                  const batchId = formData.get("batchId") as string;
                  await enrollStudentInBatch(selected.id, batchId);
                }} className="space-y-3">
                  <select 
                    name="batchId"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-violet-500/20 outline-none"
                    required
                    defaultValue={selected.batchId || ""}
                  >
                    <option value="">{selected.batch ? "Change current batch..." : "Assign to a batch..."}</option>
                    {allBatches.filter(b => b.id !== selected.batchId).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs py-2 shadow-sm" size="sm">
                    {selected.batch ? "Update Enrollment" : "Enroll Member"}
                  </Button>
                </form>
                
                {selected.batch && (
                  <p className="mt-3 text-[10px] text-slate-400 text-center">
                    Enrolled on {new Date(selected.enrolledAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <Link href={`/admin/students?q=${search}&fees=${filterFees}&batch=${filterBatch}`}>
                <Button variant="ghost" className="w-full text-slate-500 text-xs py-1 h-8" size="sm">Close Details</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
