"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authstore";
import { fetchChallengeHistory } from "@/lib/challenge-service";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface ChallengeAttempt {
  id: string;
  challenge_id: string;
  challenge_title: string;
  challenge_topic: string;
  challenge_difficulty: string;
  correct_answers: number;
  total_questions: number;
  points_earned: number;
  time_taken_seconds: number;
  completed_at: string;
}

export default function ChallengeHistoryPage() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.company_id || user?.user_id;

  const {
    data: history,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["challengeHistory"],
    queryFn: fetchChallengeHistory,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getTotalPoints = () => {
    if (!history || history.length === 0) return 0;
    return history.reduce(
      (total: number, attempt: any) => total + attempt.points_earned,
      0
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-6">
        <div className="container flex h-16 items-center mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/jobseeker/challenges">
                <ChevronLeft className="h-4 w-4" />
                Back to Challenges
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Your Challenge History</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-4xl font-bold">
                    {isLoading ? "..." : getTotalPoints()} pts
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Recent Attempts</h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">
                Error loading your challenge history. Please try again.
              </div>
            ) : history && history.length > 0 ? (
              <div className="space-y-4">
                {history.map((attempt: ChallengeAttempt) => (
                  <Card key={attempt.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {attempt.challenge_title}
                          </h3>
                          <div className="text-sm text-muted-foreground mt-1">
                            {attempt.challenge_topic} •{" "}
                            {attempt.challenge_difficulty}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-lg">
                            +{attempt.points_earned} pts
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(attempt.completed_at)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div className="border rounded-md p-3 text-center">
                          <div className="font-medium">
                            {attempt.correct_answers}/{attempt.total_questions}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            Score
                          </div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="font-medium">
                            {Math.round(
                              (attempt.correct_answers /
                                attempt.total_questions) *
                                100
                            )}
                            %
                          </div>
                          <div className="text-muted-foreground mt-1">
                            Percentage
                          </div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="font-medium">
                            {formatTime(attempt.time_taken_seconds)}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            Time Taken
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-md">
                <p className="text-muted-foreground">
                  You haven't taken any challenges yet.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/jobseeker/challenges">
                    Try a Challenge
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
