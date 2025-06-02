"use client";
import { useAuthStore } from "@/lib/authstore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: "jobseeker" | "employer" | "all";
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRole,
  redirectTo = "/login",
}: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (!isInitialized) {
        return;
      }

      if (!user || !user.token) {
        router.replace(redirectTo);
        return;
      }

      if (allowedRole === "all" || user.role === allowedRole) {
        setIsAuthorized(true);
      } else {
        if (user.role === "jobseeker") {
          router.replace("/dashboard/jobseeker");
        } else if (user.role === "employer") {
          router.replace("/dashboard/employer");
        } else {
          router.replace(redirectTo);
        }
      }

      setIsLoading(false);
    }, 500);
  }, [user, allowedRole, redirectTo, router, isInitialized]);

  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}

export function EmployerGuard({
  children,
  redirectTo = "/login",
}: Omit<RoleGuardProps, "allowedRole">) {
  return (
    <RoleGuard allowedRole="employer" redirectTo={redirectTo}>
      {children}
    </RoleGuard>
  );
}

export function JobSeekerGuard({
  children,
  redirectTo = "/login",
}: Omit<RoleGuardProps, "allowedRole">) {
  return (
    <RoleGuard allowedRole="jobseeker" redirectTo={redirectTo}>
      {children}
    </RoleGuard>
  );
}

export function AuthGuard({
  children,
  redirectTo = "/login",
}: Omit<RoleGuardProps, "allowedRole">) {
  return (
    <RoleGuard allowedRole="all" redirectTo={redirectTo}>
      {children}
    </RoleGuard>
  );
}
