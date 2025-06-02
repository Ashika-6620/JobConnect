import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from api.models import SavedJob, Jobseeker
from api.utils.jwt_middleware import get_user_from_token
from api.utils.job_storage import get_job_by_id

@method_decorator(csrf_exempt, name='dispatch')
class SavedJobView(View):
    def get(self, request):
        """Get all saved jobs for the authenticated jobseeker"""
        # Get the user from the token
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        # Only jobseekers can view their saved jobs
        if role != 'jobseeker':
            return JsonResponse({
                'success': False,
                'message': 'Only jobseekers can access this endpoint'
            }, status=403)
        
        try:
            # Get the jobseeker record
            jobseeker = Jobseeker.objects.get(user=user)
            
            # Get saved jobs
            saved_jobs = SavedJob.objects.filter(jobseeker=jobseeker).order_by('-saved_at')
            
            # Format the response
            jobs_data = []
            for saved_job in saved_jobs:
                job_detail = get_job_by_id(saved_job.job_id)
                if job_detail:
                    jobs_data.append({
                        'id': saved_job.job_id,
                        'title': saved_job.job_title,
                        'company_name': saved_job.company_name,
                        'saved_at': saved_job.saved_at.isoformat(),
                        'job_detail': job_detail
                    })
            
            return JsonResponse({
                'success': True,
                'data': jobs_data
            })
            
        except Jobseeker.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Jobseeker profile not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def post(self, request):
        """Save a job for the authenticated jobseeker"""
        # Get the user from the token
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        # Only jobseekers can save jobs
        if role != 'jobseeker':
            return JsonResponse({
                'success': False,
                'message': 'Only jobseekers can save jobs'
            }, status=403)
        
        try:
            # Get the jobseeker record
            jobseeker = Jobseeker.objects.get(user=user)
            
            # Parse the request data
            data = json.loads(request.body)
            job_id = data.get('job_id')
            
            if not job_id:
                return JsonResponse({
                    'success': False,
                    'message': 'Job ID is required'
                }, status=400)
            
            # Check if the job exists
            job_detail = get_job_by_id(job_id)
            if not job_detail:
                return JsonResponse({
                    'success': False,
                    'message': 'Job not found'
                }, status=404)
            
            # Check if the job is already saved
            existing_saved_job = SavedJob.objects.filter(jobseeker=jobseeker, job_id=job_id).first()
            if existing_saved_job:
                # If it exists, we'll delete it (toggle save)
                existing_saved_job.delete()
                return JsonResponse({
                    'success': True,
                    'message': 'Job removed from saved jobs',
                    'saved': False
                })
            
            # Create a new saved job
            saved_job = SavedJob.objects.create(
                jobseeker=jobseeker,
                job_id=job_id,
                job_title=job_detail.get('title', ''),
                company_name=job_detail.get('company_name', '')
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Job saved successfully',
                'saved': True,
                'data': {
                    'id': saved_job.job_id,
                    'title': saved_job.job_title,
                    'company_name': saved_job.company_name,
                    'saved_at': saved_job.saved_at.isoformat()
                }
            }, status=201)
            
        except Jobseeker.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Jobseeker profile not found'
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
        """Remove a saved job for the authenticated jobseeker"""
        # Get the user from the token
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        # Only jobseekers can remove saved jobs
        if role != 'jobseeker':
            return JsonResponse({
                'success': False,
                'message': 'Only jobseekers can remove saved jobs'
            }, status=403)
        
        try:
            # Get the jobseeker record
            jobseeker = Jobseeker.objects.get(user=user)
            
            # Check if the saved job exists
            saved_job = SavedJob.objects.filter(jobseeker=jobseeker, job_id=job_id).first()
            if not saved_job:
                return JsonResponse({
                    'success': False,
                    'message': 'Saved job not found'
                }, status=404)
            
            # Delete the saved job
            saved_job.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Job removed from saved jobs'
            })
            
        except Jobseeker.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Jobseeker profile not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
