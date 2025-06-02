"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  fetchChallengeById,
  submitChallengeAnswers,
} from "@/lib/challenge-service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface ChallengeData {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: Question[];
}

interface TestResult {
  correct_answers: number;
  total_questions: number;
  points_earned: number;
  time_taken: number;
}

export default function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const router = useRouter();

  const { id } = React.use(params);

  const {
    data: challenge,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => fetchChallengeById(id),
    enabled: !!id,
  });

  const progress = challenge
    ? ((currentQuestionIndex + 1) / challenge.questions.length) * 100
    : 0;
  const currentQuestion = challenge?.questions[currentQuestionIndex];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isTestCompleted || !challenge) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestCompleted, challenge]);

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;

    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (!challenge) return;

    if (currentQuestionIndex < challenge.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinishTest();
    }
  };

  const handleFinishTest = async () => {
    if (!challenge) return;

    setIsTestCompleted(true);

    try {
      const timeTaken = 300 - timeRemaining;
      const results = await submitChallengeAnswers(id, answers, timeTaken);
      setTestResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting test results:", error);
      toast.error("Failed to submit test results. Please try again.");
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    router.push("/dashboard/jobseeker/challenges");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="text-center text-red-500">
          Error loading test. Please try again.
        </div>
        <Button
          onClick={() => router.push("/dashboard/jobseeker/challenges")}
          className="mx-auto mt-4 block"
        >
          Back to Challenges
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/dashboard/jobseeker/challenges"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Challenges
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">{challenge.title}</CardTitle>
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Question {currentQuestionIndex + 1} of{" "}
                {challenge.questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          {currentQuestion && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestion.options.map(
                  (option: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-grow cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  )
                )}
              </RadioGroup>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleNext}
            className="w-full"
            disabled={!currentQuestion || !answers[currentQuestion.id]}
          >
            {currentQuestionIndex < challenge.questions.length - 1
              ? "Next Question"
              : "Finish Test"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Test Results
            </DialogTitle>
            <DialogDescription className="text-center">
              You've completed the {challenge.title} test
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {testResults && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-4xl font-bold">
                      {Math.round(
                        (testResults.correct_answers /
                          testResults.total_questions) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-medium">
                      {testResults.correct_answers} /{" "}
                      {testResults.total_questions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points Earned:</span>
                    <span className="font-medium">
                      {testResults.points_earned} pts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time taken:</span>
                    <span className="font-medium">
                      {formatTime(testResults.time_taken)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseResults} className="w-full">
              Back to Challenges
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
