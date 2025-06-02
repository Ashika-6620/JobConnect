"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/authstore";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Building2,
  FileText,
  Home,
  LogOut,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} className="w-full">
          <Button
            variant={isActive ? "secondary" : "ghost"}
            size="lg"
            className={cn(
              "w-full justify-start gap-2 font-medium",
              isActive
                ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20"
                : ""
            )}
          >
            {icon}
            <span>{label}</span>
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="ml-1">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  const router = useRouter();

  const navItems = [
    {
      href: "/dashboard/employer",
      icon: <Home className="h-5 w-5" />,
      label: "Overview",
    },
    {
      href: "/dashboard/employer/jobs",
      icon: <Briefcase className="h-5 w-5" />,
      label: "Jobs",
    },
    {
      href: "/dashboard/employer/applications",
      icon: <FileText className="h-5 w-5" />,
      label: "Applications",
    },
    {
      href: "/candidates",
      icon: <Users className="h-5 w-5" />,
      label: "Candidates",
    },
    {
      href: "/dashboard/employer/create",
      icon: <PlusCircle className="h-5 w-5" />,
      label: "Create Challenge",
    },
    {
      href: "/dashboard/employer/company",
      icon: <Building2 className="h-5 w-5" />,
      label: "Company Profile",
    },
    {
      href: "/dashboard/employer/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 border-r bg-background overflow-y-auto">
        <div className="p-6">
          <Link href="/dashboard/employer" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Job Connect</span>
          </Link>
        </div>

        <div className="px-3 py-2 space-y-1 flex-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={
                pathname === item.href ||
                (pathname.startsWith(item.href) &&
                  item.href !== "/dashboard/employer") ||
                (item.href === "/dashboard/employer" &&
                  pathname === "/dashboard/employer")
              }
            />
          ))}
        </div>

        <div className="p-4 mt-auto border-t">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src="/placeholder-logo.png" />
              <AvatarFallback>
                {user?.company_name ? user.company_name[0].toUpperCase() : "C"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.company_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "User"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => {
              setUser(null), router.push("/");
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden border-b px-4 py-3 flex justify-between items-center bg-background">
          <Link href="/dashboard/employer" className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">Job Connect</span>
          </Link>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-logo.png" />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center justify-around border-t bg-background py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full",
                  pathname === item.href ||
                    (pathname.startsWith(item.href) &&
                      item.href !== "/dashboard/employer") ||
                    (item.href === "/dashboard/employer" &&
                      pathname === "/dashboard/employer")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
