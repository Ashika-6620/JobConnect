"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeAnalysisData } from "@/lib/resume-analyzer-service";
import {
  AlertCircle,
  CheckCircle,
  Download,
  ExternalLink,
  ThumbsUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [analysisData, setAnalysisData] = useState<ResumeAnalysisData | null>(
    null
  );
  const [jobDetails, setJobDetails] = useState({
    title: "",
    company: "",
    description: "",
  });
  const [markdownReport, setMarkdownReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Load analysis results from localStorage
      const savedAnalysis = localStorage.getItem("resumeAnalysis");
      const savedJobDetails = localStorage.getItem("jobDetails");
      const savedReport = localStorage.getItem("resumeMarkdownReport");

      if (savedAnalysis) {
        setAnalysisData(JSON.parse(savedAnalysis));
      }

      if (savedJobDetails) {
        setJobDetails(JSON.parse(savedJobDetails));
      }

      if (savedReport) {
        setMarkdownReport(savedReport);
      }
    } catch (error) {
      console.error("Error loading analysis results:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDownloadReport = () => {
    if (!markdownReport) return;

    const element = document.createElement("a");
    const file = new Blob([markdownReport], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `Resume_Analysis_${jobDetails.title.replace(
      /\s+/g,
      "_"
    )}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resumeCreators = [
    {
      name: "Resumeworded",
      url: "https://resumeworded.com/",
      description: "AI-powered resume and LinkedIn optimization tool",
    },
    {
      name: "Canva Resume Builder",
      url: "https://www.canva.com/resumes/",
      description: "Beautiful templates with easy customization",
    },
    {
      name: "Zety",
      url: "https://zety.com/",
      description: "Professional resume builder with ATS-friendly templates",
    },
    {
      name: "Resume.io",
      url: "https://resume.io/",
      description: "Simple and effective resume builder with expert tips",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-lg font-medium">
            Loading your analysis results...
          </h3>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Results Not Found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any analysis results. Please run a new analysis.
          </p>
          <Button
            onClick={() => router.push("/ats-resume-parser")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Analyze Resume
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
              Analysis Complete
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              Your Resume Analysis Results
            </h1>
            <p className="text-gray-600">
              Here's how your resume performs against the {jobDetails.title} job
              requirements
              {jobDetails.company ? ` at ${jobDetails.company}` : ""}
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-xl font-semibold mb-1">
                    ATS Compatibility Score
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    How well your resume is likely to perform in an ATS
                  </p>
                </div>

                <div className="relative w-32 h-32 flex-shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">
                      {analysisData.score}%
                    </span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeDasharray={`${analysisData.score}, 100`}
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Matched Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.matchedKeywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" /> {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.missingKeywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        <AlertCircle className="mr-1 h-3 w-3" /> {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="resources">Resume Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.strengths.map((strength, index) => (
                      <div key={`strength-${index}`} className="flex gap-3">
                        <ThumbsUp className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Strength</h3>
                          <p className="text-gray-600 text-sm">{strength}</p>
                        </div>
                      </div>
                    ))}

                    {analysisData.weaknesses.map((weakness, index) => (
                      <div key={`weakness-${index}`} className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Area for Improvement</h3>
                          <p className="text-gray-600 text-sm">{weakness}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-4">
                        Present Sections
                      </h3>
                      <ul className="space-y-2">
                        {analysisData.sections.present.map((section, index) => (
                          <li
                            key={`present-${index}`}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span>{section}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-4">
                        Recommended Sections
                      </h3>
                      <ul className="space-y-2">
                        {analysisData.sections.missing.map((section, index) => (
                          <li
                            key={`missing-${index}`}
                            className="flex items-center gap-2"
                          >
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span>{section}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-6">
              {analysisData.suggestions.map((suggestion, index) => (
                <Card key={`suggestion-${index}`}>
                  <CardHeader>
                    <CardTitle>{suggestion.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{suggestion.description}</p>
                  </CardContent>
                </Card>
              ))}

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Zap className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Overall Feedback</h3>
                    <p className="text-gray-600 mt-1">
                      {analysisData.overallFeedback}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Resume Builders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {resumeCreators.map((tool, index) => (
                      <div
                        key={`tool-${index}`}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="bg-gray-100 p-2 rounded-md">
                          <ExternalLink className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:text-emerald-600 transition-colors"
                          >
                            {tool.name}
                          </a>
                          <p className="text-gray-600 text-sm">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills to Improve</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.recommendations.skills.map((skill, index) => (
                      <Badge
                        key={`skill-${index}`}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleDownloadReport}
            >
              <Download className="mr-2 h-4 w-4" /> Download Full Report
            </Button>
            <Link href="/ats-resume-parser">
              <Button variant="outline">Analyze Another Resume</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
