"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/authstore";
import { fetchChallenges } from "@/lib/challenge-service";
import { useQuery } from "@tanstack/react-query";
import { Badge, ChevronLeft, Filter, Loader2, Search } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Challenge {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  solved_count: number;
  question_count: number;
}

export default function ChallengesPage() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.company_id || user?.user_id;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");

  const {
    data: challenges,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["challenges"],
    queryFn: fetchChallenges,
  });

  const filteredChallenges = challenges?.filter((challenge: Challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.topic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = currentTab === "all" || challenge.topic === currentTab;

    return matchesSearch && matchesTab;
  });

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-6">
        <div className="container flex h-16 items-center justify-between mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/jobseeker">
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tests..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Error loading challenges. Please try again.
            </div>
          ) : (
            <Tabs
              defaultValue="all"
              value={currentTab}
              onValueChange={handleTabChange}
              className="mb-8"
            >
              <TabsList>
                <TabsTrigger value="all">All Topics</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
                <TabsTrigger value="go">Go</TabsTrigger>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                <TabsTrigger value="ai">AI</TabsTrigger>
              </TabsList>

              <TabsContent value={currentTab} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges && filteredChallenges.length > 0 ? (
                    filteredChallenges.map((challenge: Challenge) => (
                      <TestCard key={challenge.id} test={challenge} />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10">
                      No challenges found for this topic.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}

function TestCard({ test }: { test: Challenge }) {
  const router = useRouter();

  const difficultyColor: Record<string, string> = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{test.title}</CardTitle>
          <Badge className={difficultyColor[test.difficulty]}>
            {test.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Topic: {test.topic}</span>
            <span>{test.question_count} questions</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <span>{test.solved_count} users solved</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            router.push(`/dashboard/jobseeker/test/${test.id}`);
          }}
        >
          Take Test
        </Button>
      </CardFooter>
    </Card>
  );
}
