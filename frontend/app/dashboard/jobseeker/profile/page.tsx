"use client";

import { JobseekerSidebar } from "@/components/jobseeker-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authstore";
import { _axios as axiosInstance, BASE_URL } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const fetchProfile = async () => {
    if (!user?.company_id) return null;
    const res = await axiosInstance.get(
      `/jobseeker/profile/${user.company_id}`
    );
    if (res.data.success) {
      return res.data.data;
    }
    return null;
  };

  const {
    data: profile,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["jobseekerProfile", user?.company_id],
    queryFn: fetchProfile,
    enabled: !!user?.company_id,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        Profile not found.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <JobseekerSidebar />
      <div className="flex-1">
        <main className="p-6 max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">
                View your jobseeker profile details
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/jobseeker")}
            >
              {" "}
              <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard{" "}
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-4">
                {profile.profile_picture ? (
                  <img
                    src={BASE_URL + profile.profile_picture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold border">
                    {profile.first_name?.[0]}
                    {profile.last_name?.[0]}
                  </div>
                )}
                <div>
                  <div className="text-xl font-semibold">
                    {profile.first_name} {profile.last_name}
                  </div>
                  <div className="text-muted-foreground">{profile.title}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="font-medium">Email:</span> {profile.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{" "}
                  {profile.phone || <span className="text-gray-400">N/A</span>}
                </div>
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {profile.location || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <span className="font-medium">Summary:</span>
                <div className="text-muted-foreground mt-1">
                  {profile.bio || <span className="text-gray-400">N/A</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.experience && profile.experience.length > 0 ? (
                profile.experience.map((exp: any, idx: number) => (
                  <div key={exp.id || idx} className="border rounded p-3">
                    <div className="font-semibold">
                      {exp.position} at {exp.company}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exp.startDate} - {exp.endDate}
                    </div>
                    <div className="mt-1">{exp.description}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No experience added.</div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.education && profile.education.length > 0 ? (
                profile.education.map((edu: any, idx: number) => (
                  <div key={edu.id || idx} className="border rounded p-3">
                    <div className="font-semibold">
                      {edu.degree} in {edu.field}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {edu.institution}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {edu.startDate} - {edu.endDate}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No education added.</div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill: any, idx: number) => (
                  <span
                    key={skill.id || idx}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {typeof skill === "string" ? skill : skill.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No skills added.</span>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Professional Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">LinkedIn:</span>{" "}
                {profile.linkedin_url ? (
                  <a
                    href={profile.linkedin_url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profile.linkedin_url}
                  </a>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
              <div>
                <span className="font-medium">GitHub:</span>{" "}
                {profile.github_url ? (
                  <a
                    href={profile.github_url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profile.github_url}
                  </a>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
              <div>
                <span className="font-medium">Portfolio:</span>{" "}
                {profile.portfolio_url ? (
                  <a
                    href={profile.portfolio_url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profile.portfolio_url}
                  </a>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.resume ? (
                <a
                  href={BASE_URL + profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Resume
                </a>
              ) : (
                <span className="text-gray-400">No resume uploaded.</span>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
