import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) return redirect("/auth/login");
  const role = (session.user as any)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/auth/login");
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={role as any} userName={session.user?.name ?? "Admin"} userEmail={session.user?.email ?? ""} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
