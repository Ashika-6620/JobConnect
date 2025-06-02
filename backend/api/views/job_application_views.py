import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import models

from api.models import JobApplication, Jobseeker, Employer, Job
from api.utils.jwt_middleware import get_user_from_token
from api.utils.job_storage import get_job_by_id

@method_decorator(csrf_exempt, name='dispatch')
class JobApplicationView(View):
    def get(self, request):
        """Get all job applications for the authenticated jobseeker OR employer"""
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        applications_data = []
        
        if role == 'jobseeker':
            try:
                # Get the jobseeker record
                jobseeker = Jobseeker.objects.get(user=user)
                
                # Get applications
                applications = JobApplication.objects.filter(jobseeker=jobseeker).order_by('-applied_at')
                
                # Format the response
                for application in applications:
                    job_detail = get_job_by_id(application.job_id)
                    applications_data.append({
                        'id': application.id,
                        'job_id': application.job_id,
                        'status': application.status,
                        'applied_at': application.applied_at.isoformat(),
                        'updated_at': application.updated_at.isoformat(),
                        'job_title': application.job_title,
                        'company_name': application.company_name,
                        'job_detail': job_detail
                    })
                
                return JsonResponse({
                    'success': True,
                    'data': applications_data
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

        elif role == 'employer':
            try:
                employer = Employer.objects.get(user=user)
                
                # For debugging
                print(f"Employer company name: {employer.company_name}")
                
                # Get all applications for this employer by matching company name
                applications = JobApplication.objects.filter(
                    company_name__iexact=employer.company_name
                ).order_by('-applied_at')
                
                # Debug what applications we found
                print(f"Found {applications.count()} applications by company name")
                
                # Also get applications for employer's jobs (UUID or ID)
                employer_jobs = Job.objects.filter(employer=employer)
                job_ids = [str(job.id) for job in employer_jobs]
                print(f"Employer job IDs: {job_ids}")
                
                # Use | operator to combine querysets
                applications_by_job = JobApplication.objects.filter(job_id__in=job_ids).order_by('-applied_at')
                print(f"Found {applications_by_job.count()} applications by job ID")
                
                # Combine both querysets
                applications = (applications | applications_by_job).distinct()

                for application in applications:
                    jobseeker_profile = application.jobseeker
                    job_detail = get_job_by_id(application.job_id)
                    
                    if not job_detail:
                        try:
                            local_job = Job.objects.get(id=application.job_id, employer=employer)
                            job_detail = {
                                'title': local_job.title,
                                'company_name': local_job.employer.company_name,
                            }
                        except Job.DoesNotExist:
                            job_detail = {
                                'title': application.job_title,
                                'company_name': application.company_name
                            }

                    applications_data.append({
                        'id': application.id,
                        'job_id': application.job_id,
                        'job_title': application.job_title,
                        'company_name': application.company_name,
                        'status': application.status,
                        'applied_at': application.applied_at.isoformat(),
                        'updated_at': application.updated_at.isoformat(),
                        'job_detail': job_detail,
                        'jobseeker_info': {
                            'id': jobseeker_profile.id,
                            'first_name': jobseeker_profile.user.first_name,
                            'last_name': jobseeker_profile.user.last_name,
                            'email': jobseeker_profile.user.email,
                        },
                        'cover_letter': application.cover_letter,
                        'resume_url': request.build_absolute_uri(application.resume.url) if application.resume else None
                    })
                return JsonResponse({'success': True, 'data': applications_data})
            except Employer.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Employer profile not found'}, status=404)
            except Exception as e:
                return JsonResponse({'success': False, 'message': f'Error fetching applications for employer: {str(e)}'}, status=500)
        
        else:
            return JsonResponse({
                'success': False,
                'message': 'Invalid role'
            }, status=403)

    def post(self, request):
        """Apply for a job as the authenticated jobseeker"""
        # Get the user from the token
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        # Only jobseekers can apply for jobs
        if role != 'jobseeker':
            return JsonResponse({
                'success': False,
                'message': 'Only jobseekers can apply for jobs'
            }, status=403)
        
        try:
            # Get the jobseeker record
            jobseeker = Jobseeker.objects.get(user=user)
            
            # Parse the request data
            data = json.loads(request.body)
            job_id = data.get('job_id')
            cover_letter = data.get('cover_letter', '')
            
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
            
            # Check if already applied
            existing_application = JobApplication.objects.filter(jobseeker=jobseeker, job_id=job_id).first()
            if existing_application:
                return JsonResponse({
                    'success': False,
                    'message': 'You have already applied for this job',
                    'data': {
                        'id': existing_application.id,
                        'status': existing_application.status,
                        'applied_at': existing_application.applied_at.isoformat()
                    }
                }, status=400)
            
            # Create a new application
            application = JobApplication.objects.create(
                jobseeker=jobseeker,
                job_id=job_id,
                job_title=job_detail.get('title', ''),
                company_name=job_detail.get('company_name', ''),
                cover_letter=cover_letter,
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Application submitted successfully',
                'data': {
                    'id': application.id,
                    'job_id': application.job_id,
                    'status': application.status,
                    'applied_at': application.applied_at.isoformat()
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

    def put(self, request, application_id):
        """Update an application status (withdraw by jobseeker or update by employer)"""
        # Get the user from the token
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        try:
            data = json.loads(request.body)
            status = data.get('status')

            if not status or status not in [choice[0] for choice in JobApplication.STATUS_CHOICES]:
                return JsonResponse({
                    'success': False,
                    'message': 'Valid status is required'
                }, status=400)

            if role == 'jobseeker':
                jobseeker = Jobseeker.objects.get(user=user)
                application = JobApplication.objects.filter(id=application_id, jobseeker=jobseeker).first()
                if not application:
                    return JsonResponse({'success': False, 'message': 'Application not found or not owned by jobseeker'}, status=404)
                if status != 'withdrawn':
                    return JsonResponse({'success': False, 'message': 'Jobseekers can only withdraw applications'}, status=403)
            
            elif role == 'employer':
                employer = Employer.objects.get(user=user)
                application = JobApplication.objects.filter(id=application_id).first()
                if not application:
                    return JsonResponse({'success': False, 'message': 'Application not found'}, status=404)
                try:
                    job = Job.objects.filter(employer=employer).filter(
                        models.Q(id=application.job_id) | models.Q(id=str(application.job_id))
                    ).first()
                    if not job and application.company_name != employer.company_name:
                        return JsonResponse({'success': False, 'message': 'Application does not belong to one of your jobs'}, status=403)
                except Exception:
                    if application.company_name != employer.company_name:
                        return JsonResponse({'success': False, 'message': 'Application does not belong to one of your jobs'}, status=403)
                allowed_employer_statuses = ['reviewing', 'interview', 'offered', 'rejected']
                if status not in allowed_employer_statuses:
                    return JsonResponse({'success': False, 'message': f'Employers can only set status to: {", ".join(allowed_employer_statuses)}'}, status=403)

            else:
                return JsonResponse({'success': False, 'message': 'Invalid role for updating application'}, status=403)

            if not application:
                return JsonResponse({'success': False, 'message': 'Application not found'}, status=404)

            application.status = status
            application.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Application status updated successfully',
                'data': {
                    'id': application.id,
                    'status': application.status,
                    'updated_at': application.updated_at.isoformat()
                }
            })
            
        except Jobseeker.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Jobseeker profile not found'}, status=404)
        except Employer.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Employer profile not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class EmployerApplicationUpdateView(View):
    def put(self, request, application_id):
        """Allow an employer to update the status of a specific job application."""
        user, role, error = get_user_from_token(request)
        if error:
            return error

        if role != 'employer':
            return JsonResponse({'success': False, 'message': 'Only employers can update job applications.'}, status=403)

        try:
            employer = Employer.objects.get(user=user)
            data = json.loads(request.body)
            new_status = data.get('status')

            if not new_status or new_status not in [choice[0] for choice in JobApplication.STATUS_CHOICES]:
                return JsonResponse({'success': False, 'message': 'Valid status is required.'}, status=400)
            
            restricted_statuses_for_employer = ['applied', 'accepted', 'withdrawn']
            if new_status in restricted_statuses_for_employer:
                 return JsonResponse({'success': False, 'message': f'Employers cannot set status to {new_status}.'}, status=400)

            application = JobApplication.objects.select_related('jobseeker__user').get(id=application_id)

            try:
                # Try to find a job with the same ID or string representation of ID
                job = Job.objects.filter(employer=employer).filter(
                    models.Q(id=application.job_id) | models.Q(id=str(application.job_id))
                ).first()
                
                if not job and application.company_name != employer.company_name:
                    return JsonResponse({'success': False, 'message': 'Application not found or not associated with your jobs.'}, status=404)
            except Exception:
                if application.company_name != employer.company_name:
                    return JsonResponse({'success': False, 'message': 'Application not found or not associated with your jobs.'}, status=404)

            application.status = new_status
            application.save()

            return JsonResponse({
                'success': True,
                'message': 'Application status updated successfully.',
                'data': {
                    'id': application.id,
                    'job_id': application.job_id,
                    'job_title': application.job_title,
                    'status': application.status,
                    'updated_at': application.updated_at.isoformat(),
                    'jobseeker': {
                        'id': application.jobseeker.id,
                        'name': f"{application.jobseeker.user.first_name} {application.jobseeker.user.last_name}",
                        'email': application.jobseeker.user.email
                    }
                }
            })

        except Employer.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Employer profile not found.'}, status=404)
        except JobApplication.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Application not found.'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON data.'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
