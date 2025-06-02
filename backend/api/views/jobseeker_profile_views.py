import json
import os  # Make sure we have this import for directory operations
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

from api.models import Jobseeker
from api.models.profile_views import ResumeProfileView
from api.models.employer import Employer
from api.utils.jwt_utils import verify_token

@method_decorator(csrf_exempt, name='dispatch')
class JobseekerProfileView(View):
    def get(self, request, jobseeker_id):
        try:
            is_public_view = request.GET.get('public', 'false').lower() == 'true'
            
            if not is_public_view:
                # Check if the request has a valid token for authenticated view
                auth_header = request.headers.get('Authorization', '')
                if not auth_header.startswith('Bearer '):
                    return JsonResponse({
                        'success': False,
                        'message': 'Authorization header is missing or invalid'
                    }, status=401)
                    
                token = auth_header.split(' ')[1]
                payload = verify_token(token)
                
                if not payload:
                    return JsonResponse({
                        'success': False,
                        'message': 'Invalid or expired token'
                    }, status=401)
                    
                # Verify that the token belongs to the correct user or is admin
                requesting_user_id = payload.get('user_id')
            
            # Check if the user exists - look up by user ID (jobseeker_id parameter is the user ID)
            try:
                jobseeker = Jobseeker.objects.get(user__id=jobseeker_id)
            except Jobseeker.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Jobseeker not found'
                }, status=404)
                
            # Authentication check for non-public views
            if not is_public_view:
                # Only allow users to view their own profile 
                # or admins to view any profile
                if int(requesting_user_id) != jobseeker.user.id:
                    user = User.objects.get(id=requesting_user_id)
                    if not user.is_staff and not user.is_superuser:
                        return JsonResponse({
                            'success': False,
                            'message': 'You are not authorized to view this profile'
                        }, status=403)
                    
            # Prepare profile data
            profile_data = {
                'id': jobseeker.id,
                'user_id': jobseeker.user.id,
                'email': jobseeker.email,
                'first_name': jobseeker.first_name,
                'last_name': jobseeker.last_name,
                'profile_picture': jobseeker.profile_picture.url if jobseeker.profile_picture else None,
                'bio': jobseeker.bio,
                'phone': jobseeker.phone,
                'location': jobseeker.location,
                'skills': jobseeker.skills,
                'education': jobseeker.education,
                'experience': jobseeker.experience,
                'linkedin_url': jobseeker.linkedin_url,
                'github_url': jobseeker.github_url,
                'portfolio_url': jobseeker.portfolio_url,
                'resume': jobseeker.resume.url if jobseeker.resume else None,
                'profile_completeness': jobseeker.profile_completeness,
                'created_at': jobseeker.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': jobseeker.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            }
                
            return JsonResponse({
                'success': True,
                'data': profile_data
            })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
            
    def post(self, request, jobseeker_id):
        try:
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return JsonResponse({
                    'success': False,
                    'message': 'Authorization header is missing or invalid'
                }, status=401)
                
            token = auth_header.split(' ')[1]
            payload = verify_token(token)
            resume = None
            profile_picture = None
            
            if not payload:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid or expired token'
                }, status=401)
                
            requesting_user_id = payload.get('user_id')
            
            try:
                jobseeker = Jobseeker.objects.get(user__id=jobseeker_id)
            except Jobseeker.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Jobseeker not found'
                }, status=404)
                
            if int(requesting_user_id) != jobseeker.user.id:
                user = User.objects.get(id=requesting_user_id)
                if not user.is_staff and not user.is_superuser:
                    return JsonResponse({
                        'success': False,
                        'message': 'You are not authorized to update this profile'
                    }, status=403)
            
       
            if request.content_type and 'multipart/form-data' in request.content_type:
                request._load_post_and_files()
                data = request.POST
                profile_picture = request.FILES.get('profile_picture')
                resume = request.FILES.get('resume')

                print(f"Parsed POST data: {data}")
                print(f"Parsed FILES: {request.FILES}")
                
                
                skills = json.loads(data.get('skills', '[]'))
                education = json.loads(data.get('education', '[]'))
                experience = json.loads(data.get('experience', '[]'))
            else:
                print("Handling JSON data")
                data = json.loads(request.body)
                profile_picture = None
                resume = None
                
                skills = data.get('skills', [])
                education = data.get('education', [])
                experience = data.get('experience', [])
            
            if data.get('first_name'):
                jobseeker.first_name = data.get('first_name')
            if data.get('last_name'):
                jobseeker.last_name = data.get('last_name')
            if data.get('phone'):
                jobseeker.phone = data.get('phone')
            if data.get('location'):
                jobseeker.location = data.get('location')
            if data.get('bio'):
                jobseeker.bio = data.get('bio')
            if data.get('title'):
                jobseeker.title = data.get('title')
                
            if data.get('linkedin_url'):
                jobseeker.linkedin_url = data.get('linkedin_url')
            if data.get('github_url'):
                jobseeker.github_url = data.get('github_url')
            if data.get('portfolio_url'):
                jobseeker.portfolio_url = data.get('portfolio_url')
                
            if skills:
                jobseeker.skills = skills
            if education:
                jobseeker.education = education
            if experience:
                jobseeker.experience = experience
                 
            if profile_picture:
                jobseeker.profile_picture = profile_picture

            if resume:
                print(f"Resume file received: {resume.name}, size: {resume.size}")
                try: 
                    upload_path = f"resumes/{jobseeker.user.id}/"
                    os.makedirs(os.path.join(settings.MEDIA_ROOT, upload_path), exist_ok=True)
                     
                    if jobseeker.resume:
                        print(f"Deleting old resume: {jobseeker.resume.path}")
                        jobseeker.resume.delete(save=False)
                     
                    print(f"Setting new resume: {resume}")
                    jobseeker.resume = resume
                    print(f"Resume assigned to model: {jobseeker.resume}")
                except Exception as e:
                    print(f"Error saving resume: {str(e)}")
                    return JsonResponse({
                        'success': False,
                        'message': f"Error saving resume: {str(e)}"
                    }, status=500)
                
            jobseeker.save()
             
            response_data = {
                'success': True,
                'message': 'Profile updated successfully',
                'data': {
                    'profile_completeness': jobseeker.profile_completeness,
                }
            }
            
            if jobseeker.resume:
                try:
                    response_data['data']['resume'] = jobseeker.resume.url
                    print(f"Resume URL in response: {jobseeker.resume.url}")
                except Exception as e:
                    print(f"Error getting resume URL: {str(e)}")
                    response_data['data']['resume'] = None
            else:
                response_data['data']['resume'] = None
                print("No resume URL to include in response")
                
            return JsonResponse(response_data)
                
        except Exception as e:
            print(f"Profile update error: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class JobseekerListView(View):
    def get(self, request):
        try:
            # Get all jobseekers
            jobseekers = Jobseeker.objects.all()
            
            # Prepare the response data with all jobseekers
            jobseeker_list = []
            
            for jobseeker in jobseekers:
                # Get full URL for profile picture
                profile_picture_url = None
                if jobseeker.profile_picture:
                    profile_picture_url = request.build_absolute_uri(f'{settings.MEDIA_URL}{jobseeker.profile_picture}')
                
                # Prepare resume URL if available
                resume_url = None
                if jobseeker.resume:
                    resume_url = request.build_absolute_uri(f'{settings.MEDIA_URL}{jobseeker.resume}')
                
                # Get the top skills (limited to first 5)
                skills = jobseeker.skills[:5] if jobseeker.skills else []
                
                # Get latest experience
                latest_experience = None
                if jobseeker.experience and len(jobseeker.experience) > 0:
                    # Sort experiences by start date (newest first)
                    sorted_experiences = sorted(
                        jobseeker.experience, 
                        key=lambda x: x.get('startDate', ''), 
                        reverse=True
                    )
                    if sorted_experiences:
                        latest_experience = sorted_experiences[0]
                
                # Get latest education
                latest_education = None
                if jobseeker.education and len(jobseeker.education) > 0:
                    # Sort education by start date (newest first)
                    sorted_education = sorted(
                        jobseeker.education, 
                        key=lambda x: x.get('startDate', ''), 
                        reverse=True
                    )
                    if sorted_education:
                        latest_education = sorted_education[0]
                
                jobseeker_info = {
                    'id': jobseeker.id,
                    'user_id': jobseeker.user.id,
                    'first_name': jobseeker.first_name,
                    'last_name': jobseeker.last_name,
                    'email': jobseeker.email,
                    'profile_picture': profile_picture_url,
                    'bio': jobseeker.bio,
                    'phone': jobseeker.phone,
                    'location': jobseeker.location,
                    'skills': skills,
                    'skills_count': len(jobseeker.skills) if jobseeker.skills else 0,
                    'latest_experience': latest_experience,
                    'latest_education': latest_education,
                    'linkedin_url': jobseeker.linkedin_url,
                    'github_url': jobseeker.github_url,
                    'portfolio_url': jobseeker.portfolio_url,
                    'resume_url': resume_url,
                    'profile_completeness': jobseeker.profile_completeness,
                }
                
                jobseeker_list.append(jobseeker_info)
            
            return JsonResponse({
                'success': True,
                'data': jobseeker_list
            })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ResumeProfileViewAPI(View):
    def post(self, request, jobseeker_id):
        """
        Record a resume view by an employer. Requires employer authentication.
        """
        try:
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return JsonResponse({'success': False, 'message': 'Authorization header is missing or invalid'}, status=401)
            token = auth_header.split(' ')[1]
            payload = verify_token(token)
            if not payload:
                return JsonResponse({'success': False, 'message': 'Invalid or expired token'}, status=401)
            requesting_user_id = payload.get('user_id')
            user = User.objects.get(id=requesting_user_id)
            # Only allow employers
            try:
                employer = Employer.objects.get(user=user)
            except Employer.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Only employers can view resumes.'}, status=403)
            try:
                jobseeker = Jobseeker.objects.get(user__id=jobseeker_id)
            except Jobseeker.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Jobseeker not found'}, status=404)
            # Record the view
            ResumeProfileView.objects.create(
                jobseeker=jobseeker,
                employer=employer,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                ip_address=request.META.get('REMOTE_ADDR', None),
            )
            return JsonResponse({'success': True, 'message': 'Resume view recorded.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

    def get(self, request, jobseeker_id):
        """
        Get all resume views for a jobseeker (for analytics, only for jobseeker or admin)
        """
        try:
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return JsonResponse({'success': False, 'message': 'Authorization header is missing or invalid'}, status=401)
            token = auth_header.split(' ')[1]
            payload = verify_token(token)
            if not payload:
                return JsonResponse({'success': False, 'message': 'Invalid or expired token'}, status=401)
            requesting_user_id = payload.get('user_id')
            user = User.objects.get(id=requesting_user_id)
            try:
                jobseeker = Jobseeker.objects.get(user__id=jobseeker_id)
            except Jobseeker.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Jobseeker not found'}, status=404)
            # Only allow the jobseeker themselves or admin
            if user.id != jobseeker.user.id and not user.is_staff and not user.is_superuser:
                return JsonResponse({'success': False, 'message': 'Not authorized.'}, status=403)
            views = ResumeProfileView.objects.filter(jobseeker=jobseeker).order_by('-viewed_at')
            data = [
                {
                    'employer_id': v.employer.id,
                    'employer_name': v.employer.company_name,
                    'viewed_at': v.viewed_at,
                    'user_agent': v.user_agent,
                    'ip_address': v.ip_address,
                }
                for v in views
            ]
            return JsonResponse({'success': True, 'count': len(data), 'views': data})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
