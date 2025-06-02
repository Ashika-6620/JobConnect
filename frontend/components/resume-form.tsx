"use client";

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
import { Plus, Trash } from "lucide-react";
import { useState } from "react";

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

interface ResumePersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
}

interface ResumeData {
  personalInfo: ResumePersonalInfo;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
}

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeForm({ data, onChange }: ResumeFormProps) {
  const [personalInfo, setPersonalInfo] = useState<ResumePersonalInfo>(
    data.personalInfo || {
      name: "",
      email: "",
      phone: "",
      location: "",
      title: "",
      summary: "",
    }
  );

  const [experience, setExperience] = useState<ResumeExperience[]>(
    data.experience || []
  );
  const [education, setEducation] = useState<ResumeEducation[]>(
    data.education || []
  );
  const [skills, setSkills] = useState<ResumeSkill[]>(data.skills || []);

  const updatePersonalInfo = (
    field: keyof ResumePersonalInfo,
    value: string
  ) => {
    const updated = { ...personalInfo, [field]: value };
    setPersonalInfo(updated);
    onChange({ ...data, personalInfo: updated });
  };

  const addExperience = () => {
    const newExperience: ResumeExperience = {
      id: Date.now(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    const updated = [...experience, newExperience];
    setExperience(updated);
    onChange({ ...data, experience: updated });
  };

  const updateExperience = (
    id: number,
    field: keyof ResumeExperience,
    value: string
  ) => {
    const updated = experience.map((exp) =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    setExperience(updated);
    onChange({ ...data, experience: updated });
  };

  const removeExperience = (id: number) => {
    const updated = experience.filter((exp) => exp.id !== id);
    setExperience(updated);
    onChange({ ...data, experience: updated });
  };

  const addEducation = () => {
    const newEducation: ResumeEducation = {
      id: Date.now(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
    };
    const updated = [...education, newEducation];
    setEducation(updated);
    onChange({ ...data, education: updated });
  };

  const updateEducation = (
    id: number,
    field: keyof ResumeEducation,
    value: string
  ) => {
    const updated = education.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEducation(updated);
    onChange({ ...data, education: updated });
  };

  const removeEducation = (id: number) => {
    const updated = education.filter((edu) => edu.id !== id);
    setEducation(updated);
    onChange({ ...data, education: updated });
  };

  const addSkill = () => {
    const newSkill: ResumeSkill = {
      id: Date.now(),
      name: "",
    };
    const updated = [...skills, newSkill];
    setSkills(updated);
    onChange({ ...data, skills: updated });
  };

  const updateSkill = (id: number, value: string) => {
    const updated = skills.map((skill) =>
      skill.id === id ? { ...skill, name: value } : skill
    );
    setSkills(updated);
    onChange({ ...data, skills: updated });
  };

  const removeSkill = (id: number) => {
    const updated = skills.filter((skill) => skill.id !== id);
    setSkills(updated);
    onChange({ ...data, skills: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={personalInfo.name}
                onChange={(e) => updatePersonalInfo("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={personalInfo.title}
                onChange={(e) => updatePersonalInfo("title", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, State"
              value={personalInfo.location}
              onChange={(e) => updatePersonalInfo("location", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              placeholder="Brief overview of your professional background and strengths"
              className="min-h-[100px]"
              value={personalInfo.summary}
              onChange={(e) => updatePersonalInfo("summary", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Work Experience</CardTitle>
          <Button size="sm" onClick={addExperience}>
            <Plus className="mr-2 h-4 w-4" />
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
                        <Label htmlFor={`company-${exp.id}`}>Company</Label>
                        <Input
                          id={`company-${exp.id}`}
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(exp.id, "company", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`position-${exp.id}`}>Position</Label>
                        <Input
                          id={`position-${exp.id}`}
                          value={exp.position}
                          onChange={(e) =>
                            updateExperience(exp.id, "position", e.target.value)
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
                        <Label htmlFor={`end-date-${exp.id}`}>End Date</Label>
                        <Input
                          id={`end-date-${exp.id}`}
                          placeholder="MM/YYYY or Present"
                          value={exp.endDate}
                          onChange={(e) =>
                            updateExperience(exp.id, "endDate", e.target.value)
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
                      <Trash className="mr-2 h-4 w-4" />
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
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Education</CardTitle>
          <Button size="sm" onClick={addEducation}>
            <Plus className="mr-2 h-4 w-4" />
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
                            updateEducation(edu.id, "degree", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`field-${edu.id}`}>Field of Study</Label>
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
                            updateEducation(edu.id, "startDate", e.target.value)
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
                            updateEducation(edu.id, "endDate", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
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
                <Plus className="mr-2 h-4 w-4" />
                Add Education
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Skills</CardTitle>
          <Button size="sm" onClick={addSkill}>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skills.map((skill) => (
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
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {skills.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  No skills added yet
                </p>
                <Button size="sm" onClick={addSkill}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
