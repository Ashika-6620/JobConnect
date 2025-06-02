from api.models import SavedJob, JobApplication, Jobseeker

def get_job_status_for_user(job_id, user):
    """
    Check if a job has been saved or applied for by the given user
    
    Args:
        job_id: The ID of the job
        user: The Django user object
    
    Returns:
        dict: A dictionary containing the job's status for the user
    """
    try:
        jobseeker = Jobseeker.objects.get(user=user)
        
        # Check if the job is saved
        is_saved = SavedJob.objects.filter(jobseeker=jobseeker, job_id=job_id).exists()
        
        # Check if the job is applied for
        application = JobApplication.objects.filter(jobseeker=jobseeker, job_id=job_id).first()
        is_applied = application is not None
        application_status = application.status if application else None
        application_id = application.id if application else None
        
        return {
            "is_saved": is_saved,
            "is_applied": is_applied,
            "application_status": application_status,
            "application_id": application_id
        }
    except Jobseeker.DoesNotExist:
        # Not a jobseeker or not found
        return {
            "is_saved": False,
            "is_applied": False,
            "application_status": None,
            "application_id": None
        }
