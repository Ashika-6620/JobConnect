"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/authstore";
import { _axios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Bookmark,
  Briefcase,
  Building2,
  Edit,
  MapPin,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_range: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string[];
  remote: boolean;
  urgent: boolean;
  featured: boolean;
  employer_id: number;
  company_name: string;
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
  is_applied?: boolean;
  application_status?: string;
}

interface ApiResponse {
  success: boolean;
  data: Job;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null
  );
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["jobDetail", id],
    queryFn: async () => {
      const response = await _axios.get(`/jobs/${id}/`);
      return response.data;
    },
  });

  useEffect(() => {
    if (data?.data) {
      setIsSaved(data.data.is_saved || false);
      setIsApplied(data.data.is_applied || false);
      setApplicationStatus(data.data.application_status || null);
    }
  }, [data]);

  const saveJobMutation = useMutation({
    mutationFn: async () => {
      return await _axios.post("/jobs/saved/", { job_id: id });
    },
    onSuccess: (response) => {
      setIsSaved(response.data.saved);
      queryClient.invalidateQueries({ queryKey: ["jobDetail", id] });

      toast(
        response.data.saved
          ? "Job saved successfully"
          : "Job removed from saved jobs",
        {
          description: response.data.saved
            ? "You can view it in your saved jobs"
            : "You can add it back anytime",
          duration: 3000,
        }
      );
    },
    onError: () => {
      toast.error("Failed to save job", {
        description: "Please try again later",
        duration: 3000,
      });
    },
  });

  const applyJobMutation = useMutation({
    mutationFn: async () => {
      return await _axios.post("/jobs/applications/", { job_id: id });
    },
    onSuccess: () => {
      setIsApplied(true);
      queryClient.invalidateQueries({ queryKey: ["jobDetail", id] });

      toast("Application submitted!", {
        description: "The employer will be notified of your application",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to submit application";
      toast.error(message, {
        description: "Please try again later",
        duration: 3000,
      });
    },
  });

  const job = data?.data;
  const isEmployer = user?.role === "employer";
  const isJobOwner = isEmployer && job?.employer_id === user?.company_id;
  const formattedDate = job?.created_at
    ? formatDistanceToNow(parseISO(job.created_at), { addSuffix: true })
    : "Recently";

  const handleSaveJob = () => {
    if (!user) {
      toast("Please login to save jobs", {
        description: "Create an account or login to save jobs",
        duration: 3000,
      });
      router.push("/login");
      return;
    }

    if (isEmployer && !isJobOwner) {
      saveJobMutation.mutate();
    } else if (!isEmployer) {
      saveJobMutation.mutate();
    }
  };

  const handleApplyJob = () => {
    if (!user) {
      toast("Please login to apply for jobs", {
        description: "Create an account or login to apply for jobs",
        duration: 3000,
      });
      router.push("/login");
      return;
    }

    if (user?.role === "employer") {
      toast("Employers cannot apply for jobs", {
        description: "Please login as a jobseeker to apply",
        duration: 3000,
      });
      return;
    }

    applyJobMutation.mutate();
  };

  const handleEditJob = () => {
    router.push(`/dashboard/employer/edit-job/${id}`);
  };

  const handleShareJob = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link copied to clipboard", {
      description: "You can now share this job with others",
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">Job not found</h2>
          <p>The job you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/jobs"
            className="text-green-600 hover:text-green-700 mt-4 inline-block"
          >
            Browse all jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/jobs" className="text-green-600 hover:text-green-700">
            ← Back to Jobs
          </Link>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
                  <p className="text-gray-600 mb-2">
                    {job.company_name} · {formattedDate}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {job.job_type}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {job.experience_level}
                    </span>
                    {job.remote && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Remote
                      </span>
                    )}
                    {job.urgent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {isJobOwner ? (
                  <Button
                    onClick={handleEditJob}
                    className="w-full md:w-auto"
                    variant="outline"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Job
                  </Button>
                ) : (
                  <Button
                    onClick={handleApplyJob}
                    disabled={isApplied || isEmployer}
                    className="w-full md:w-auto"
                  >
                    {isApplied ? applicationStatus || "Applied" : "Apply Now"}
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSaveJob}
                    disabled={isJobOwner}
                    className={isSaved ? "text-green-600" : ""}
                    title={isJobOwner ? "Cannot save your own job" : "Save job"}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShareJob}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs defaultValue="description">
              <TabsList className="mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Job Description
                  </h2>
                  <p className="text-gray-700 mb-4">{job.description}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Responsibilities
                  </h2>
                  <div
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html:
                        job.responsibilities?.replace(/\n/g, "<br/>") || "",
                    }}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                  <div
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: job.requirements?.replace(/\n/g, "<br/>") || "",
                    }}
                  />
                </div>

                {job.benefits && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                    <div
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: job.benefits?.replace(/\n/g, "<br/>") || "",
                      }}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="company">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      About {job.company_name}
                    </h2>
                    <p className="text-gray-700">
                      Company information not available.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Job Summary</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Job Type</p>
                      <p className="text-gray-600">{job.job_type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">
                        {job.location}
                        {job.remote && " (Remote available)"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills &&
                    job.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Application Tips</h2>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Highlight your relevant experience and skills that match the
                    job requirements.
                  </p>
                  <p className="text-sm text-gray-600">
                    Include specific achievements and measurable results from
                    your previous roles.
                  </p>
                  <p className="text-sm text-gray-600">
                    Research the company before applying to customize your
                    application.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
