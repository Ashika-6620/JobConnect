"use client";

import { ChallengeHistoryTable } from "@/components/challenge-history-table";
import { JobseekerHeader } from "@/components/jobseeker-header";
import { JobseekerSidebar } from "@/components/jobseeker-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/authstore";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Building } from "lucide-react";
import { useRouter } from "next/navigation";

interface ResumeView {
  employer_id: number;
  employer_name: string;
  viewed_at: string;
  user_agent: string | null;
  ip_address: string | null;
}

export default function JobSeekerDashboard() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      let res = await _axios.get("/jobseeker/stats/");
      return res.data;
    },
  });

  const { data: resumeViewsData, isLoading: loadingResumeViews } = useQuery({
    queryKey: ["resumeViews", user?.company_id],
    queryFn: async () => {
      if (!user?.company_id || !user?.token) return { views: [] };
      const res = await _axios.get(
        `/jobseeker/profile/${user.company_id}/resume-views/`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      return res.data;
    },
    enabled: !!user?.company_id && !!user?.token,
  });

  const latestResumeViews: ResumeView[] =
    resumeViewsData?.views?.slice(0, 3) || [];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <JobseekerSidebar />

      <div className="flex-1">
        <JobseekerHeader />
        <main className="p-6">
          <div className="flex flex-col gap-6">
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              <Card className="col-span-full md:col-span-2 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="space-y-1 flex-1">
                      <h2 className="text-2xl font-bold">
                        Welcome back, {user?.first_name} {user?.last_name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Explore new opportunities, track your progress, and
                        manage your job search all in one place.
                      </p>
                    </div>
                    <div className="shrink-0 flex gap-2">
                      <Button
                        onClick={() =>
                          (window.location.href =
                            "/dashboard/jobseeker/complete-profile")
                        }
                      >
                        Complete Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Resume Views</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.resume_views_count}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-green-500">↑ 3%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Applications</CardTitle>
                  <CardDescription>All time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.applications_count}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-blue-500">+2</span> this month
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 md:grid-cols-1">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Resume Views</CardTitle>
                  <CardDescription>
                    Companies that viewed your resume
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {loadingResumeViews ? (
                      <div className="text-muted-foreground">Loading...</div>
                    ) : latestResumeViews.length === 0 ? (
                      <div className="text-muted-foreground">
                        No companies have viewed your resume yet.
                      </div>
                    ) : (
                      latestResumeViews.map((view, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">
                                {view.employer_name}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(view.viewed_at).toLocaleString(
                                  "en-US",
                                  { timeZone: "UTC" }
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Viewed your resume
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      router.push("/dashboard/jobseeker/resume-views")
                    }
                  >
                    View All Resume Views
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
        <ChallengeHistoryTable />
      </div>
    </div>
  );
}
