"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/authstore";
import { fetchLeaderboard, LeaderboardUser } from "@/lib/leaderboard-service";
import { Award, ChevronUp, Info, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("alltime");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const [userRank, setUserRank] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [userProfileScore, setUserProfileScore] = useState<number | null>(null);

  useEffect(() => {
    console.log("User:", user);
    if (!user || !user.company_id) {
      setLeaderboard([]);
      setUserRank(null);
      setUserPoints(null);
      setUserProfileScore(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchLeaderboard(user.company_id).then((data) => {
      setLeaderboard(data.leaderboard);
      setLoading(false);
      if (data.user_rank) {
        setUserRank(data.user_rank);
        const idx = data.leaderboard.findIndex(
          (u: any) => String(u.company_id) === String(user.company_id)
        );
        if (idx !== -1) {
          setUserPoints(data.leaderboard[idx].total_points);
          setUserProfileScore(data.leaderboard[idx].profile_completeness);
        }
      } else {
        setUserRank(null);
        setUserPoints(null);
        setUserProfileScore(null);
      }
    });
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Candidate Leaderboard</h1>
          <p className="text-gray-600">
            See how you rank among other job seekers and improve your profile
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-6 flex items-center">
              <div className="bg-amber-200 p-3 rounded-full mr-4">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-amber-800 font-medium">Your Rank</p>
                <h3 className="text-2xl font-bold text-amber-900">
                  {userRank ? `#${userRank}` : "-"}
                </h3>
                {userRank && userRank <= 3 && (
                  <div className="flex items-center text-amber-700 text-sm">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>Top performer</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">Profile Score</p>
                <h3 className="text-2xl font-bold">
                  {userProfileScore ?? "-"}/100
                </h3>
                <Progress
                  value={userProfileScore ?? 0}
                  className="h-2 w-32 mt-1"
                />
                <div className="mt-2 text-blue-700 font-semibold">
                  Points: {userPoints ?? "-"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Candidates</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Rankings are based on profile completeness, activity, and
                    engagement with employers. Improve your rank by completing
                    your profile and applying to relevant jobs.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading leaderboard...</div>
            ) : (
              <LeaderboardTable leaderboard={leaderboard} />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            How to Improve Your Ranking
          </h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start gap-2">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>
                Complete your profile with detailed work experience and skills
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>
                Upload a professional profile photo and create an ATS-friendly
                resume
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>Apply to jobs that match your skills and experience</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>
                Engage with the platform regularly and respond to employer
                messages promptly
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function LeaderboardTable({ leaderboard }: { leaderboard: LeaderboardUser[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-gray-500">
              Rank
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">
              Candidate
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">
              Profile Score
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">
              Total Points
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, idx) => (
            <tr
              key={user.user_id}
              className={`border-b ${idx < 3 ? "bg-amber-50" : ""}`}
            >
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      idx === 0
                        ? "bg-amber-100 text-amber-700"
                        : idx === 1
                        ? "bg-gray-200 text-gray-700"
                        : idx === 2
                        ? "bg-amber-800 text-amber-100"
                        : ""
                    }`}
                  >
                    {idx + 1}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage
                      src={
                        user.profile_picture ||
                        "/placeholder.svg?height=32&width=32"
                      }
                      alt={user.username}
                    />
                    <AvatarFallback>
                      {user.first_name?.[0]}
                      {user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {user.profile_completeness}
                  </span>
                  <Progress
                    value={user.profile_completeness}
                    className="h-2 w-16"
                  />
                </div>
              </td>
              <td className="py-3 px-4 font-bold text-blue-700">
                {user.total_points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
