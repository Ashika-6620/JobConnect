"use client";

import { JobseekerSidebar } from "@/components/jobseeker-sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/authstore";
import { _axios as axiosInstance, BASE_URL } from "@/lib/axios";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function CompleteProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.setUser);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    title: "",
    summary: "",
  });

  interface Experience {
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }

  interface Education {
    id: number;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }

  interface Skill {
    id: number;
    name: string;
  }

  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [urls, setUrls] = useState({
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get(
          `/jobseeker/profile/${user?.company_id}`
        );
        if (response.data.success) {
          const profileData = response.data.data;
          setPersonalInfo({
            first_name: profileData.first_name || user?.first_name || "",
            last_name: profileData.last_name || user?.last_name || "",
            email: profileData.email || user?.email || "",
            phone: profileData.phone || "",
            location: profileData.location || "",
            title: profileData.title || "",
            summary: profileData.bio || "",
          });

          setExperience(
            profileData.experience && profileData.experience.length > 0
              ? profileData.experience
              : []
          );
          setEducation(
            profileData.education && profileData.education.length > 0
              ? profileData.education
              : []
          );
          setSkills(
            profileData.skills && profileData.skills.length > 0
              ? Array.isArray(profileData.skills)
                ? profileData.skills.map((s: any, i: number) =>
                    typeof s === "string" ? { id: Date.now() + i, name: s } : s
                  )
                : []
              : []
          );
          setUrls({
            linkedin_url: profileData.linkedin_url || "",
            github_url: profileData.github_url || "",
            portfolio_url: profileData.portfolio_url || "",
          });
          setResumeUrl(profileData.resume || null);
          setAvatarUrl(profileData.profile_picture || null);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (user?.company_id) {
      fetchProfileData();
    }
  }, [user]);

  const updatePersonalInfo = (field: any, value: any) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    setExperience((prev) => [...prev, newExperience]);
  };

  const updateExperience = (id: number, field: string, value: string) => {
    setExperience((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const removeExperience = (id: number) => {
    setExperience((prev) => prev.filter((exp) => exp.id !== id));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
    };
    setEducation((prev) => [...prev, newEducation]);
  };

  const updateEducation = (id: number, field: string, value: string) => {
    setEducation((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (id: number) => {
    setEducation((prev) => prev.filter((edu) => edu.id !== id));
  };

  const addSkill = () => {
    const newSkill = {
      id: Date.now(),
      name: "",
    };
    setSkills((prev) => [...prev, newSkill]);
  };

  const updateSkill = (id: number, value: string) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === id ? { ...skill, name: value } : skill))
    );
  };

  const removeSkill = (id: number) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
  };

  const updateUrl = (field: string, value: string) => {
    setUrls((prev) => ({ ...prev, [field]: value }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setResumeFile(file);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add all form fields
      formData.append("first_name", personalInfo.first_name);
      formData.append("last_name", personalInfo.last_name);
      formData.append("phone", personalInfo.phone || "");
      formData.append("location", personalInfo.location || "");
      formData.append("bio", personalInfo.summary || "");
      formData.append("title", personalInfo.title || "");

      // Add arrays as JSON strings
      formData.append("experience", JSON.stringify(experience));
      formData.append("education", JSON.stringify(education));
      formData.append(
        "skills",
        JSON.stringify(skills.map((skill) => skill.name))
      );

      formData.append("linkedin_url", urls.linkedin_url || "");
      formData.append("github_url", urls.github_url || "");
      formData.append("portfolio_url", urls.portfolio_url || "");

      if (resumeFile) {
        formData.append("resume", resumeFile);
      } else {
        console.log("No resume file to upload");
      }

      if (avatarFile) {
        formData.append("profile_picture", avatarFile);
      }

      const response = await axiosInstance.post(
        `/jobseeker/profile/${user?.company_id}/`,
        formData
      );

      if (response.data.success) {
        if (response.data.data?.resume) {
          setResumeUrl(response.data.data.resume);
        }
        if (response.data.data?.profile_picture) {
          setAvatarUrl(response.data.data.profile_picture);
        }
        toast.success("Profile updated successfully");
        router.push("/dashboard/jobseeker");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(
        `Failed to update profile: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <JobseekerSidebar />

      <div className="flex-1">
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Complete your profile to increase your chances of getting hired
            </p>
          </div>

          <div className="space-y-6">
            {/* Personal Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={personalInfo.first_name}
                      onChange={(e) =>
                        updatePersonalInfo("first_name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={personalInfo.last_name}
                      onChange={(e) =>
                        updatePersonalInfo("last_name", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={personalInfo.title}
                    onChange={(e) =>
                      updatePersonalInfo("title", e.target.value)
                    }
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) =>
                        updatePersonalInfo("email", e.target.value)
                      }
                      disabled={!!user?.email}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        updatePersonalInfo("phone", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={personalInfo.location}
                    onChange={(e) =>
                      updatePersonalInfo("location", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="Brief overview of your professional background and strengths"
                    className="min-h-[100px]"
                    value={personalInfo.summary}
                    onChange={(e) =>
                      updatePersonalInfo("summary", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Experience Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                <Button size="sm" onClick={addExperience}>
                  Add Experience
                </Button>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {experience.map((exp, index) => (
                    <AccordionItem
                      key={exp.id}
                      value={exp.id.toString()}
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4">
                        {exp.position || exp.company
                          ? `${exp.position} at ${exp.company}`
                          : `Experience ${index + 1}`}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`company-${exp.id}`}>
                                Company
                              </Label>
                              <Input
                                id={`company-${exp.id}`}
                                value={exp.company}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    "company",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`position-${exp.id}`}>
                                Position
                              </Label>
                              <Input
                                id={`position-${exp.id}`}
                                value={exp.position}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    "position",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`start-date-${exp.id}`}>
                                Start Date
                              </Label>
                              <Input
                                id={`start-date-${exp.id}`}
                                placeholder="MM/YYYY"
                                value={exp.startDate}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    "startDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`end-date-${exp.id}`}>
                                End Date
                              </Label>
                              <Input
                                id={`end-date-${exp.id}`}
                                placeholder="MM/YYYY or Present"
                                value={exp.endDate}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    "endDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`description-${exp.id}`}>
                              Description
                            </Label>
                            <Textarea
                              id={`description-${exp.id}`}
                              placeholder="Describe your responsibilities and achievements"
                              className="min-h-[100px]"
                              value={exp.description}
                              onChange={(e) =>
                                updateExperience(
                                  exp.id,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {experience.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      No work experience added yet
                    </p>
                    <Button size="sm" onClick={addExperience}>
                      Add Experience
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Education</CardTitle>
                <Button size="sm" onClick={addEducation}>
                  Add Education
                </Button>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {education.map((edu, index) => (
                    <AccordionItem
                      key={edu.id}
                      value={edu.id.toString()}
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4">
                        {edu.institution || edu.degree
                          ? `${edu.degree} at ${edu.institution}`
                          : `Education ${index + 1}`}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`institution-${edu.id}`}>
                                Institution
                              </Label>
                              <Input
                                id={`institution-${edu.id}`}
                                value={edu.institution}
                                onChange={(e) =>
                                  updateEducation(
                                    edu.id,
                                    "institution",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                              <Input
                                id={`degree-${edu.id}`}
                                value={edu.degree}
                                onChange={(e) =>
                                  updateEducation(
                                    edu.id,
                                    "degree",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`field-${edu.id}`}>
                              Field of Study
                            </Label>
                            <Input
                              id={`field-${edu.id}`}
                              value={edu.field}
                              onChange={(e) =>
                                updateEducation(edu.id, "field", e.target.value)
                              }
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`edu-start-date-${edu.id}`}>
                                Start Date
                              </Label>
                              <Input
                                id={`edu-start-date-${edu.id}`}
                                placeholder="MM/YYYY"
                                value={edu.startDate}
                                onChange={(e) =>
                                  updateEducation(
                                    edu.id,
                                    "startDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edu-end-date-${edu.id}`}>
                                End Date
                              </Label>
                              <Input
                                id={`edu-end-date-${edu.id}`}
                                placeholder="MM/YYYY or Present"
                                value={edu.endDate}
                                onChange={(e) =>
                                  updateEducation(
                                    edu.id,
                                    "endDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {education.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      No education added yet
                    </p>
                    <Button size="sm" onClick={addEducation}>
                      Add Education
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Skills</CardTitle>
                <Button size="sm" onClick={addSkill}>
                  Add Skill
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skills.map((skill: any) => (
                    <div key={skill.id} className="flex items-center gap-2">
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, e.target.value)}
                        placeholder="e.g., JavaScript, Project Management, etc."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSkill(skill.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  {skills.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        No skills added yet
                      </p>
                      <Button size="sm" onClick={addSkill}>
                        Add Skill
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional URLs Section */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={urls.linkedin_url}
                    onChange={(e) => updateUrl("linkedin_url", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    placeholder="https://github.com/yourusername"
                    value={urls.github_url}
                    onChange={(e) => updateUrl("github_url", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">Portfolio URL</Label>
                  <Input
                    id="portfolio_url"
                    placeholder="https://yourportfolio.com"
                    value={urls.portfolio_url}
                    onChange={(e) => updateUrl("portfolio_url", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resume Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Resume (PDF)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeChange}
                  />
                  {resumeFile && (
                    <span className="text-sm text-muted-foreground">
                      Selected: {resumeFile.name}
                    </span>
                  )}
                  {resumeUrl && (
                    <a
                      href={BASE_URL + resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      View Current Resume
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  {avatarUrl ? (
                    <img
                      src={BASE_URL + avatarUrl}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold border">
                      {personalInfo.first_name?.[0]}
                      {personalInfo.last_name?.[0]}
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="mt-2"
                  />
                  {avatarFile && (
                    <span className="text-sm text-muted-foreground">
                      Selected: {avatarFile.name}
                    </span>
                  )}
                  {avatarUrl && !avatarFile && (
                    <span className="text-sm text-muted-foreground">
                      Current avatar
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/jobseeker")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
