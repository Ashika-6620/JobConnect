"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/authstore";
import { _axios } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building,
  Edit2,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  MapPin,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.string().min(1, "Company size is required"),
  founded: z.string().min(1, "Founded year is required"),
  website: z
    .string()
    .url("Please enter a valid website URL")
    .or(z.string().length(0)),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Company description is required"),
  mission: z.string().min(1, "Company mission is required"),
  benefits: z.string().optional(),
  culture: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
});

interface EmployerProfileData {
  companyName: string;
  industry: string;
  companySize: string;
  founded: string;
  website: string;
  location: string;
  description: string;
  mission: string;
  benefits: string;
  benefitsList: string[];
  culture: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  profileCompleteness: number;
  openPositions: number;
  locations: string[];
  teamMembers: any[];
  companyEmail: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
}

export default function CompanyProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const user = useAuthStore((state) => state.user);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      companySize: "",
      founded: "",
      website: "",
      location: "",
      description: "",
      mission: "",
      benefits: "",
      culture: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
    },
  });

  const {
    data: profileData,
    isLoading,
    refetch,
  } = useQuery<{ success: boolean; data: EmployerProfileData }>({
    queryKey: ["employerProfile"],
    queryFn: async () => {
      const res = await _axios.get("/employer/profile");
      return res.data;
    },
    enabled: user !== null,
  });

  useEffect(() => {
    if (profileData?.data && !editMode) {
      form.reset({
        companyName: profileData.data.companyName,
        industry: profileData.data.industry || "",
        companySize: profileData.data.companySize,
        founded: profileData.data.founded || "",
        website: profileData.data.website || "",
        location: profileData.data.location || "",
        description: profileData.data.description || "",
        mission: profileData.data.mission || "",
        benefits: profileData.data.benefits || "",
        culture: profileData.data.culture || "",
        facebook: profileData.data.facebook || "",
        twitter: profileData.data.twitter || "",
        linkedin: profileData.data.linkedin || "",
        instagram: profileData.data.instagram || "",
      });
    }
  }, [profileData?.data, form, editMode]);

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const res = await _axios.put("/employer/profile/", data);
      return res.data;
    },
    onSuccess() {
      toast.success("Company profile updated successfully", {
        description: "Your changes have been saved.",
        duration: 3000,
      });
      setEditMode(false);
      refetch();
    },
    onError(error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update profile",
        {
          description: "Please try again later.",
          duration: 5000,
        }
      );
    },
  });

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    mutate(data);
  };

  const companyData = profileData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading company profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground">
            Manage and update your company information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setEditMode(!editMode)}>
            <Edit2 className="mr-2 h-4 w-4" />
            {editMode ? "Cancel Edit" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {editMode ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your company's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="founded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founded Year</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" placeholder="https://" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headquarters Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-32"
                          placeholder="Describe your company, products, and services..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Mission</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-24"
                          placeholder="Describe your company's mission and values..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits & Perks</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-24"
                          placeholder="List the benefits and perks your company offers..."
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each benefit on a new line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="culture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Culture</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-24"
                          placeholder="Describe your company's culture and work environment..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Link your company's social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Facebook className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              className="pl-8"
                              placeholder="https://facebook.com/yourcompany"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Twitter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              className="pl-8"
                              placeholder="https://twitter.com/yourcompany"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Linkedin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              className="pl-8"
                              placeholder="https://linkedin.com/company/yourcompany"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Instagram className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              className="pl-8"
                              placeholder="https://instagram.com/yourcompany"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {companyData?.companyName}
                  </h2>
                  <p className="text-muted-foreground">
                    {companyData?.industry}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Building className="h-3.5 w-3.5" />
                      <span>{companyData?.companySize} employees</span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{companyData?.location}</span>
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {companyData?.website && (
                    <a
                      href={companyData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <Globe className="mr-2 h-4 w-4" />
                        Website
                      </Button>
                    </a>
                  )}
                  {companyData?.facebook && (
                    <a
                      href={companyData.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <Facebook className="mr-2 h-4 w-4" />
                        Facebook
                      </Button>
                    </a>
                  )}
                  {companyData?.twitter && (
                    <a
                      href={companyData.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <Twitter className="mr-2 h-4 w-4" />
                        Twitter
                      </Button>
                    </a>
                  )}
                  {companyData?.linkedin && (
                    <a
                      href={companyData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                      </Button>
                    </a>
                  )}
                  {companyData?.instagram && (
                    <a
                      href={companyData.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <Instagram className="mr-2 h-4 w-4" />
                        Instagram
                      </Button>
                    </a>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  {companyData?.description && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">About Us</h3>
                      <p className="text-muted-foreground">
                        {companyData.description}
                      </p>
                    </div>
                  )}

                  {companyData?.mission && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Our Mission</h3>
                      <p className="text-muted-foreground">
                        {companyData.mission}
                      </p>
                    </div>
                  )}

                  {companyData?.culture && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Company Culture
                      </h3>
                      <p className="text-muted-foreground">
                        {companyData.culture}
                      </p>
                    </div>
                  )}

                  {companyData?.benefitsList &&
                    companyData.benefitsList.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Benefits & Perks
                        </h3>
                        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                          {companyData.benefitsList.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Company Facts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-1">
                  <h4 className="text-xl font-bold">
                    {companyData?.founded || "N/A"}
                  </h4>
                  <p className="text-sm text-muted-foreground">Founded</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-bold">
                    {companyData?.companySize || "N/A"}
                  </h4>
                  <p className="text-sm text-muted-foreground">Employees</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-bold">
                    {companyData?.locations?.length || 1}
                  </h4>
                  <p className="text-sm text-muted-foreground">Locations</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-bold">
                    {companyData?.openPositions || 0}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Open Positions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {companyData?.locations && companyData.locations.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Company Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companyData.locations.map((location, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p>{location}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
