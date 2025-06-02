"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  ArrowRight,
  Building,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Search,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [location, setLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, error } = useQuery<JobsResponse>({
    queryKey: [
      "jobs",
      currentPage,
      perPage,
      searchQuery,
      jobType,
      experienceLevel,
      location,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("per_page", perPage.toString());

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (jobType) {
        params.append("job_type", jobType);
      }

      if (experienceLevel) {
        params.append("experience_level", experienceLevel);
      }

      if (location) {
        params.append("location", location);
      }

      const response = await _axios.get(`/jobs/?${params.toString()}`);
      return response.data;
    },
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const formatJobType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-");
  };

  const renderPagination = () => {
    if (!data?.data.pagination) return null;

    const { current_page, total_pages } = data.data.pagination;

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={current_page <= 1}
            />
          </PaginationItem>

          {Array.from({ length: Math.min(total_pages, 5) }, (_, i) => {
            let pageToShow = i + 1;
            if (total_pages > 5) {
              if (current_page <= 3) {
                pageToShow = i + 1;
              } else if (current_page >= total_pages - 2) {
                pageToShow = total_pages - 4 + i;
              } else {
                pageToShow = current_page - 2 + i;
              }
            }

            return (
              <PaginationItem key={pageToShow}>
                <PaginationLink
                  isActive={pageToShow === current_page}
                  onClick={() => setCurrentPage(pageToShow)}
                >
                  {pageToShow}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, total_pages))
              }
              disabled={current_page >= total_pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container px-4 md:px-6 py-8 mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="grid gap-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              Find Your Dream Job
            </h1>
            <p className="text-gray-500 md:text-xl dark:text-gray-400">
              Browse jobs from top employers and start your career journey.
            </p>
          </div>

          <div className="grid gap-4">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-4 md:gap-6"
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Job title or keywords"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={experienceLevel}
                onValueChange={setExperienceLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </form>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Filters</h3>
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => {
                        setJobType("");
                        setExperienceLevel("");
                        setLocation("");
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Location</h4>
                      <Input
                        placeholder="City, state, or remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Job Type</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "full-time",
                          "part-time",
                          "contract",
                          "internship",
                        ].map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={type}
                              checked={jobType === type}
                              onChange={() =>
                                setJobType(jobType === type ? "" : type)
                              }
                              className="form-checkbox h-4 w-4"
                            />
                            <label htmlFor={type} className="text-sm">
                              {formatJobType(type)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Experience Level</h4>
                      <div className="grid gap-2">
                        {["entry", "intermediate", "senior", "executive"].map(
                          (level) => (
                            <div
                              key={level}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={level}
                                checked={experienceLevel === level}
                                onChange={() =>
                                  setExperienceLevel(
                                    experienceLevel === level ? "" : level
                                  )
                                }
                                className="form-checkbox h-4 w-4"
                              />
                              <label htmlFor={level} className="text-sm">
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <Button className="w-full">Apply Filters</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-9 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {data?.data.pagination.total || 0} Jobs Found
                </h2>
                <p className="text-sm text-gray-500">
                  Browse jobs that match your experience and career goals
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">Error loading jobs</p>
              </div>
            ) : !data?.data.jobs || data.data.jobs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  No jobs found matching your criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {data.data.jobs.map((job) => {
                    const formattedDate = formatDistanceToNow(
                      parseISO(job.created_at),
                      { addSuffix: true }
                    );

                    return (
                      <Card key={job.id} className="relative overflow-hidden">
                        {job.featured && (
                          <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-0.5">
                            Featured
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">
                                  <Link
                                    href={`/jobs/${job.id}`}
                                    className="hover:text-blue-600 transition-colors"
                                  >
                                    {job.title}
                                  </Link>
                                </h3>
                                {job.remote && (
                                  <Badge variant="outline" className="ml-2">
                                    Remote
                                  </Badge>
                                )}
                                {job.urgent && (
                                  <Badge className="bg-red-500 text-white border-transparent">
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Building className="mr-1 h-4 w-4" />
                                  {job.company_name}
                                </div>
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
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {job.skills.slice(0, 4).map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 4 && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0"
                                  >
                                    +{job.skills.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4 md:mt-0">
                              <p className="font-semibold whitespace-nowrap">
                                {job.salary_range}
                              </p>
                              <div className="flex gap-2">
                                <Link href={`/jobs/${job.id}`}>
                                  <Button
                                    size="sm"
                                    className="flex gap-1 items-center"
                                  >
                                    View Job <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
