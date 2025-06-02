from django.db import models
from django.contrib.auth.models import User

def resume_upload_path(instance, filename):
    return f"resumes/{instance.user.id}/{filename}"

def profile_picture_upload_path(instance, filename):
    return f"profile_pictures/{instance.user.id}/{filename}"

class Jobseeker(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    profile_picture = models.ImageField(upload_to=profile_picture_upload_path, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    skills = models.JSONField(default=list, blank=True, null=True)
    education = models.JSONField(default=list, blank=True, null=True)
    experience = models.JSONField(default=list, blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    resume = models.FileField(upload_to=resume_upload_path, blank=True, null=True)
    terms_accepted = models.BooleanField(default=False)
    profile_completeness = models.IntegerField(default=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def calculate_profile_completeness(self):
        """
        Calculate profile completeness based on filled fields
        Returns a percentage between 0-100
        """
        fields_to_check = {
            'first_name': 5,
            'last_name': 5,
            'profile_picture': 10,
            'bio': 10,
            'phone': 5,
            'location': 5,
            'skills': 15,
            'education': 15,
            'experience': 15,
            'linkedin_url': 5,
            'github_url': 5,
            'portfolio_url': 5,
            'resume': 10,
        }
        
        completeness = 0
        
        for field, weight in fields_to_check.items():
            field_value = getattr(self, field)
            if field_value:
                if field in ['skills', 'education', 'experience'] and len(field_value) > 0:
                    completeness += weight
                elif field not in ['skills', 'education', 'experience']:
                    completeness += weight
                    
        return min(completeness, 100)
    
    def save(self, *args, **kwargs):
        self.profile_completeness = self.calculate_profile_completeness()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - {self.user.id}"
    
    @property
    def resume_url(self):
        if self.resume:
            return self.resume.url
        return None