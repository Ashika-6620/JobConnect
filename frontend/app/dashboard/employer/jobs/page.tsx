"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { _axios } from "@/lib/axios";
import { useEditStore } from "@/lib/editstore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
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
}

interface JobsResponse {
  success: boolean;
  data: {
    jobs: Job[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "expired">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<JobsResponse>({
    queryKey: ["jobListings", currentPage, perPage, searchTerm, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("per_page", perPage.toString());

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const res = await _axios.get(`/employer/jobs/?${params.toString()}`);
      return res.data;
    },
  });

  const handleDeleteJob = async (jobId: string) => {
    try {
      await _axios.delete(`/jobs/${jobId}/`);
      toast.success("Job deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const calculateExpiryStatus = (createdAt: string) => {
    const creationDate = parseISO(createdAt);
    const expiryDate = new Date(creationDate);
    expiryDate.setDate(expiryDate.getDate() + 45);

    const now = new Date();
    const daysLeft = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (daysLeft <= 0) {
      return { status: "expired", expiryText: "Expired" };
    } else if (daysLeft <= 7) {
      return { status: "expires-soon", expiryText: `${daysLeft} days left` };
    } else {
      return { status: "active", expiryText: `${daysLeft} days left` };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            Active
          </Badge>
        );
      case "expires-soon":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-500 border-amber-500/20"
          >
            Expires Soon
          </Badge>
        );
      case "expired":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20"
          >
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatJobType = (jobType: string) => {
    return jobType
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const renderPagination = () => {
    if (!data?.data.pagination) return null;

    const { current_page, total_pages } = data.data.pagination;

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={current_page <= 1}
            />
          </PaginationItem>

          {Array.from({ length: total_pages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === current_page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, total_pages))
              }
              disabled={current_page >= total_pages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const setJob = useEditStore((state: any) => state.setJob);

  React.useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["jobListings"] });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your posted jobs
          </p>
        </div>
        <Link href="/dashboard/employer/post-job">
          <Button className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Post New Job
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by job title, location..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-0"></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-red-500">Error loading jobs</p>
            </div>
          ) : !data || data.data.jobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No jobs found matching your criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data.data.jobs.map((job) => {
                  const { status, expiryText } = calculateExpiryStatus(
                    job.created_at
                  );
                  const formattedDate = formatDistanceToNow(
                    parseISO(job.created_at),
                    { addSuffix: true }
                  );

                  return (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{job.title}</h3>
                            {getStatusBadge(status)}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              {formatJobType(job.job_type)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              Posted {formattedDate}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              {expiryText}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-semibold">0</div>
                            <div className="text-xs text-muted-foreground">
                              Applicants
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-semibold">0</div>
                            <div className="text-xs text-muted-foreground">
                              Views
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link href={`/jobs/${job.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <Link href={`/jobs/${job.id}`}>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                  </DropdownMenuItem>
                                </Link>
                                <Link
                                  href={`/dashboard/employer/edit-job/${job.id}`}
                                  onClick={() => setJob(job)}
                                  passHref
                                >
                                  <DropdownMenuItem asChild>
                                    <span
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </span>
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteJob(job.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
