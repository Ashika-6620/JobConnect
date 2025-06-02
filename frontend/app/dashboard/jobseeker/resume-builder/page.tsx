"use client";

import Header from "@/components/header";
import { ResumeForm } from "@/components/resume-form";
import { ResumePreview } from "@/components/resume-preview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/authstore";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Download,
  Eye,
  Link,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// API response types
interface Skill {
  name: string;
  level?: string;
}

interface Experience {
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface ResumeExperience {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  location?: string;
}

interface ResumeEducation {
  id: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface ResumeSkill {
  id: number;
  name: string;
}

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    summary: string;
  };
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
}

export default function ResumeBuilderPage() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.company_id || user?.user_id;

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      title: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
  });

  const [activeLayout, setActiveLayout] = useState("modern");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const pdfPreviewRef = useRef<HTMLDivElement>(null);

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobseekerProfile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not found");
      const response = await _axios.get(`/jobseeker/profile/${userId}/`);
      return response.data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (profileData?.data && userId) {
      const profile = profileData.data;
      console.log("Profile data received:", profile);

      // Handle experience data properly
      let experienceData = [];
      if (profile.experience && Array.isArray(profile.experience)) {
        experienceData = profile.experience.map((exp: any) => ({
          id: exp.id || Date.now() + Math.random(),
          company: exp.company || "",
          position: exp.position || exp.title || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          description: exp.description || "",
          location: exp.location || "",
        }));
      }

      let educationData = [];
      if (profile.education && Array.isArray(profile.education)) {
        educationData = profile.education.map((edu: any) => ({
          id: edu.id || Date.now() + Math.random(),
          institution: edu.institution || "",
          degree: edu.degree || "",
          field: edu.field || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          description: edu.description || "",
        }));
      }

      let skillsData = [];
      if (profile.skills) {
        if (Array.isArray(profile.skills)) {
          skillsData = profile.skills.flatMap((skillEntry: any) => {
            if (typeof skillEntry === "string" && skillEntry.includes(",")) {
              return skillEntry
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill.length > 0)
                .map((skill) => ({
                  id: Date.now() + Math.random(),
                  name: skill,
                }));
            } else if (typeof skillEntry === "string") {
              return {
                id: Date.now() + Math.random(),
                name: skillEntry.trim(),
              };
            } else if (
              skillEntry &&
              typeof skillEntry === "object" &&
              skillEntry.name
            ) {
              return {
                id: Date.now() + Math.random(),
                name: skillEntry.name,
              };
            }
            return {
              id: Date.now() + Math.random(),
              name: String(skillEntry || "").trim(),
            };
          });
        }
      }

      const mappedResumeData = {
        personalInfo: {
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          title:
            profile.experience && profile.experience.length > 0
              ? profile.experience[0].position || ""
              : "",
          summary: profile.bio || "",
        },
        experience: experienceData,
        education: educationData,
        skills: Array.isArray(skillsData)
          ? skillsData
          : [skillsData].filter(Boolean),
      };

      setResumeData(mappedResumeData);

      setSaveStatus("saved");

      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }
  }, [profileData, userId]);

  const handleFormChange = (data: ResumeData) => {
    setResumeData(data);
    setSaveStatus("idle");
  };

  const handleSaveResume = async () => {
    if (!userId) return;

    try {
      setSaveStatus("saving");

      const skillsString = resumeData.skills
        .map((skill) => skill.name)
        .join(", ");

      const profileUpdateData = {
        first_name: resumeData.personalInfo.name.split(" ")[0] || "",
        last_name:
          resumeData.personalInfo.name.split(" ").slice(1).join(" ") || "",
        email: resumeData.personalInfo.email,
        phone: resumeData.personalInfo.phone,
        location: resumeData.personalInfo.location,
        bio: resumeData.personalInfo.summary,
        experience: resumeData.experience.map((exp) => ({
          id: exp.id,
          position: exp.position,
          company: exp.company,
          location: exp.location || "",
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
        })),
        education: resumeData.education.map((edu) => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate,
          description: edu.description || "",
        })),
        skills: [skillsString],
      };

      console.log("Sending profile update data:", profileUpdateData);

      // Update the jobseeker profile
      const response = await _axios.put(
        `/jobseeker/profile/${userId}/`,
        profileUpdateData
      );

      if (response.data.success) {
        setSaveStatus("saved");
      } else {
        console.error("Error from server:", response.data.message);
        setSaveStatus("error");
      }

      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error saving resume:", error);
      setSaveStatus("error");

      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }
  };

  const handleGeneratePDF = async (layout: string) => {
    setPdfLoading(true);
    setShowPdfPreview(true);
    setTimeout(async () => {
      const input = pdfPreviewRef.current;
      if (!input) {
        setPdfLoading(false);
        setShowPdfPreview(false);
        alert("Could not find resume preview for PDF export.");
        return;
      }
      try {
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        // Calculate image dimensions to fit A4
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("resume.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setPdfLoading(false);
        setShowPdfPreview(false);
      }
    }, 100); // Wait for hidden preview to render
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-6">
        {/* Hidden PDF preview for export */}
        {showPdfPreview && (
          <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
            <div
              ref={pdfPreviewRef}
              style={{
                width: 800,
                background: "#fff",
                color: "#000",
                padding: 32,
              }}
            >
              <ResumePreview data={resumeData} layout={activeLayout} />
            </div>
          </div>
        )}
        <div className="container flex h-16 items-center justify-between mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/jobseeker">
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleGeneratePDF(activeLayout)}
              disabled={pdfLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {pdfLoading ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
        <div className="container mx-auto">
          <h1 className="mb-6 text-3xl font-bold">Resume Builder</h1>

          {saveStatus === "saved" && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <AlertDescription>Resume saved successfully!</AlertDescription>
            </Alert>
          )}

          {saveStatus === "error" && (
            <Alert className="mb-4 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <AlertDescription>
                Failed to save resume. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <Alert className="mb-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <AlertDescription>Loading your profile data...</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <AlertDescription>
                Error loading profile data. Your progress will not be saved.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <ResumeForm data={resumeData} onChange={handleFormChange} />
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 text-lg font-medium">
                        Layout Options
                      </h3>
                      <div className="grid gap-4">
                        <Button
                          variant={
                            activeLayout === "modern" ? "default" : "outline"
                          }
                          className="justify-start"
                          onClick={() => setActiveLayout("modern")}
                        >
                          Modern
                        </Button>
                        <Button
                          variant={
                            activeLayout === "classic" ? "default" : "outline"
                          }
                          className="justify-start"
                          onClick={() => setActiveLayout("classic")}
                        >
                          Classic
                        </Button>
                        <Button
                          variant={
                            activeLayout === "minimal" ? "default" : "outline"
                          }
                          className="justify-start"
                          onClick={() => setActiveLayout("minimal")}
                        >
                          Minimal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 text-lg font-medium">ATS Tips</h3>
                      <ul className="list-inside list-disc space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>Use keywords from the job description</li>
                        <li>Keep formatting simple and consistent</li>
                        <li>Use standard section headings</li>
                        <li>Avoid tables, headers/footers, and images</li>
                        <li>Save as PDF unless specified otherwise</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <ResumePreview data={resumeData} layout={activeLayout} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
