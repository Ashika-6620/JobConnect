import { _axios as axios } from "./axios";

export const fetchChallenges = async () => {
  const response = await axios.get("/challenges/");
  return response.data.challenges;
};

export const fetchChallengeById = async (challengeId: string) => {
  const response = await axios.get(`/challenges/${challengeId}/`);
  return response.data.challenge;
};

export const submitChallengeAnswers = async (
  challengeId: string,
  answers: Record<string, string>,
  timeTaken: number
) => {
  const response = await axios.post(`/challenges/${challengeId}/submit/`, {
    answers,
    time_taken: timeTaken,
  });
  return response.data.result;
};

export const fetchChallengeHistory = async () => {
  const response = await axios.get("/challenges/history/");
  return response.data.history;
};

export interface QuestionInput {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface ChallengeCreateInput {
  title: string;
  topic: string;
  difficulty: string;
  questions: QuestionInput[];
}

export const createChallenge = async (challengeData: ChallengeCreateInput) => {
  const response = await axios.post("/challenges/", challengeData);
  return response.data;
};

export const generateQuestions = async (params: {
  topic: string;
  difficulty: string;
  count: number;
  description?: string;
}): Promise<QuestionInput[]> => {
  const response = await axios.post("/challenges/generate-questions/", params);
  return response.data.questions;
};
