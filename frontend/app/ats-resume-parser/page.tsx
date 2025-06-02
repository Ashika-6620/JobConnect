"use client";

import JobDetailsForm from "@/components/job-details-form";
import ResumeUploader from "@/components/resume-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { resumeAnalyzerService } from "@/lib/resume-analyzer-service";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [jobDetails, setJobDetails] = useState({
    title: "",
    company: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleJobDetailsSubmit = (details: {
    title: string;
    company: string;
    description: string;
  }) => {
    setJobDetails(details);
    setStep(2);
  };

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file || !jobDetails.title || !jobDetails.description) {
      return;
    }

    setIsUploading(true);
    setAnalysisError(null);

    try {
      // Analyze resume by sending PDF file directly to OpenRouter API
      const analysisResult = await resumeAnalyzerService.analyzeResume(
        file,
        jobDetails
      );

      // Generate markdown report
      const markdownReport = resumeAnalyzerService.generateMarkdownReport(
        analysisResult,
        jobDetails.title
      );

      // Save analysis results and report to localStorage for the results page
      localStorage.setItem("resumeAnalysis", JSON.stringify(analysisResult));
      localStorage.setItem("resumeMarkdownReport", markdownReport);
      localStorage.setItem("jobDetails", JSON.stringify(jobDetails));

      // Navigate to results page
      router.push("/results");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setAnalysisError("Failed to analyze resume. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            Edulearn ATS Resume Parser
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Let's analyze your resume against the job requirements
          </p>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Step {step} of 2</span>
              <span className="text-sm font-medium">
                {step === 1 ? "50%" : "100%"}
              </span>
            </div>
            <Progress value={step === 1 ? 50 : 100} className="h-2" />
          </div>

          {step === 1 ? (
            <JobDetailsForm onSubmit={handleJobDetailsSubmit} />
          ) : (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Job Details Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-gray-500">Job Title</Label>
                      <p className="font-medium">{jobDetails.title}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Company</Label>
                      <p className="font-medium">
                        {jobDetails.company || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Job Description</Label>
                    <p className="text-sm mt-1 line-clamp-3">
                      {jobDetails.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setStep(1)}
                  >
                    Edit Details
                  </Button>
                </CardContent>
              </Card>

              <ResumeUploader onFileChange={handleFileChange} />

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!file || isUploading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isUploading ? "Analyzing..." : "Analyze Resume"}
                  {!isUploading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              {isUploading && (
                <div className="mt-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium">
                        AI is analyzing your resume
                      </h3>
                      <p className="text-gray-500 mt-1">
                        Comparing your skills and experience with job
                        requirements...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analysisError && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-red-600">{analysisError}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Please try again or contact support if the problem persists.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
