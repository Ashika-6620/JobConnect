"use client";

import Header from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/authstore";
import { _axios as axios, BASE_URL } from "@/lib/axios";
import {
  Briefcase,
  Building,
  Calendar,
  Download,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

interface JobseekerProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  title: string | null;
  skills: string[];
  education: Education[];
  experience: Experience[];
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  resume: string | null;
  profile_completeness: number;
}

export default function JobseekerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<JobseekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/jobseeker/profile/${params.id}?public=true`
        );

        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          setError(response.data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching jobseeker profile:", err);
        setError(
          "Failed to load profile. The profile may not exist or there was a server error."
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  const handleViewResume = async () => {
    if (!user || user.role !== "employer" || !profile?.user_id) return;
    try {
      await axios.post(
        `/jobseeker/profile/${profile.user_id}/resume-views/`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      window.open(BASE_URL + profile.resume!, "_blank");
    } catch (err) {
      toast.error("Failed to record resume view");
      window.open(profile.resume!, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-10 max-w-5xl">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-10 max-w-5xl">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              <h2 className="text-xl font-bold">Profile Not Found</h2>
              <p>{error || "This profile could not be found or accessed."}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-10 max-w-5xl">
        {user && String(user.user_id) === String(profile.user_id) && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => router.push(`/profile/${profile.user_id}/edit`)}
            >
              Edit Profile
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 mb-4">
                  {profile.profile_picture ? (
                    <AvatarImage
                      src={BASE_URL + profile.profile_picture}
                      alt={`${profile.first_name} ${profile.last_name}`}
                    />
                  ) : (
                    <AvatarFallback className="text-4xl">
                      {profile.first_name?.[0]}
                      {profile.last_name?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h1 className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h1>
                {profile.title && (
                  <p className="text-muted-foreground mb-2">{profile.title}</p>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-sm hover:underline"
                    >
                      {profile.email}
                    </a>
                  </div>
                )}

                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${profile.phone}`}
                      className="text-sm hover:underline"
                    >
                      {profile.phone}
                    </a>
                  </div>
                )}

                {profile.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline truncate"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}

                {profile.github_url && (
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline truncate"
                    >
                      GitHub
                    </a>
                  </div>
                )}

                {profile.portfolio_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline truncate"
                    >
                      Portfolio
                    </a>
                  </div>
                )}
              </div>

              {profile.resume && user && user.role == "employer" && (
                <>
                  <Separator className="my-4" />
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleViewResume}
                  >
                    <Download className="mr-2 h-4 w-4" /> View Resume
                  </Button>
                </>
              )}
            </div>

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            {/* About Section */}
            {profile.bio && (
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">About</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.experience && profile.experience.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" /> Experience
                </h2>
                <div className="space-y-6">
                  {profile.experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="border-l-2 border-muted pl-4 relative"
                    >
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                      <h3 className="font-semibold text-base">
                        {exp.position}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Building className="h-3 w-3 mr-1" />
                        {exp.company}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {exp.startDate} - {exp.endDate || "Present"}
                      </div>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" /> Education
                </h2>
                <div className="space-y-6">
                  {profile.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="border-l-2 border-muted pl-4 relative"
                    >
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                      <h3 className="font-semibold text-base">{edu.degree}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Building className="h-3 w-3 mr-1" />
                        {edu.institution}
                      </div>
                      {edu.field && (
                        <p className="text-sm mb-1">Field: {edu.field}</p>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {edu.startDate} - {edu.endDate || "Present"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
