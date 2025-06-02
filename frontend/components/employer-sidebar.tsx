"use client";

import {
  BarChart3,
  Briefcase,
  Building,
  FileText,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function EmployerSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const linkClass = (path: string) => {
    return `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
      isActive(path)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-background border-r p-4 sticky top-0 h-screen">
      <div className="flex items-center gap-2 mb-8">
        <Building className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Job Connect</span>
      </div>

      <nav className="space-y-1 flex-1">
        <Link
          href="/dashboard/employer"
          className={linkClass("/dashboard/employer")}
        >
          <Briefcase className="h-5 w-5" />
          Dashboard
        </Link>
        <Link
          href="/dashboard/employer/jobs"
          className={linkClass("/dashboard/employer/jobs")}
        >
          <FileText className="h-5 w-5" />
          My Jobs
        </Link>
        <Link
          href="/dashboard/employer/post-job"
          className={linkClass("/dashboard/employer/post-job")}
        >
          <Briefcase className="h-5 w-5" />
          Post a Job
        </Link>
        <Link
          href="/dashboard/employer/applications"
          className={linkClass("/dashboard/employer/applications")}
        >
          <Users className="h-5 w-5" />
          Applications
        </Link>
        <Link
          href="/dashboard/employer/candidates"
          className={linkClass("/dashboard/employer/candidates")}
        >
          <Search className="h-5 w-5" />
          Search Candidates
        </Link>
        <Link
          href="/dashboard/employer/messages"
          className={linkClass("/dashboard/employer/messages")}
        >
          <MessageSquare className="h-5 w-5" />
          Messages
        </Link>
        <Link
          href="/dashboard/employer/analytics"
          className={linkClass("/dashboard/employer/analytics")}
        >
          <BarChart3 className="h-5 w-5" />
          Analytics
        </Link>
      </nav>

      <div className="mt-auto pt-4 border-t">
        <Link
          href="/dashboard/employer/company-profile"
          className={linkClass("/dashboard/employer/company-profile")}
        >
          <Building className="h-5 w-5" />
          Company Profile
        </Link>
        <Link
          href="/dashboard/employer/settings"
          className={linkClass("/dashboard/employer/settings")}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <Link
          href="/logout"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
