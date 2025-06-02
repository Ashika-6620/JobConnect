from django.db import models

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewing', 'Reviewing'),
        ('interview', 'Interview'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
        ('withdrawn', 'Withdrawn')
    ]
    
    job_id = models.CharField(max_length=255)
    jobseeker = models.ForeignKey('api.Jobseeker', on_delete=models.CASCADE, related_name='job_applications')
    job_title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    cover_letter = models.TextField(blank=True, null=True)
    resume = models.FileField(upload_to='applications/resumes/', blank=True, null=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('job_id', 'jobseeker')
        
    def __str__(self):
        return f"{self.jobseeker.user.username} applied for {self.job_title}"
