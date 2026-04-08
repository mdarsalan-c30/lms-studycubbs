import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "TEACHER") return redirect("/auth/login");
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" userName={session.user?.name ?? "Teacher"} userEmail={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
