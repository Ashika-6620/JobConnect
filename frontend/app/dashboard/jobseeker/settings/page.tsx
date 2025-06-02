"use client";

import { JobseekerSidebar } from "@/components/jobseeker-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { _axios } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Moon, Settings2, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  jobTitle: z.string().optional(),
  language: z.string().min(1, "Please select a language"),
  timezone: z.string().min(1, "Please select a timezone"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  applicationUpdates: z.boolean(),
  jobMatchAlerts: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
});

const securitySchema = z.object({
  twoFactorAuth: z.boolean(),
  loginAlerts: z.boolean(),
  deviceManagement: z.boolean(),
});

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const { theme, setTheme } = useTheme();

  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "Jane Smith",
      email: "jane.smith@techcorp.com",
      jobTitle: "HR Manager",
      language: "en",
      timezone: "America/Los_Angeles",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      applicationUpdates: true,
      jobMatchAlerts: true,
      marketingEmails: false,
      securityAlerts: true,
    },
  });

  const securityForm = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      twoFactorAuth: false,
      loginAlerts: true,
      deviceManagement: true,
    },
  });

  const accountMutation = useMutation({
    mutationFn: async (data: z.infer<typeof accountSchema>) => {
      const res = await _axios.put("/employer/settings/account", data);
      return res.data;
    },
    onSuccess() {
      toast.success("Account settings updated", {
        description: "Your account information has been saved.",
      });
    },
    onError() {
      toast.error("Failed to update account settings", {
        description: "Please try again later.",
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const res = await _axios.put("/employer/settings/password", data);
      return res.data;
    },
    onSuccess() {
      toast.success("Password changed successfully", {
        description: "Your password has been updated.",
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError() {
      toast.error("Failed to change password", {
        description: "Please check your current password and try again.",
      });
    },
  });

  const notificationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof notificationSchema>) => {
      const res = await _axios.put("/employer/settings/notifications", data);
      return res.data;
    },
    onSuccess() {
      toast.success("Notification preferences updated", {
        description: "Your notification settings have been saved.",
      });
    },
    onError() {
      toast.error("Failed to update notification settings", {
        description: "Please try again later.",
      });
    },
  });

  const securityMutation = useMutation({
    mutationFn: async (data: z.infer<typeof securitySchema>) => {
      const res = await _axios.put("/employer/settings/security", data);
      return res.data;
    },
    onSuccess() {
      toast.success("Security settings updated", {
        description: "Your security settings have been saved.",
      });
    },
    onError() {
      toast.error("Failed to update security settings", {
        description: "Please try again later.",
      });
    },
  });

  const onAccountSubmit = (data: z.infer<typeof accountSchema>) => {
    accountMutation.mutate(data);
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    passwordMutation.mutate(data);
  };

  const onNotificationSubmit = (data: z.infer<typeof notificationSchema>) => {
    notificationMutation.mutate(data);
  };

  const onSecuritySubmit = (data: z.infer<typeof securitySchema>) => {
    securityMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <JobseekerSidebar />
      <div className="flex-1">
        <div className="container py-6 px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your personal account information and preferences
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Theme Preference</h3>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setTheme("system")}
                  >
                    <Settings2 className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
