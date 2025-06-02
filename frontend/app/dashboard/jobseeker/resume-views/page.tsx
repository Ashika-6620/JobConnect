"use client";
import { JobseekerSidebar } from "@/components/jobseeker-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authstore";
import { _axios as axios } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ResumeView {
  employer_id: number;
  employer_name: string;
  viewed_at: string;
  user_agent: string | null;
  ip_address: string | null;
}

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const [views, setViews] = useState<ResumeView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      if (!user?.company_id || !user?.token) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `/jobseeker/profile/${user.company_id}/resume-views/`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        if (res.data.success) {
          setViews(res.data.views);
        } else {
          setError(res.data.message || "Failed to fetch views");
        }
      } catch (err) {
        setError("Failed to fetch resume views");
      } finally {
        setLoading(false);
      }
    };
    fetchViews();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <JobseekerSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Resume Views</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
              ) : views.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  No companies have viewed your resume yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {views.map((view, idx) => (
                    <div
                      key={idx}
                      className="border rounded p-4 flex flex-col gap-1"
                    >
                      <div className="font-semibold">{view.employer_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Viewed at:{" "}
                        {new Date(view.viewed_at).toLocaleString("en-US", {
                          timeZone: "IST",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
