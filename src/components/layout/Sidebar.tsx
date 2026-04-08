"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  ClipboardList,
  LogOut,
  Settings,
  BarChart3,
  Bell,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  role: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";
  userName: string;
  userEmail: string;
}

const adminLinks = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/trials", label: "CRM Leads", icon: Bell },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
  { href: "/admin/batches", label: "Batches", icon: BookOpen },
  { href: "/admin/fees", label: "Fees & Revenue", icon: DollarSign },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

const teacherLinks = [
  { href: "/teacher/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/teacher/batches", label: "My Batches", icon: BookOpen },
  { href: "/teacher/students", label: "My Students", icon: Users },
  { href: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/teacher/salaries", label: "My Earnings", icon: DollarSign },
  { href: "/teacher/schedule", label: "Schedule", icon: Calendar },
  { href: "/teacher/profile", label: "My Profile", icon: User },
];

const studentLinks = [
  { href: "/student/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/student/batches", label: "My Batches", icon: BookOpen },
  { href: "/student/classes", label: "Live Classes", icon: Calendar },
  { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/student/fees", label: "Fees & Invoices", icon: DollarSign },
  { href: "/student/progress", label: "My Progress", icon: BarChart3 },
];

const roleLinks = {
  SUPER_ADMIN: adminLinks,
  ADMIN: adminLinks,
  TEACHER: teacherLinks,
  STUDENT: studentLinks,
};

const roleColors = {
  SUPER_ADMIN: "from-violet-600 to-indigo-600",
  ADMIN: "from-violet-600 to-indigo-600",
  TEACHER: "from-blue-600 to-cyan-600",
  STUDENT: "from-emerald-600 to-teal-600",
};

const roleLabel = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
};

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const links = roleLinks[role];

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 shadow-sm">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 py-5 bg-gradient-to-r ${roleColors[role]}`}>
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SC</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">StudyCubs</p>
          <p className="text-white/70 text-xs">{roleLabel[role]}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? `bg-gradient-to-r ${roleColors[role]} text-white shadow-sm`
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Notifications */}
      <div className="px-3 pb-2">
        <button suppressHydrationWarning className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 w-full transition-all">
          <Bell size={18} className="text-slate-400" />
          Notifications
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
        </button>
        <button suppressHydrationWarning className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 w-full transition-all">
          <Settings size={18} className="text-slate-400" />
          Settings
        </button>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className={`bg-gradient-to-br ${roleColors[role]} text-white text-xs`}>
              {userName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
          <button
            suppressHydrationWarning
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
