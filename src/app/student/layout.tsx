import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "STUDENT") return redirect("/auth/login");
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="STUDENT" userName={session.user?.name ?? "Student"} userEmail={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
