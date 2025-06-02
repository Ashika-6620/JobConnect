from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from api.models import JobApplication, Jobseeker
from api.models.profile_views import ResumeProfileView
from api.utils.jwt_middleware import get_user_from_token

@method_decorator(csrf_exempt, name='dispatch')
class JobseekerApplicationsCountView(View):
    def get(self, request):
        user, role, error = get_user_from_token(request)
        if error:
            return error
        if role != 'jobseeker':
            return JsonResponse({
                'success': False,
                'message': 'Only jobseekers can access this endpoint.'
            }, status=403)
        try:
            jobseeker = Jobseeker.objects.get(user=user)
            applications_count = JobApplication.objects.filter(jobseeker=jobseeker).count()
            resume_views_count = ResumeProfileView.objects.filter(jobseeker=jobseeker).count()
            return JsonResponse({
                'success': True,
                'applications_count': applications_count,
                'resume_views_count': resume_views_count
            })
        except Jobseeker.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Jobseeker profile not found.'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
