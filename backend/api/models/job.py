from django.db import models
from django.contrib.auth.models import User
from .employer import Employer

class Job(models.Model):
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    job_type = models.CharField(max_length=50)  # full-time, part-time, contract, internship, temporary
    experience_level = models.CharField(max_length=50)  # entry, intermediate, senior, executive
    salary_range = models.CharField(max_length=100)
    description = models.TextField()
    requirements = models.TextField()
    responsibilities = models.TextField()
    benefits = models.TextField(blank=True, null=True)
    skills = models.JSONField(default=list)  # To store the skills as an array
    remote = models.BooleanField(default=False)
    urgent = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='jobs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} at {self.employer.company_name}"