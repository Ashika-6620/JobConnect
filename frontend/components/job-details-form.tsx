"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface JobDetailsFormProps {
  onSubmit: (details: {
    title: string;
    company: string;
    description: string;
  }) => void;
}

export default function JobDetailsForm({ onSubmit }: JobDetailsFormProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [errors, setErrors] = useState({
    title: false,
    description: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      title: !jobTitle.trim(),
      description: !jobDescription.trim(),
    };

    setErrors(newErrors);

    if (!newErrors.title && !newErrors.description) {
      onSubmit({
        title: jobTitle,
        company,
        description: jobDescription,
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tell us about the job</h2>
            <p className="text-gray-600 text-sm">
              Provide details about the position you're applying for so we can
              analyze your resume against the specific requirements.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="jobTitle" className="text-sm font-medium">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  Job title is required
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="company" className="text-sm font-medium">
                Company (Optional)
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Inc."
              />
            </div>

            <div>
              <Label htmlFor="jobDescription" className="text-sm font-medium">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className={`min-h-[200px] ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  Job description is required
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
