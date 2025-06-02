"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { _axios } from "@/lib/axios";
import { Camera, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  linkedin: string;
  twitter: string;
  avatar: string;
}

interface TeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editMember: TeamMember | null;
}

export default function TeamMemberDialog({
  isOpen,
  onClose,
  onSuccess,
  editMember,
}: TeamMemberDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    linkedin: "",
    twitter: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editMember) {
      setFormData({
        name: editMember.name,
        position: editMember.position,
        bio: editMember.bio || "",
        linkedin: editMember.linkedin || "",
        twitter: editMember.twitter || "",
      });

      if (editMember.avatar) {
        setAvatarPreview(editMember.avatar);
      }
    } else {
      resetForm();
    }
  }, [editMember, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      bio: "",
      linkedin: "",
      twitter: "",
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should not exceed 2MB");
        return;
      }

      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }

    if (formData.linkedin && !formData.linkedin.includes("linkedin.com")) {
      newErrors.linkedin = "Please enter a valid LinkedIn URL";
    }

    if (
      formData.twitter &&
      !formData.twitter.includes("twitter.com") &&
      !formData.twitter.includes("x.com")
    ) {
      newErrors.twitter = "Please enter a valid Twitter/X URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("position", formData.position);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("linkedin", formData.linkedin);
      formDataToSend.append("twitter", formData.twitter);

      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      let response;

      if (editMember) {
        response = await _axios.put(
          `/employer/team/${editMember.id}/`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        response = await _axios.post("/employer/team/", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        toast.success(
          editMember
            ? "Team member updated successfully"
            : "Team member added successfully"
        );
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting team member:", error);
      toast.error("Failed to save team member information");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editMember ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={avatarPreview || ""} alt="Avatar preview" />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-lg">
                  {formData.name
                    ? formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "TM"}
                </AvatarFallback>
              </Avatar>
              {avatarPreview ? (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full"
                  onClick={handleRemoveAvatar}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              ) : (
                <Label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer shadow-md hover:bg-primary/90"
                >
                  <Camera className="w-4 h-4" />
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </Label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: Square image, max 2MB
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-1">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="position" className="flex items-center gap-1">
                Position <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="E.g., CEO, CTO, Marketing Director"
                className={errors.position ? "border-red-500" : ""}
              />
              {errors.position && (
                <p className="text-xs text-red-500 mt-1">{errors.position}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="A short biography of the team member"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/username"
                className={errors.linkedin ? "border-red-500" : ""}
              />
              {errors.linkedin && (
                <p className="text-xs text-red-500 mt-1">{errors.linkedin}</p>
              )}
            </div>

            <div>
              <Label htmlFor="twitter">Twitter / X Profile</Label>
              <Input
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/username"
                className={errors.twitter ? "border-red-500" : ""}
              />
              {errors.twitter && (
                <p className="text-xs text-red-500 mt-1">{errors.twitter}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editMember
                ? "Update"
                : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
