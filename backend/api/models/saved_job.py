from django.db import models

class SavedJob(models.Model):
    job_id = models.CharField(max_length=255)
    jobseeker = models.ForeignKey('api.Jobseeker', on_delete=models.CASCADE, related_name='saved_jobs')
    job_title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('job_id', 'jobseeker')
        
    def __str__(self):
        return f"{self.jobseeker.user.username} saved {self.job_title}"
