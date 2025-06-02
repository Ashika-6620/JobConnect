"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  GraduationCap,
  Mail,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

interface Skill {
  name: string;
  level: string;
}

interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

interface Jobseeker {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  skills: Skill[];
  skills_count: number;
  latest_experience: Experience | null;
  latest_education: Education | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  profile_completeness: number;
}

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const { data, isLoading, error } = useQuery<{
    success: boolean;
    data: Jobseeker[];
  }>({
    queryKey: ["jobseekers"],
    queryFn: async () => {
      const response = await _axios.get("/jobseekers");
      return response.data;
    },
  });

  const jobseekers = data?.data || [];

  const filteredJobseekers = jobseekers.filter((jobseeker) => {
    const nameMatch = `${jobseeker.first_name} ${jobseeker.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const locationMatch =
      !locationFilter ||
      (jobseeker.location &&
        jobseeker.location
          .toLowerCase()
          .includes(locationFilter.toLowerCase()));

    const skillMatch =
      !skillFilter ||
      (jobseeker.skills &&
        jobseeker.skills.some((skill) =>
          skill.name.toLowerCase().includes(skillFilter.toLowerCase())
        ));

    return nameMatch && locationMatch && skillMatch;
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Find Talented Candidates
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse through our pool of qualified job seekers
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-4 md:flex-row"
          >
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by candidate name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-[200px]">
              <Input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Input
                type="text"
                placeholder="Filter by skill..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">
            Error loading candidates. Please try again later.
          </p>
        </div>
      ) : filteredJobseekers.length === 0 ? (
        <div className="text-center py-10">
          <UserRound className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No candidates found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobseekers.map((jobseeker) => (
            <Card
              key={jobseeker.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={jobseeker.profile_picture || undefined}
                        alt={`${jobseeker.first_name} ${jobseeker.last_name}`}
                      />
                      <AvatarFallback>
                        {getInitials(jobseeker.first_name, jobseeker.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {jobseeker.first_name} {jobseeker.last_name}
                          </h3>
                          {jobseeker.latest_experience && (
                            <div className="flex items-center text-muted-foreground">
                              <Briefcase className="mr-1 h-3 w-3" />
                              <span>
                                {jobseeker.latest_experience.title} at{" "}
                                {jobseeker.latest_experience.company}
                              </span>
                            </div>
                          )}
                          {jobseeker.latest_education && (
                            <div className="flex items-center text-muted-foreground">
                              <GraduationCap className="mr-1 h-3 w-3" />
                              <span>
                                {jobseeker.latest_education.degree} in{" "}
                                {jobseeker.latest_education.field},{" "}
                                {jobseeker.latest_education.institution}
                              </span>
                            </div>
                          )}
                          {jobseeker.location && (
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>{jobseeker.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/profile/${jobseeker.user_id}`}>
                            <Button variant="secondary" size="sm">
                              View Profile{" "}
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                          <a href={`mailto:${jobseeker.email}`}>
                            <Button variant="outline" size="sm">
                              <Mail className="mr-1 h-4 w-4" /> Email
                            </Button>
                          </a>
                        </div>
                      </div>

                      {jobseeker.bio && (
                        <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {jobseeker.bio}
                        </div>
                      )}

                      {jobseeker.skills && jobseeker.skills.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground mb-1">
                            Skills:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {jobseeker.skills
                              .slice(0, 5)
                              .map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {skill.name}
                                </Badge>
                              ))}
                            {jobseeker.skills_count > 5 && (
                              <Badge variant="outline">
                                +{jobseeker.skills_count - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredJobseekers.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>
                  <ChevronRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
