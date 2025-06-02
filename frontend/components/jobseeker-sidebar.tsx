"use client";

import { useAuthStore } from "@/lib/authstore";
import {
  AtomIcon,
  Blocks,
  Briefcase,
  FileText,
  Heart,
  LogOut,
  Paperclip,
  Search,
  Settings,
  ShieldCheckIcon,
  ThumbsUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard/jobseeker", label: "Dashboard", icon: Briefcase },
  { href: "/jobs", label: "Find Jobs", icon: Search },
  { href: "/dashboard/jobseeker/saved-jobs", label: "Saved Jobs", icon: Heart },
  {
    href: "/dashboard/jobseeker/applications",
    label: "Applications",
    icon: Paperclip,
  },
  {
    href: "/dashboard/jobseeker/challenges",
    label: "Challenges",
    icon: ThumbsUp,
  },
  {
    href: "/dashboard/jobseeker/history",
    label: "Challenge History",
    icon: ShieldCheckIcon,
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: Blocks,
  },
  {
    href: "/dashboard/jobseeker/resume-builder",
    label: "Resume Builder",
    icon: FileText,
  },
  {
    href: "/dashboard/jobseeker/resume-views",
    label: "Resume Views",
    icon: FileText,
  },
  {
    href: "/ats-resume-parser",
    label: "ATS Resume Parser",
    icon: AtomIcon,
  },
];

const bottomLinks = [
  { href: "/dashboard/jobseeker/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/jobseeker/profile", label: "Profile", icon: User },
  { label: "Logout", icon: LogOut, action: "logout" },
];

export function JobseekerSidebar() {
  const pathname = usePathname();

  const removeUser = useAuthStore((state) => state.clearUser);

  function handleLogout() {
    removeUser();
  }

  const isActive = (href: string) => {
    if (href === "/dashboard/jobseeker") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-background border-r p-4 sticky top-0 h-screen">
      <div className="flex items-center gap-2 mb-8">
        <Briefcase className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Job Connect</span>
      </div>

      <nav className="space-y-1 flex-1">
        {navLinks.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-active={active}
            >
              <IconComponent className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t">
        {bottomLinks.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href as string);
          const isLogoutLink = item.action === "logout";

          if (isLogoutLink) {
            return (
              <button
                key={item.label}
                onClick={handleLogout}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md w-full text-muted-foreground hover:bg-muted hover:text-foreground`}
              >
                <IconComponent className="h-5 w-5" />
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href as string}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-active={active}
            >
              <IconComponent className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
