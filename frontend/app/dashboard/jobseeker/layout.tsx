"use client";

import { AuthGuard } from "@/components/guards";
import { useAuthStore } from "@/lib/authstore";
import { useRouter } from "next/navigation";

export default function JobseekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clearUser } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    clearUser();
    router.push("/login");
  }

  return (
    <AuthGuard redirectTo="/login">
      <main className="">{children}</main>
    </AuthGuard>
  );
}
