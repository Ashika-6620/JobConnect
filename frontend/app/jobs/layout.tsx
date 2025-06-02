"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/authstore";
import { Briefcase, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState(0);
  const { user, clearUser } = useAuthStore();

  const router = useRouter();

  function handleLogout() {
    clearUser();
    router.push("/login");
  }
  useEffect(() => {
    if (user) {
      setNotifications(Math.floor(Math.random() * 5));
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-12">
          <div className="flex flex-1 items-center gap-4">
            <Link href="/" className="flex md:hidden items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Job Connect</span>
            </Link>
            <Link href="/" className="hidden md:flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Job Connect</span>
            </Link>
            <form className="hidden md:flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for jobs, companies, or skills..."
                  className="pl-8 rounded-md border bg-background"
                />
              </div>
              <Button type="submit" size="sm" className="h-9">
                Search
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            user?.profile_picture ||
                            "/placeholder.svg?height=32&width=32"
                          }
                          alt={user?.first_name || user?.email || "User"}
                        />
                        <AvatarFallback>
                          {user?.first_name?.[0] ||
                            user?.email?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
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
                      <Link href={`/dashboard/${user.role}/settings`}>
                        Settings
                      </Link>
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
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
