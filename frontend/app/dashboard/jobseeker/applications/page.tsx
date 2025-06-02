"use client";

import { JobseekerSidebar } from "@/components/jobseeker-sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface JobApplication {
  id: number;
  job_id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  job_detail: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    experience_level: string;
    salary_range: string;
    remote: boolean;
    skills: string[];
    created_at: string;
  };
}

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800",
  reviewing: "bg-yellow-100 text-yellow-800",
  interview: "bg-purple-100 text-purple-800",
  offered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-emerald-100 text-emerald-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobApplications"],
    queryFn: async () => {
      const response = await _axios.get("/jobs/applications/");
      return response.data;
    },
  });

  const withdrawApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return await _axios.put(`/jobs/applications/${applicationId}/`, {
        status: "withdrawn",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      toast.success("Application withdrawn successfully");
      setIsWithdrawDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to withdraw application");
      setIsWithdrawDialogOpen(false);
    },
  });

  const handleWithdrawApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsWithdrawDialogOpen(true);
  };

  const confirmWithdraw = () => {
    if (selectedApplication) {
      withdrawApplicationMutation.mutate(selectedApplication.id);
    }
  };

  const allApplications = data?.data || [];

  // Filter applications based on active status and search term
  const applications = allApplications.filter((app: JobApplication) => {
    const matchesStatus = !activeStatus || app.status === activeStatus;
    const matchesSearch =
      !searchTerm ||
      app.job_detail.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_detail.company_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Count applications by status for the status cards
  const statusCounts = {
    applied: allApplications.filter(
      (app: JobApplication) => app.status === "applied"
    ).length,
    reviewing: allApplications.filter(
      (app: JobApplication) => app.status === "reviewing"
    ).length,
    interview: allApplications.filter(
      (app: JobApplication) => app.status === "interview"
    ).length,
    offered: allApplications.filter(
      (app: JobApplication) => app.status === "offered"
    ).length,
    accepted: allApplications.filter(
      (app: JobApplication) => app.status === "accepted"
    ).length,
    rejected: allApplications.filter(
      (app: JobApplication) => app.status === "rejected"
    ).length,
    withdrawn: allApplications.filter(
      (app: JobApplication) => app.status === "withdrawn"
    ).length,
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 border-l-blue-300 border-r-blue-300 rounded-full animate-spin"></div>
          <p className="ml-4 text-lg font-semibold">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container">
        <div className="flex justify-center items-center h-64">
          <p>Failed to load applications. Please try again.</p>
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
              <h1 className="text-xl font-bold">Job Applications</h1>
              <p className="text-muted-foreground">
                Track the status of your job applications
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="pl-9 pr-4 py-2 border rounded-md w-60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            <div
              className={`p-3 rounded-lg shadow border cursor-pointer flex items-center gap-3
                ${
                  !activeStatus
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              onClick={() => setActiveStatus(null)}
            >
              <div className="p-2 bg-blue-100 rounded-full">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium">All</div>
                <div className="text-xl font-bold">
                  {allApplications.length}
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg shadow border cursor-pointer flex items-center gap-3
                ${
                  activeStatus === "applied"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              onClick={() => setActiveStatus("applied")}
            >
              <div className="p-2 bg-blue-100 rounded-full">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Applied</div>
                <div className="text-xl font-bold">{statusCounts.applied}</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg shadow border cursor-pointer flex items-center gap-3
                ${
                  activeStatus === "reviewing"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              onClick={() => setActiveStatus("reviewing")}
            >
              <div className="p-2 bg-yellow-100 rounded-full">
                <Search className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Reviewing</div>
                <div className="text-xl font-bold">
                  {statusCounts.reviewing}
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg shadow border cursor-pointer flex items-center gap-3
                ${
                  activeStatus === "interview"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              onClick={() => setActiveStatus("interview")}
            >
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Interview</div>
                <div className="text-xl font-bold">
                  {statusCounts.interview}
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg shadow border cursor-pointer flex items-center gap-3
                ${
                  activeStatus === "offered"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              onClick={() => setActiveStatus("offered")}
            >
              <div className="p-2 bg-green-100 rounded-full">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Offered</div>
                <div className="text-xl font-bold">{statusCounts.offered}</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg shadow border cursor-pointer flex items-center gap-3
                ${
                  activeStatus === "rejected"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              onClick={() => setActiveStatus("rejected")}
            >
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Rejected</div>
                <div className="text-xl font-bold">{statusCounts.rejected}</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg shadow border cursor-pointer flex items-center gap-3
                ${
                  activeStatus === "withdrawn"
                    ? "border-gray-500 bg-gray-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              onClick={() => setActiveStatus("withdrawn")}
            >
              <div className="p-2 bg-gray-100 rounded-full">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Withdrawn</div>
                <div className="text-xl font-bold">
                  {statusCounts.withdrawn}
                </div>
              </div>
            </div>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">
                  {allApplications.length > 0
                    ? "No matching applications"
                    : "No applications yet"}
                </CardTitle>
                <CardDescription className="text-center mb-4">
                  {allApplications.length > 0
                    ? "Try adjusting your search or filters to see more applications."
                    : "When you apply for jobs, they will appear here so you can track their status."}
                </CardDescription>
                {allApplications.length > 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveStatus(null);
                      setSearchTerm("");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application: JobApplication) => (
                <Card key={application.id}>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                      <div className="md:col-span-9 space-y-2">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <Link
                                href={`/jobs/${application.job_id}`}
                                className="text-lg font-semibold hover:text-primary hover:underline"
                              >
                                {application.job_detail?.title || "Job Title"}
                              </Link>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  statusColors[application.status] ||
                                  "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {application.status.charAt(0).toUpperCase() +
                                  application.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-muted-foreground">
                              {application.job_detail?.company_name ||
                                "Company Name"}
                            </p>

                            {/* Status Timeline */}
                            <div className="mt-3 flex items-center max-w-md">
                              <div
                                className={`h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex`}
                              >
                                <div
                                  className={`h-full ${
                                    application.status === "applied"
                                      ? "w-1/6 bg-blue-500"
                                      : application.status === "reviewing"
                                      ? "w-2/6 bg-yellow-500"
                                      : application.status === "interview"
                                      ? "w-3/6 bg-purple-500"
                                      : application.status === "offered"
                                      ? "w-4/6 bg-teal-500"
                                      : application.status === "accepted"
                                      ? "w-5/6 bg-green-500"
                                      : application.status === "rejected"
                                      ? "w-full bg-red-500"
                                      : application.status === "withdrawn"
                                      ? "w-full bg-gray-500"
                                      : "w-0"
                                  }`}
                                ></div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {application.job_detail?.job_type && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {application.job_detail.job_type}
                                </span>
                              )}
                              {application.job_detail?.experience_level && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {application.job_detail.experience_level}
                                </span>
                              )}
                              {application.job_detail?.remote && (
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
                            {application.job_detail?.location ||
                              "Location not specified"}
                          </div>
                          {application.job_detail?.salary_range && (
                            <div className="flex items-center">
                              <Briefcase className="mr-1 h-4 w-4" />
                              {application.job_detail.salary_range}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            Applied{" "}
                            {formatDistanceToNow(
                              parseISO(application.applied_at),
                              {
                                addSuffix: true,
                              }
                            )}
                          </div>
                          {application.applied_at !==
                            application.updated_at && (
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              Updated{" "}
                              {formatDistanceToNow(
                                parseISO(application.updated_at),
                                { addSuffix: true }
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-3 flex flex-col md:items-end justify-between">
                        <div className="flex gap-2 flex-wrap">
                          {application.status !== "withdrawn" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleWithdrawApplication(application)
                              }
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Withdraw
                            </Button>
                          )}
                          {application.status === "offered" && (
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() =>
                                toast.info("This feature is coming soon!")
                              }
                            >
                              Accept Offer
                            </Button>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button asChild className="w-full md:w-auto">
                            <Link href={`/jobs/${application.job_id}`}>
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

          <AlertDialog
            open={isWithdrawDialogOpen}
            onOpenChange={setIsWithdrawDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">
                  Withdraw Application
                </AlertDialogTitle>
                <AlertDialogDescription className="py-4">
                  Are you sure you want to withdraw your application for{" "}
                  <strong className="text-foreground">
                    {selectedApplication?.job_detail?.title}
                  </strong>{" "}
                  at{" "}
                  <strong className="text-foreground">
                    {selectedApplication?.job_detail?.company_name}
                  </strong>
                  ?
                  <br />
                  <br />
                  This action cannot be undone. You will need to apply again if
                  you change your mind.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmWithdraw}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Withdraw Application
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
