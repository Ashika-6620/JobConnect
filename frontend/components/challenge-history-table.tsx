import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authstore";
import { _axios as axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface ChallengeAttempt {
  id: number;
  challenge_id: number;
  challenge_title: string;
  challenge_topic: string;
  challenge_difficulty: string;
  correct_answers: number;
  total_questions: number;
  points_earned: number;
  time_taken_seconds: number;
  completed_at: string;
}

export function ChallengeHistoryTable() {
  const user = useAuthStore((state) => state.user);
  const {
    data: challengeAttempts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["challenge-history"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get("/challenges/history/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.history;
    },
  });

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md mt-6">
        <CardHeader>
          <CardTitle>Challenge History</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-0 shadow-md mt-6">
        <CardHeader>
          <CardTitle>Challenge History</CardTitle>
        </CardHeader>
        <CardContent>Failed to load challenge history</CardContent>
      </Card>
    );
  }

  if (!challengeAttempts || challengeAttempts.length === 0) {
    return (
      <Card className="border-0 shadow-md mt-6">
        <CardHeader>
          <CardTitle>Challenge History</CardTitle>
        </CardHeader>
        <CardContent>No challenges attempted yet.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md mt-6 mx-6">
      <CardHeader>
        <CardTitle>Challenge History</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Title</th>
              <th className="px-4 py-2 font-semibold">Topic</th>
              <th className="px-4 py-2 font-semibold">Difficulty</th>
              <th className="px-4 py-2 font-semibold">Score</th>
              <th className="px-4 py-2 font-semibold">Points</th>
              <th className="px-4 py-2 font-semibold">Time</th>
              <th className="px-4 py-2 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {challengeAttempts.map((attempt: ChallengeAttempt) => (
              <tr key={attempt.id} className="border-b last:border-0">
                <td className="px-4 py-2">{attempt.challenge_title}</td>
                <td className="px-4 py-2">{attempt.challenge_topic}</td>
                <td className="px-4 py-2 capitalize">
                  {attempt.challenge_difficulty}
                </td>
                <td className="px-4 py-2">
                  {attempt.correct_answers} / {attempt.total_questions}
                </td>
                <td className="px-4 py-2">{attempt.points_earned}</td>
                <td className="px-4 py-2">
                  {Math.floor(attempt.time_taken_seconds / 60)}m{" "}
                  {attempt.time_taken_seconds % 60}s
                </td>
                <td className="px-4 py-2">
                  {new Date(attempt.completed_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
