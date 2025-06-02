"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownAZ,
  BookmarkPlus,
  Download,
  Eye,
  FileText,
  Filter,
  Mail,
  Phone,
  Search,
  Star,
  StarHalf,
  User,
} from "lucide-react";
import { useState } from "react";

// Mock candidate data
const mockCandidates = [
  {
    id: "1",
    name: "David Wilson",
    role: "Senior Frontend Developer",
    location: "San Francisco, CA",
    email: "david.wilson@example.com",
    phone: "+1 (555) 123-4567",
    experience: "8 years",
    education: "B.S. Computer Science, Stanford University",
    skills: ["React", "TypeScript", "Next.js", "Node.js", "GraphQL"],
    match: 98,
    status: "new",
    applied: "2 days ago",
    avatar: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Sophia Lee",
    role: "UX/UI Designer",
    location: "New York, NY",
    email: "sophia.lee@example.com",
    phone: "+1 (555) 987-6543",
    experience: "5 years",
    education: "B.F.A. Design, Rhode Island School of Design",
    skills: ["Figma", "Adobe XD", "UI/UX", "Prototyping", "User Research"],
    match: 95,
    status: "shortlisted",
    applied: "1 week ago",
    avatar: "/placeholder.svg",
  },
  {
    id: "3",
    name: "James Thompson",
    role: "Full Stack Developer",
    location: "Austin, TX",
    email: "james.thompson@example.com",
    phone: "+1 (555) 456-7890",
    experience: "6 years",
    education: "M.S. Computer Engineering, UT Austin",
    skills: ["React", "Node.js", "MongoDB", "Express", "AWS"],
    match: 92,
    status: "interview",
    applied: "5 days ago",
    avatar: "/placeholder.svg",
  },
  {
    id: "4",
    name: "Emma Johnson",
    role: "Product Manager",
    location: "Seattle, WA",
    email: "emma.johnson@example.com",
    phone: "+1 (555) 789-0123",
    experience: "7 years",
    education: "MBA, University of Washington",
    skills: [
      "Product Strategy",
      "User Stories",
      "Agile",
      "Roadmapping",
      "Data Analysis",
    ],
    match: 90,
    status: "hired",
    applied: "3 weeks ago",
    avatar: "/placeholder.svg",
  },
  {
    id: "5",
    name: "Michael Chen",
    role: "Backend Developer",
    location: "Boston, MA",
    email: "michael.chen@example.com",
    phone: "+1 (555) 234-5678",
    experience: "4 years",
    education: "B.S. Computer Science, MIT",
    skills: ["Java", "Spring Boot", "PostgreSQL", "Microservices", "Docker"],
    match: 88,
    status: "rejected",
    applied: "2 weeks ago",
    avatar: "/placeholder.svg",
  },
];

export default function CandidatesPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter candidates based on active tab and search term
  const filteredCandidates = mockCandidates.filter((candidate) => {
    // Filter by status
    if (activeTab !== "all" && candidate.status !== activeTab) {
      return false;
    }

    // Filter by search term
    if (
      searchTerm &&
      !candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !candidate.role.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">New</Badge>;
      case "shortlisted":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-500 border-purple-500/20"
          >
            Shortlisted
          </Badge>
        );
      case "interview":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-500 border-amber-500/20"
          >
            Interview
          </Badge>
        );
      case "hired":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            Hired
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20"
          >
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">
            Browse and manage job candidates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Advanced Search
          </Button>
          <Button variant="outline">
            <ArrowDownAZ className="mr-2 h-4 w-4" /> Sort
          </Button>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search candidates by name, role, or skills..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="hired">Hired</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No candidates found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage
                            src={candidate.avatar}
                            alt={candidate.name}
                          />
                          <AvatarFallback>
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{candidate.name}</h3>
                            {getStatusBadge(candidate.status)}
                          </div>
                          <p className="text-muted-foreground">
                            {candidate.role}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{candidate.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Applied {candidate.applied}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center text-amber-500">
                            <Star className="fill-amber-500 h-5 w-5" />
                            <Star className="fill-amber-500 h-5 w-5" />
                            <Star className="fill-amber-500 h-5 w-5" />
                            <Star className="fill-amber-500 h-5 w-5" />
                            {candidate.match >= 90 ? (
                              <Star className="fill-amber-500 h-5 w-5" />
                            ) : (
                              <StarHalf className="fill-amber-500 h-5 w-5" />
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {candidate.match}% Match
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-10 w-10"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-10 w-10"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-10 w-10"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-10 w-10"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="default">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download Resume
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BookmarkPlus className="mr-2 h-4 w-4" />
                                Add to Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Schedule Interview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Send Assessment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
