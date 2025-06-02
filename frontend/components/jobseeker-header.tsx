"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/authstore";
import { _axios } from "@/lib/axios";
import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function JobseekerHeader() {
  const { user, clearUser } = useAuthStore();
  const router = useRouter();

  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      if (!user?.company_id || !user?.token) return;
      setLoading(true);
      try {
        const res = await _axios.get(
          `/jobseeker/profile/${user.company_id}/resume-views/`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        if (res.data.success) {
          setViews(res.data.views);
        } else {
          setError(res.data.message || "Failed to fetch views");
        }
      } catch (err) {
        setError("Failed to fetch resume views");
      } finally {
        setLoading(false);
      }
    };
    fetchViews();
  }, [user]);

  function handleLogout() {
    clearUser();
    router.push("/login");
  }

  return (
    <div className="flex justify-end gap-4 py-2 items-center">
      {user ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {loading ? null : views.length > 0 ? (
                  <span className="absolute top-0 right-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                    {views.length}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {loading ? (
                <DropdownMenuItem>Loading...</DropdownMenuItem>
              ) : error ? (
                <DropdownMenuItem className="text-red-500">
                  {error}
                </DropdownMenuItem>
              ) : views.length === 0 ? (
                <DropdownMenuItem>No resume views yet</DropdownMenuItem>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs text-muted-foreground font-semibold">
                    Recent Resume Views
                  </div>
                  {views.slice(0, 5).map((view: any, idx: number) => (
                    <DropdownMenuItem
                      key={idx}
                      className="flex flex-col items-start gap-0.5"
                    >
                      <span className="font-medium text-sm">
                        {view.employer_name || "Unknown Company"} Viewed your
                        Resume
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(view.viewed_at).toLocaleString("en-US", {
                          timeZone: "IST",
                        })}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  {views.length > 5 && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/jobseeker/resume-views"
                        className="w-full text-center text-primary font-semibold"
                      >
                        View all
                      </Link>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <span className="hidden md:inline-flex">
                  {user?.first_name || user?.email || "User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${user.role}`}>Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${user.role}/settings`}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </>
      )}
    </div>
  );
}
