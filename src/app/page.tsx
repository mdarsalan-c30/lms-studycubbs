import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const role = (session.user as any)?.role;
  if (role === "ADMIN" || role === "SUPER_ADMIN") redirect("/admin/dashboard");
  if (role === "TEACHER") redirect("/teacher/dashboard");
  if (role === "STUDENT") redirect("/student/dashboard");

  redirect("/auth/login");
}
