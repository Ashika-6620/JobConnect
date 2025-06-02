"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/authstore";
import { _axios as api } from "@/lib/axios";
import {
  ArrowUpDown,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Download,
  Eye,
  ListFilter,
  MoreHorizontal,
  Search as SearchIcon,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface JobseekerInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
}

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
  candidateName: string;
  candidateEmail: string;
  avatar: string;
  jobseeker_info: JobseekerInfo;
  resume_url?: string;
  matchScore?: number;
  [key: string]: any;
}

export default function EmployerApplicationsPage() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Application | string;
    direction: "ascending" | "descending";
  }>({ key: "applied_at", direction: "descending" });
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("all");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get("/jobs/applications/");
        if (response.data.success) {
          const fetchedApplications = response.data.data.map((app: any) => ({
            ...app,
            candidateName: `${app.jobseeker_info.first_name} ${app.jobseeker_info.last_name}`,
            candidateEmail: app.jobseeker_info.email,
            avatar: app.jobseeker_info.profile_picture || "/placeholder.svg",
            matchScore:
              app.match_score !== undefined
                ? app.match_score
                : Math.floor(Math.random() * 31) + 70,
          }));
          setApplications(fetchedApplications);
        } else {
          toast.error(response.data.message || "Failed to fetch applications.");
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while fetching applications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const uniqueJobTitles = useMemo(() => {
    if (!applications) return ["all"];
    const titles = new Set(applications.map((app) => app.job_title));
    return ["all", ...Array.from(titles)];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (!applications) return [];

    let result = applications.filter((app) => {
      const statusMatch =
        activeTab === "all" || app.status.toLowerCase() === activeTab;

      const jobTitleFilterMatch =
        selectedJobTitle === "all" || app.job_title === selectedJobTitle;

      const searchTermLower = searchTerm.toLowerCase();
      const candidateNameMatch = app.candidateName
        .toLowerCase()
        .includes(searchTermLower);
      const candidateEmailMatch = app.candidateEmail
        .toLowerCase()
        .includes(searchTermLower);
      const jobTitleSearchMatch = app.job_title
        .toLowerCase()
        .includes(searchTermLower);
      const companyNameSearchMatch = app.company_name
        .toLowerCase()
        .includes(searchTermLower);
      const searchTermMatch =
        searchTerm === "" ||
        candidateNameMatch ||
        candidateEmailMatch ||
        jobTitleSearchMatch ||
        companyNameSearchMatch;

      return statusMatch && jobTitleFilterMatch && searchTermMatch;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === "applied_at") {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
        } else if (typeof valA === "string" && typeof valB === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        } else if (typeof valA === "number" && typeof valB === "number") {
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }

        if (valA < valB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [applications, activeTab, searchTerm, selectedJobTitle, sortConfig]);

  const handleSort = (key: keyof Application | string) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    // Add confirmation for withdraw status
    if (newStatus === "withdrawn") {
      if (
        !confirm(
          "Are you sure you want to withdraw this application? This action cannot be undone."
        )
      ) {
        return;
      }
    }

    // Add confirmation for reject status
    if (newStatus === "rejected") {
      if (
        !confirm(
          "Are you sure you want to reject this application? The candidate will be notified."
        )
      ) {
        return;
      }
    }

    try {
      const response = await api.put(
        `/employer/applications/${applicationId}/update/`,
        { status: newStatus }
      );
      if (response.data.success) {
        toast.success(
          `Application ${
            newStatus === "withdrawn" ? "withdrawn" : "status updated"
          } successfully.`
        );
        setApplications((prevApps) =>
          prevApps.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: newStatus,
                  updated_at: new Date().toISOString(),
                }
              : app
          )
        );
      } else {
        toast.error(
          response.data.message ||
            `Failed to ${
              newStatus === "withdrawn" ? "withdraw" : "update"
            } application.`
        );
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `An error occurred while ${
            newStatus === "withdrawn" ? "withdrawing" : "updating"
          } the application.`
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs">
            Applied
          </Badge>
        );
      case "reviewing":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20 px-2 py-1 text-xs"
          >
            Reviewing
          </Badge>
        );
      case "interview":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20 px-2 py-1 text-xs"
          >
            Interview
          </Badge>
        );
      case "offered":
        return (
          <Badge
            variant="outline"
            className="bg-teal-500/10 text-teal-600 border-teal-500/20 hover:bg-teal-500/20 px-2 py-1 text-xs"
          >
            Offered
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 px-2 py-1 text-xs"
          >
            Rejected
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20 px-2 py-1 text-xs"
          >
            Accepted
          </Badge>
        );
      case "withdrawn":
        return (
          <Badge
            variant="outline"
            className="bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20 px-2 py-1 text-xs"
          >
            Withdrawn
          </Badge>
        );
      case "new":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs">
            New
          </Badge>
        );
      case "shortlisted":
        return (
          <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 text-xs">
            Shortlisted
          </Badge>
        );
      case "hired":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 text-xs">
            Hired
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="px-2 py-1 text-xs">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Job Applications</h1>
            <p className="text-muted-foreground">
              Manage and review applications for your job postings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("reviewing")}
              className={
                activeTab === "reviewing"
                  ? "bg-yellow-50 border-yellow-200"
                  : ""
              }
            >
              <Check className="mr-2 h-4 w-4" />
              Reviewing (
              {applications.filter((app) => app.status === "reviewing").length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("interview")}
              className={
                activeTab === "interview"
                  ? "bg-purple-50 border-purple-200"
                  : ""
              }
            >
              <Calendar className="mr-2 h-4 w-4" />
              Interviews (
              {applications.filter((app) => app.status === "interview").length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("offered")}
              className={
                activeTab === "offered" ? "bg-teal-50 border-teal-200" : ""
              }
            >
              <Star className="mr-2 h-4 w-4" />
              Offers (
              {applications.filter((app) => app.status === "offered").length})
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="applied">Applied</TabsTrigger>
                  <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
                  <TabsTrigger value="interview">Interview</TabsTrigger>
                  <TabsTrigger value="offered">Offered</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, job..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-[250px] md:w-[300px]"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ListFilter className="h-4 w-4" />
                      <span>
                        Job:{" "}
                        {selectedJobTitle === "all"
                          ? "All Jobs"
                          : selectedJobTitle}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Job Title</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {uniqueJobTitles.map((title) => (
                      <DropdownMenuItem
                        key={title}
                        onSelect={() => setSelectedJobTitle(title)}
                      >
                        {title === "all" ? "All Jobs" : title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 border-l-blue-300 border-r-blue-300 rounded-full animate-spin"></div>
                <p className="mt-4 text-lg font-semibold text-gray-700">
                  Loading applications...
                </p>
                <p className="text-sm text-gray-500">
                  Please wait while we fetch your data
                </p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Briefcase className="h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-700">
                  No applications found
                </h3>
                <p className="mt-2 text-center max-w-md text-gray-500">
                  {searchTerm ||
                  selectedJobTitle !== "all" ||
                  activeTab !== "all"
                    ? "Try adjusting your search or filter criteria to find what you're looking for."
                    : "There are currently no applications in your system. When candidates apply to your jobs, they will appear here."}
                </p>
                {(searchTerm ||
                  selectedJobTitle !== "all" ||
                  activeTab !== "all") && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedJobTitle("all");
                      setActiveTab("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("candidateName")}
                      >
                        Candidate
                        {sortConfig.key === "candidateName" && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("applied_at")}
                      >
                        Applied
                        {sortConfig.key === "applied_at" && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("matchScore")}
                      >
                        Match
                        {sortConfig.key === "matchScore" && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow
                      key={app.id}
                      className="bg-background hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={app.avatar || "/placeholder.svg"}
                              alt={app.candidateName}
                            />
                            <AvatarFallback>
                              {app.candidateName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {app.candidateName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {app.candidateEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{app.job_title}</div>
                        <div className="text-xs text-muted-foreground">
                          {app.company_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {new Date(app.applied_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {app.matchScore !== undefined &&
                          app.matchScore !== null ? (
                            <>
                              <Star
                                className={`h-4 w-4 ${
                                  app.matchScore >= 90
                                    ? "fill-amber-400 text-amber-400"
                                    : app.matchScore >= 80
                                    ? "fill-amber-300 text-amber-300"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <span>{app.matchScore}%</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() =>
                              toast.info(
                                "View details functionality coming soon!"
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {app.resume_url && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() =>
                                window.open(app.resume_url, "_blank")
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  toast.info(
                                    "View profile functionality coming soon!"
                                  )
                                }
                              >
                                View Profile
                              </DropdownMenuItem>
                              {app.resume_url && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(app.resume_url, "_blank")
                                  }
                                >
                                  Download Resume
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {app.status !== "reviewing" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(app.id, "reviewing")
                                  }
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Mark as Reviewing
                                </DropdownMenuItem>
                              )}
                              {app.status !== "interview" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(app.id, "interview")
                                  }
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Move to Interview
                                </DropdownMenuItem>
                              )}
                              {app.status !== "offered" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(app.id, "offered")
                                  }
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  Make Offer
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {app.status !== "rejected" && (
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                  onClick={() =>
                                    handleStatusUpdate(app.id, "rejected")
                                  }
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject Application
                                </DropdownMenuItem>
                              )}
                              {app.status !== "withdrawn" && (
                                <DropdownMenuItem
                                  className="text-slate-600 focus:text-slate-700 focus:bg-slate-50"
                                  onClick={() =>
                                    handleStatusUpdate(app.id, "withdrawn")
                                  }
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Withdraw Application
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
