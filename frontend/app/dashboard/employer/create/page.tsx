"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createChallenge, QuestionInput } from "@/lib/challenge-service";
import { openRouterService } from "@/lib/openrouter-service";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateTest() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    QuestionInput[] | null
  >(null);
  const [formData, setFormData] = useState({
    title: "",
    topic: "",
    difficulty: "medium",
    description: "",
  });
  const router = useRouter();

  const createChallengeMutation = useMutation({
    mutationFn: createChallenge,
    onSuccess: () => {
      toast.success("Challenge created successfully!");
    },
    onError: () => {
      toast.error("Failed to create challenge. Please try again.");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, difficulty: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const generatedQuestionsData =
        await openRouterService.generateQuestionsWithOpenAI({
          topic: formData.topic,
          difficulty: formData.difficulty,
          count: 5,
          description: formData.description,
        });

      setGeneratedQuestions(generatedQuestionsData);

      toast.success("Questions Generated", {
        description: "Your test questions have been generated successfully!",
      });
    } catch (error) {
      toast.error("Failed to generate questions", {
        description: "Please try again or modify your request.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTest = () => {
    if (
      !generatedQuestions ||
      formData.title.trim() === "" ||
      formData.topic.trim() === ""
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    createChallengeMutation.mutate({
      title: formData.title,
      topic: formData.topic,
      difficulty: formData.difficulty,
      questions: generatedQuestions,
    });
  };

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
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Challenge</CardTitle>
          <CardDescription>
            Fill in the details below and our AI will generate questions for
            your test.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedQuestions ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. JavaScript Fundamentals"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Primary Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g. javascript, react, go"
                  required
                  value={formData.topic}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2 w-auto">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Details</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what specific areas or concepts you want to cover in this test"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  "Generate Questions"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Generated Questions</h3>
                  <Button
                    variant="outline"
                    onClick={() => setGeneratedQuestions(null)}
                    size="sm"
                  >
                    Regenerate
                  </Button>
                </div>
                <div className="space-y-4">
                  {generatedQuestions.map((question, index) => {
                    const questionId = question.id;
                    return (
                      <div key={questionId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">
                            {index + 1}. {question.text}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedQuestions = [...generatedQuestions];
                              const questionText = prompt(
                                "Edit question:",
                                question.text
                              );

                              if (questionText) {
                                updatedQuestions[index] = {
                                  ...question,
                                  text: questionText,
                                };
                                setGeneratedQuestions(updatedQuestions);
                              }
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="ml-4 space-y-1">
                          {question.options.map((option, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-4 h-4 rounded-full mr-2 ${
                                    option === question.correctAnswer
                                      ? "bg-green-500"
                                      : "bg-gray-200"
                                  }`}
                                  onClick={() => {
                                    const updatedQuestions = [
                                      ...generatedQuestions,
                                    ];
                                    updatedQuestions[index] = {
                                      ...question,
                                      correctAnswer: option,
                                    };
                                    setGeneratedQuestions(updatedQuestions);
                                  }}
                                />
                                <span>{option}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updatedQuestions = [
                                    ...generatedQuestions,
                                  ];
                                  const optionText = prompt(
                                    "Edit option:",
                                    option
                                  );

                                  if (optionText) {
                                    const updatedOptions = [
                                      ...question.options,
                                    ];
                                    updatedOptions[i] = optionText;

                                    let updatedCorrectAnswer =
                                      question.correctAnswer;
                                    if (question.correctAnswer === option) {
                                      updatedCorrectAnswer = optionText;
                                    }

                                    updatedQuestions[index] = {
                                      ...question,
                                      options: updatedOptions,
                                      correctAnswer: updatedCorrectAnswer,
                                    };
                                    setGeneratedQuestions(updatedQuestions);
                                  }
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleSaveTest}
                className="w-full"
                disabled={createChallengeMutation.isPending}
              >
                {createChallengeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Challenge...
                  </>
                ) : (
                  "Save Challenge"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
