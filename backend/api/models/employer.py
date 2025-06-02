from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
import os
import json
from datetime import datetime

def employer_logo_path(instance, filename):
    now = datetime.now().strftime("%Y%m%d%H%M%S")
    return f'employer_logos/{instance.user.id}_{now}_{filename}'

def employer_cover_path(instance, filename):
    now = datetime.now().strftime("%Y%m%d%H%M%S")
    return f'employer_covers/{instance.user.id}_{now}_{filename}'

class Employer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    company_email = models.EmailField()
    company_size = models.CharField(max_length=50)
    terms_accepted = models.BooleanField(default=False)
    
    # Additional company profile fields
    industry = models.CharField(max_length=255, null=True, blank=True)
    founded_year = models.CharField(max_length=4, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    mission = models.TextField(null=True, blank=True)
    benefits = models.TextField(null=True, blank=True)
    culture = models.TextField(null=True, blank=True)
    facebook = models.URLField(null=True, blank=True)
    twitter = models.URLField(null=True, blank=True)
    linkedin = models.URLField(null=True, blank=True)
    instagram = models.URLField(null=True, blank=True)
    profile_completeness = models.IntegerField(default=0)
    
    # File uploads
    logo = models.ImageField(upload_to=employer_logo_path, null=True, blank=True)
    cover_image = models.ImageField(upload_to=employer_cover_path, null=True, blank=True)
    
    # JSON fields
    _team_members = models.TextField(null=True, blank=True, db_column='team_members')
    _locations = models.TextField(null=True, blank=True, db_column='locations')

    @property
    def team_members(self):
        if self._team_members:
            try:
                return json.loads(self._team_members)
            except json.JSONDecodeError:
                return []
        return []

    @team_members.setter
    def team_members(self, value):
        if value is None:
            self._team_members = None
        else:
            self._team_members = json.dumps(value)

    @property
    def locations(self):
        if self._locations:
            try:
                return json.loads(self._locations)
            except json.JSONDecodeError:
                return []
        return []

    @locations.setter
    def locations(self, value):
        if value is None:
            self._locations = None
        else:
            self._locations = json.dumps(value)

    def calculate_profile_completeness(self):
        total_fields = 10  # Base fields that should be filled
        filled_fields = 0
        
        if self.company_name:
            filled_fields += 1
        if self.company_email:
            filled_fields += 1
        if self.company_size:
            filled_fields += 1
        if self.logo:
            filled_fields += 1
        if self.industry:
            filled_fields += 1
        if self.location:
            filled_fields += 1
        if self.description and len(self.description) > 10:
            filled_fields += 1
        if self.website:
            filled_fields += 1
        if self.mission and len(self.mission) > 10:
            filled_fields += 1
        if self.cover_image:
            filled_fields += 1
            
        # Additional bonuses for more detailed profile
        # Team members
        if self.team_members and len(self.team_members) > 0:
            filled_fields += len(self.team_members) if len(self.team_members) <= 3 else 3
            
        # Social links
        social_count = 0
        if self.facebook:
            social_count += 1
        if self.twitter:
            social_count += 1
        if self.linkedin:
            social_count += 1
        if self.instagram:
            social_count += 1
            
        filled_fields += min(social_count, 2)  # At most 2 points for social links
        
        # Calculate percentage, cap at 100%
        max_points = total_fields + 3 + 2  # Base + team members + social
        percentage = min(int((filled_fields / max_points) * 100), 100)
        
        return percentage
        
    def __str__(self):
        return f"{self.company_name}"