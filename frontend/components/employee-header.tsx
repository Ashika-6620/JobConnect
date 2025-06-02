"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/authstore";
import { Bell, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmployeeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const role = useAuthStore((state) => state.user?.role);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    setUser(null);
    setIsMenuOpen(false);
    router.push("/");
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="border-b border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">JobConnect</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 ml-6">
              <Link
                href="/jobs"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors dark:text-gray-400 dark:hover:text-green-500"
              >
                Find Jobs
              </Link>
              <Link
                href="/resume-builder"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors dark:text-gray-400 dark:hover:text-green-500"
              >
                Resume Builder
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full"
                    >
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs rounded-full">
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">
                          Your resume was viewed
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Google viewed your resume 2 hours ago
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer justify-center text-green-600 dark:text-green-500">
                      View all notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.profile_picture || ""}
                          alt={user.first_name || "User"}
                        />
                        <AvatarFallback>
                          {getInitials(user.first_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href={
                          role === "employer"
                            ? "/dashboard/employer"
                            : "/dashboard/jobseeker"
                        }
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 dark:text-red-500 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link href={"/login"}>
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href={"/register"}>
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 py-4 px-4 bg-white dark:bg-gray-950 dark:border-gray-800">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/jobs"
              className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-500 transition-colors py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Jobs
            </Link>
            <Link
              href="/resume-builder"
              className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-500 transition-colors py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Resume Builder
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-500 transition-colors py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-500 transition-colors py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-500 transition-colors py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 py-2 px-2"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800 mt-2">
                <Link
                  href={"/login"}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href={"/register"}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full"
                >
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
