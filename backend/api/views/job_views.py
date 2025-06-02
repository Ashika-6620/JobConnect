import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction

from api.utils.job_storage import (
    create_job,
    get_jobs,
    get_job_by_id,
    update_job,
    delete_job,
    get_jobs_by_employer
)
from api.utils.job_status import get_job_status_for_user
from api.models import Employer
from api.utils.jwt_middleware import get_user_from_token

@method_decorator(csrf_exempt, name='dispatch')
class JobView(View):
    def get(self, request, job_id=None):
        """Get a single job or list of jobs"""
        # Get the user from the token (optional for this endpoint)
        user, role, error = get_user_from_token(request, require_auth=False)
        
        if job_id:
            job = get_job_by_id(job_id)
            if not job:
                return JsonResponse({
                    'success': False,
                    'message': f'Job with ID {job_id} not found'
                }, status=404)
            
            # If user is authenticated, include saved and applied status
            if user:
                job_status = get_job_status_for_user(job_id, user)
                job.update(job_status)
            
            return JsonResponse({
                'success': True,
                'data': job
            })
        
        # Get pagination parameters
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 10))
        
        # Get filter parameters
        filters = {}
        for key in ['job_type', 'experience_level', 'remote', 'urgent', 'featured']:
            if key in request.GET:
                filters[key] = request.GET.get(key)
        
        # Handle search parameter
        search = request.GET.get('search')
        if search:
            filters['search'] = search
            
        # Handle skills filter
        skills = request.GET.get('skills')
        if skills:
            filters['skills'] = skills
        
        # Get the jobs
        jobs_data = get_jobs(page, per_page, filters)
        
        return JsonResponse({
            'success': True,
            'data': jobs_data
        })
    
    def post(self, request):
        """Create a new job posting"""
        # Get the user from the token
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        # Only employers can create job postings
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can create job postings'
            }, status=403)
        
        try:
            # Get the employer record
            employer = Employer.objects.get(user=user)
            
            # Parse the request data
            data = json.loads(request.body)
            
            # Prepare the job data with employer information
            job_data = {
                'title': data.get('title'),
                'location': data.get('location'),
                'job_type': data.get('jobType'),
                'experience_level': data.get('experienceLevel'),
                'salary_range': data.get('salaryRange'),
                'description': data.get('description'),
                'requirements': data.get('requirements'),
                'responsibilities': data.get('responsibilities'),
                'benefits': data.get('benefits', ''),
                'skills': data.get('skills'),
                'remote': data.get('remote', False),
                'urgent': data.get('urgent', False),
                'featured': data.get('featured', False),
                'employer_id': employer.id,
                'company_name': employer.company_name,
            }
            
            # Validate required fields
            required_fields = ['title', 'location', 'job_type', 'experience_level', 
                              'salary_range', 'description', 'requirements', 'responsibilities']
            
            missing_fields = [field for field in required_fields if not job_data.get(field)]
            if missing_fields:
                return JsonResponse({
                    'success': False,
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=400)
            
            # Create the job
            created_job = create_job(job_data)
            
            return JsonResponse({
                'success': True,
                'message': 'Job posted successfully',
                'data': created_job
            }, status=201)
            
        except Employer.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Employer profile not found'
            }, status=404)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def put(self, request, job_id):
        """Update an existing job posting"""
        # Get the user from the token
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        # Only employers can update job postings
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can update job postings'
            }, status=403)
        
        try:
            # Get the employer record
            employer = Employer.objects.get(user=user)
            
            # Check if the job exists
            existing_job = get_job_by_id(job_id)
            if not existing_job:
                return JsonResponse({
                    'success': False,
                    'message': f'Job with ID {job_id} not found'
                }, status=404)
            
            # Check if the employer owns this job
            if existing_job.get('employer_id') != employer.id:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to update this job'
                }, status=403)
            
            # Parse the request data
            data = json.loads(request.body)
            
            # Prepare the job data with employer information
            job_data = {
                'title': data.get('title'),
                'location': data.get('location'),
                'job_type': data.get('jobType'),
                'experience_level': data.get('experienceLevel'),
                'salary_range': data.get('salaryRange'),
                'description': data.get('description'),
                'requirements': data.get('requirements'),
                'responsibilities': data.get('responsibilities'),
                'benefits': data.get('benefits', ''),
                'skills': data.get('skills'),
                'remote': data.get('remote', False),
                'urgent': data.get('urgent', False),
                'featured': data.get('featured', False),
                'employer_id': employer.id,
                'company_name': employer.company_name,
            }
            
            # Validate required fields
            required_fields = ['title', 'location', 'job_type', 'experience_level', 
                              'salary_range', 'description', 'requirements', 'responsibilities']
            
            missing_fields = [field for field in required_fields if not job_data.get(field)]
            if missing_fields:
                return JsonResponse({
                    'success': False,
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=400)
            
            # Update the job
            updated_job = update_job(job_id, job_data)
            
            return JsonResponse({
                'success': True,
                'message': 'Job updated successfully',
                'data': updated_job
            })
            
        except Employer.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Employer profile not found'
            }, status=404)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def delete(self, request, job_id):
        """Delete a job posting"""
        # Get the user from the token
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        # Only employers can delete job postings
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can delete job postings'
            }, status=403)
        
        try:
            # Get the employer record
            employer = Employer.objects.get(user=user)
            
            # Check if the job exists
            existing_job = get_job_by_id(job_id)
            if not existing_job:
                return JsonResponse({
                    'success': False,
                    'message': f'Job with ID {job_id} not found'
                }, status=404)
            
            # Check if the employer owns this job
            if existing_job.get('employer_id') != employer.id:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to delete this job'
                }, status=403)
            
            # Delete the job
            deleted_job = delete_job(job_id)
            
            return JsonResponse({
                'success': True,
                'message': 'Job deleted successfully',
                'data': deleted_job
            })
            
        except Employer.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Employer profile not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class EmployerJobsView(View):
    def get(self, request):
        """Get all jobs for the authenticated employer"""
        # Get the user from the token
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        # Only employers can view their own jobs
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can access this endpoint'
            }, status=403)
        
        try:
            # Get the employer record
            employer = Employer.objects.get(user=user)
            
            # Get pagination parameters
            page = int(request.GET.get('page', 1))
            per_page = int(request.GET.get('per_page', 10))
            
            # Get the jobs for this employer
            jobs_data = get_jobs_by_employer(employer.id, page, per_page)
            
            return JsonResponse({
                'success': True,
                'data': jobs_data
            })
            
        except Employer.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Employer profile not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)