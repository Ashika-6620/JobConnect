"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/authstore";
import { _axios } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const seekerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const employerSchema = z.object({
  companyEmail: z.string().email("Invalid company email address"),
  companyPassword: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"jobseeker" | "employer">(
    "jobseeker"
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as "jobseeker" | "employer");
    seekerForm.reset();
    employerForm.reset();
  };

  const seekerForm = useForm<z.infer<typeof seekerSchema>>({
    resolver: zodResolver(seekerSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const employerForm = useForm<z.infer<typeof employerSchema>>({
    resolver: zodResolver(employerSchema),
    mode: "all",
    defaultValues: {
      companyEmail: "",
      companyPassword: "",
    },
  });

  const setUser = useAuthStore((state) => state.setUser);
  const setInit = useAuthStore((state) => state.setInitialized);

  const { isPending, mutate } = useMutation({
    mutationFn: async (
      data: z.infer<typeof seekerSchema> | z.infer<typeof employerSchema>
    ) => {
      const endpoint = "/auth/login/";

      const res = await _axios.post(endpoint, { ...data, userType: activeTab });
      return res.data;
    },
    onSuccess(data) {
      toast.success("Login successful", {
        description: "Welcome back!",
        duration: 3000,
      });
      console.log("Login successful", data);
      setUser({
        token: data?.data?.access_token,
        email: data?.data?.email,
        role: activeTab,
        company_id: data?.data?.user_id,
        company_email: data?.data?.email,
        company_name: data?.data?.company_name,
        first_name: data?.data?.first_name,
        last_name: data?.data?.last_name,
      });
      setInit();
      const redirectPath =
        activeTab === "jobseeker"
          ? "/dashboard/jobseeker"
          : "/dashboard/employer";
      router.push(redirectPath);
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Login failed", {
        description: "Please check your credentials and try again.",
        duration: 5000,
      });
    },
  });

  const onSeekerSubmit = useCallback(
    (data: z.infer<typeof seekerSchema>) => {
      mutate(data);
    },
    [mutate]
  );

  const onEmployerSubmit = useCallback(
    (data: z.infer<typeof employerSchema>) => {
      mutate(data);
    },
    [mutate]
  );

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-xl font-bold"
      >
        <Briefcase className="h-6 w-6 text-primary" />
        <span>Job Connect</span>
      </Link>

      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="jobseeker"
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="jobseeker">Job Seeker</TabsTrigger>
              <TabsTrigger value="employer">Employer</TabsTrigger>
            </TabsList>
            <TabsContent value="jobseeker">
              <Form {...seekerForm}>
                <form
                  onSubmit={seekerForm.handleSubmit(onSeekerSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={seekerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={seekerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <PasswordInput
                            placeholder="••••••••"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="employer">
              <Form {...employerForm}>
                <form
                  onSubmit={employerForm.handleSubmit(onEmployerSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={employerForm.control}
                    name="companyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="company@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employerForm.control}
                    name="companyPassword"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <div></div>
                        </div>
                        <FormControl>
                          <PasswordInput
                            placeholder="••••••••"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
