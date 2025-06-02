"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getQueryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import React from "react";
import Header from "./header";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <Toaster
        position="top-right"
        richColors={true}
        expand={true}
        duration={10000}
        closeButton={true}
        toastOptions={{
          classNames: {
            closeButton: "right-0 top-0 absolute",
          },
        }}
      />
    </ThemeProvider>
  );
}

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isJobSeekerPage =
    pathname.includes("/jobseeker") ||
    pathname.includes("/dashboard/employer") ||
    pathname.includes("/jobs");

  const shouldHideHeader = isAuthPage || isJobSeekerPage;

  return (
    <div className="flex min-h-screen flex-col">
      {!shouldHideHeader && <Header />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
