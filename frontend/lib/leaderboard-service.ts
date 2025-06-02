import { _axios as axios } from "./axios";

export interface LeaderboardUser {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  profile_completeness: number;
  total_points: number;
}

export const fetchLeaderboard = async (
  userId?: string | number
): Promise<{ leaderboard: LeaderboardUser[]; user_rank?: number }> => {
  const params = userId ? { user_id: userId } : {};
  const response = await axios.get("/challenges/leaderboard/", { params });
  return response.data;
};
