import json
import os
import uuid
from datetime import datetime
from pathlib import Path

JOB_FILE_PATH = Path(__file__).resolve().parent.parent.parent / 'data' / 'jobs.json'

def get_default_structure():
    """Return the default data structure for the jobs JSON file"""
    return {
        "meta": {
            "total_count": 0,
            "last_updated": datetime.now().isoformat()
        },
        "jobs": []
    }

def load_jobs():
    """Load jobs from JSON file or create a new one if it doesn't exist"""
    if not os.path.exists(JOB_FILE_PATH):
        os.makedirs(os.path.dirname(JOB_FILE_PATH), exist_ok=True)
        
        with open(JOB_FILE_PATH, 'w') as f:
            json.dump(get_default_structure(), f, indent=2)
        return get_default_structure()
    
    try:
        with open(JOB_FILE_PATH, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return get_default_structure()

def save_jobs(data):
    """Save jobs data to JSON file"""
    data["meta"]["last_updated"] = datetime.now().isoformat()
    
    with open(JOB_FILE_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def create_job(job_data):
    """Create a new job"""
    data = load_jobs()
    
    job_id = str(uuid.uuid4())
    
    timestamp = datetime.now().isoformat()
    job_data["id"] = job_id
    job_data["created_at"] = timestamp
    job_data["updated_at"] = timestamp
    
    if isinstance(job_data.get('skills'), str):
        job_data['skills'] = [skill.strip() for skill in job_data['skills'].split(',')]
    
    data["jobs"].append(job_data)
    
    data["meta"]["total_count"] = len(data["jobs"])
    
    save_jobs(data)
    
    return job_data

def get_jobs(page=1, per_page=10, filters=None):
    """Get jobs with pagination and optional filtering"""
    data = load_jobs()
    all_jobs = data["jobs"]
    
    if filters:
        filtered_jobs = []
        for job in all_jobs:
            match = True
            for key, value in filters.items():
                if key == "skills" and isinstance(value, str):
                    job_skills = job.get("skills", [])
                    if not any(skill.lower() == value.lower() for skill in job_skills):
                        match = False
                        break
                elif key == "search" and value:
                    search_value = value.lower()
                    title_match = search_value in job.get("title", "").lower()
                    desc_match = search_value in job.get("description", "").lower()
                    company_match = search_value in job.get("company_name", "").lower()
                    location_match = search_value in job.get("location", "").lower()
                    
                    if not (title_match or desc_match or company_match or location_match):
                        match = False
                        break
                elif job.get(key) != value:
                    match = False
                    break
            
            if match:
                filtered_jobs.append(job)
        all_jobs = filtered_jobs
    
    # Calculate pagination
    total_count = len(all_jobs)
    total_pages = (total_count + per_page - 1) // per_page
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    # Get paginated jobs
    paginated_jobs = all_jobs[start_idx:end_idx]
    
    return {
        "jobs": paginated_jobs,
        "pagination": {
            "total": total_count,
            "per_page": per_page,
            "current_page": page,
            "total_pages": total_pages
        }
    }

def get_job_by_id(job_id):
    """Get a job by its ID"""
    data = load_jobs()
    
    for job in data["jobs"]:
        if job["id"] == job_id:
            return job
    
    return None

def update_job(job_id, job_data):
    """Update an existing job"""
    data = load_jobs()
    
    for i, job in enumerate(data["jobs"]):
        if job["id"] == job_id:
            job_data["id"] = job_id
            job_data["created_at"] = job["created_at"]
            job_data["updated_at"] = datetime.now().isoformat()
            
            if isinstance(job_data.get('skills'), str):
                job_data['skills'] = [skill.strip() for skill in job_data['skills'].split(',')]
            
            data["jobs"][i] = job_data
            
            save_jobs(data)
            
            return job_data
    
    return None

def delete_job(job_id):
    """Delete a job by its ID"""
    data = load_jobs()
    
    for i, job in enumerate(data["jobs"]):
        if job["id"] == job_id:
            # Remove the job
            deleted_job = data["jobs"].pop(i)
            
            # Update the total count
            data["meta"]["total_count"] = len(data["jobs"])
            
            # Save the updated data
            save_jobs(data)
            
            return deleted_job
    
    return None

def get_jobs_by_employer(employer_id, page=1, per_page=10):
    """Get all jobs for a specific employer with pagination"""
    filters = {"employer_id": employer_id}
    return get_jobs(page, per_page, filters)