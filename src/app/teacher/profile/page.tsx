import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Users,
  ClipboardList
} from "lucide-react";
import { updateTeacherProfile } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function TeacherProfilePage() {
  const session = await auth();
  if (!session?.user) return redirect("/auth/login");

  // 1. Get Teacher Details
  const teacher = await db.queryOne<any>(`
    SELECT t.*, u.name, u.email, u.phone, 
    (SELECT COUNT(*) FROM Batch WHERE teacherId = t.id) as batchCount,
    (SELECT COUNT(DISTINCT studentId) FROM Enrollment WHERE batchId IN (SELECT id FROM Batch WHERE teacherId = t.id)) as studentCount
    FROM Teacher t
    JOIN User u ON t.userId = u.id
    WHERE u.id = ?
  `, [session.user.id]);

  if (!teacher) return redirect("/teacher/dashboard");

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Profile & Availability</h1>
        <p className="text-slate-500 mt-1">Manage your professional info and teaching hours.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
              {teacher.name.substring(0,2).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{teacher.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{teacher.specialization}</p>
            
            <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Batches</p>
                <p className="text-lg font-bold text-blue-600">{teacher.batchCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students</p>
                <p className="text-lg font-bold text-cyan-600">{teacher.studentCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl p-6 text-white text-sm">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <ShieldCheck size={16} />
              <span className="font-bold uppercase tracking-widest text-[10px]">Portal Verification</span>
            </div>
            <p className="opacity-90 leading-relaxed mb-4">
              Your profile is visible to the administration for batch allocation. Keep your availability updated to receive more students!
            </p>
            <div className="flex items-center justify-between text-[11px] font-bold opacity-70 border-t border-white/10 pt-4">
              <span>Account Status</span>
              <span className="bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider">Verified Teacher</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <form action={async (formData) => {
              "use server";
              const data = {
                name: formData.get("name") as string,
                phone: formData.get("phone") as string,
                specialization: formData.get("specialization") as string,
                availability: formData.get("availability") as string,
              };
              await updateTeacherProfile(teacher.id, data);
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input name="name" defaultValue={teacher.name} className="pl-10 rounded-xl border-slate-200" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input name="phone" defaultValue={teacher.phone} className="pl-10 rounded-xl border-slate-200" required />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email (Read Only)</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <Input defaultValue={teacher.email} disabled className="pl-10 rounded-xl border-slate-100 bg-slate-50 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Specialization / Role</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input name="specialization" defaultValue={teacher.specialization} className="pl-10 rounded-xl border-slate-200" required />
                </div>
                <p className="text-[10px] text-slate-400 px-1">e.g., IELTS Specialist, Advanced Grammar Coach</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Weekly Availability</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input name="availability" defaultValue={teacher.availability} className="pl-10 rounded-xl border-slate-200" required />
                </div>
                <p className="text-[10px] text-slate-400 px-1">e.g., Mon-Fri 6:00 PM - 9:00 PM</p>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 font-bold h-12 transition-all">
                  Update My Information
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
