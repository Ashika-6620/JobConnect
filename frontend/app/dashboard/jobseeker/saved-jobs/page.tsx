"use client";

import { JobseekerSidebar } from "@/components/jobseeker-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { _axios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Bookmark,
  BookmarkX,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SavedJob {
  id: string;
  job_title: string;
  company_name: string;
  saved_at: string;
  job_detail: {
    id: string;
    title: string;
    location: string;
    job_type: string;
    experience_level: string;
    salary_range: string;
    remote: boolean;
    skills: string[];
    created_at: string;
  };
}

export default function SavedJobsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["savedJobs"],
    queryFn: async () => {
      const response = await _axios.get("/jobs/saved/");
      return response.data;
    },
  });

  const removeSavedJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return await _axios.post("/jobs/saved/", { job_id: jobId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      toast.success("Job removed from saved jobs");
    },
    onError: () => {
      toast.error("Failed to remove job");
    },
  });

  const handleRemoveSavedJob = (jobId: string) => {
    removeSavedJobMutation.mutate(jobId);
  };

  const savedJobs = data?.data || [];

  if (isLoading) {
    return (
      <div className="container">
        <div className="flex justify-center items-center h-64">
          <p>Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container">
        <div className="flex justify-center items-center h-64">
          <p>Failed to load saved jobs. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <JobseekerSidebar />
      <div className="flex-1">
        <div className="container py-6 px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold">Saved Jobs</h1>
              <p className="text-muted-foreground">
                Jobs you've saved for later
              </p>
            </div>
          </div>

          {savedJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">
                  No saved jobs yet
                </CardTitle>
                <CardDescription className="text-center mb-4">
                  When you save jobs, they will appear here for quick access.
                </CardDescription>
                <Button asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {savedJobs.map((savedJob: SavedJob) => (
                <Card key={savedJob.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                      <div className="md:col-span-9 space-y-2">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <Link
                              href={`/jobs/${
                                savedJob.job_detail?.id || savedJob.id
                              }`}
                              className="text-lg font-semibold hover:text-primary hover:underline"
                            >
                              {savedJob.job_detail?.title || savedJob.job_title}
                            </Link>
                            <p className="text-muted-foreground">
                              {savedJob.company_name}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {savedJob.job_detail?.job_type && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {savedJob.job_detail.job_type}
                                </span>
                              )}
                              {savedJob.job_detail?.experience_level && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {savedJob.job_detail.experience_level}
                                </span>
                              )}
                              {savedJob.job_detail?.remote && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Remote
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            {savedJob.job_detail?.location ||
                              "Location not specified"}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="mr-1 h-4 w-4" />
                            {savedJob.job_detail?.salary_range ||
                              "Salary not specified"}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {savedJob.job_detail?.created_at
                              ? `Posted ${formatDistanceToNow(
                                  parseISO(savedJob.job_detail.created_at),
                                  { addSuffix: true }
                                )}`
                              : savedJob.saved_at
                              ? `Saved ${formatDistanceToNow(
                                  parseISO(savedJob.saved_at),
                                  { addSuffix: true }
                                )}`
                              : "Recently saved"}
                          </div>
                        </div>
                        {savedJob.job_detail?.skills &&
                          savedJob.job_detail.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {savedJob.job_detail.skills
                                .slice(0, 5)
                                .map((skill, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {savedJob.job_detail.skills.length > 5 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                  +{savedJob.job_detail.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                      <div className="md:col-span-3 flex flex-col md:items-end justify-between">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleRemoveSavedJob(
                                savedJob.job_detail?.id || savedJob.id
                              )
                            }
                          >
                            <BookmarkX className="h-4 w-4 mr-1" />
                            Unsave
                          </Button>
                        </div>
                        <div className="mt-4">
                          <Button asChild className="w-full md:w-auto">
                            <Link
                              href={`/jobs/${
                                savedJob.job_detail?.id || savedJob.id
                              }`}
                            >
                              View Job
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
