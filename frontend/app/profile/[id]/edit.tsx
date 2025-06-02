"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/authstore";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || String(user.user_id) !== id) {
      // Not authorized, redirect to profile view
      router.replace(`/profile/${id}`);
    }
  }, [user, id, router]);

  // TODO: Implement the actual edit form here
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <p className="text-muted-foreground mb-8">Profile editing coming soon.</p>
      <Button onClick={() => router.push(`/profile/${id}`)}>
        Back to Profile
      </Button>
    </div>
  );
}
