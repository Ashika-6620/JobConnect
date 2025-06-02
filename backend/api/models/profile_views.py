from django.db import models
from django.contrib.auth.models import User
from .jobseeker import Jobseeker
from .employer import Employer

class ResumeProfileView(models.Model):
    jobseeker = models.ForeignKey(Jobseeker, on_delete=models.CASCADE, related_name="resume_views")
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name="viewed_resumes")
    viewed_at = models.DateTimeField(auto_now_add=True)
    user_agent = models.CharField(max_length=512, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        ordering = ["-viewed_at"]
        unique_together = ("jobseeker", "employer", "viewed_at")

    def __str__(self):
        return f"{self.employer.user.username} viewed {self.jobseeker.user.username} at {self.viewed_at}"
