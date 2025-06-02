from django.urls import path
from .views.auth_views import AuthLoginView, EmployerRegisterView, JobseekerRegisterView
from .views.job_views import JobView, EmployerJobsView
from .views.employer_views import (
    EmployerProfileView, 
    EmployerLogoUploadView,
    EmployerCoverUploadView,
    TeamMemberView
)
from .views.saved_job_views import SavedJobView
from .views.job_application_views import JobApplicationView, EmployerApplicationUpdateView
from .views.jobseeker_profile_views import JobseekerProfileView, JobseekerListView, ResumeProfileViewAPI
from .views.challanges_views import ChallengeListView, ChallengeDetailView, ChallengeSubmitView, ChallengeHistoryView, LeaderboardView
from .views.profile_stats import JobseekerApplicationsCountView

urlpatterns = [
    # Auth routes
    path('auth/login/', AuthLoginView.as_view(), name='login'),
    path('auth/register/employer/', EmployerRegisterView.as_view(), name='register_employer'),
    path('auth/register/student/', JobseekerRegisterView.as_view(), name='register_student'),
    
    # Saved jobs routes - placed before general job routes to ensure proper matching
    path('jobs/saved/', SavedJobView.as_view(), name='saved_jobs'),
    path('jobs/saved/<str:job_id>/', SavedJobView.as_view(), name='delete_saved_job'),
    
    # Job applications routes - placed before general job routes to ensure proper matching
    path('jobs/applications/', JobApplicationView.as_view(), name='job_applications'),
    path('jobs/applications/<int:application_id>/', JobApplicationView.as_view(), name='job_application_detail'),
    path('employer/applications/<str:application_id>/update/', EmployerApplicationUpdateView.as_view(), name='employer-application-update'),
    
    # Job routes
    path('jobs/', JobView.as_view(), name='jobs'),
    path('jobs/<str:job_id>/', JobView.as_view(), name='job_detail'),
    path('employer/jobs/', EmployerJobsView.as_view(), name='employer_jobs'),
    
    # Employer profile routes
    path('employer/profile/', EmployerProfileView.as_view(), name='employer_profile'),
    path('employer/logo-upload/', EmployerLogoUploadView.as_view(), name='employer_logo'),
    path('employer/cover-upload/', EmployerCoverUploadView.as_view(), name='employer_cover'),
    
    # Team member routes
    path('employer/team/', TeamMemberView.as_view(), name='team_members'),
    path('employer/team/<int:member_id>/', TeamMemberView.as_view(), name='team_member_detail'),
    
    # Jobseeker profile routes
    path('jobseeker/profile/<int:jobseeker_id>/', JobseekerProfileView.as_view(), name='jobseeker_profile'),
    path('jobseeker/profile/<int:jobseeker_id>/update/', JobseekerProfileView.as_view(), name='jobseeker_profile_update'),
    
    # Resume profile views (analytics)
    path('jobseeker/profile/<int:jobseeker_id>/resume-views/', ResumeProfileViewAPI.as_view(), name='resume_profile_views'),
    
    # Public jobseeker list route (no authentication required)
    path('jobseekers/', JobseekerListView.as_view(), name='jobseekers_list'),
    
    # Challenge routes
    path('challenges/', ChallengeListView.as_view(), name='challenges_list'),
    path('challenges/<int:challenge_id>/', ChallengeDetailView.as_view(), name='challenge_detail'),
    path('challenges/<int:challenge_id>/submit/', ChallengeSubmitView.as_view(), name='challenge_submit'),
    path('challenges/history/', ChallengeHistoryView.as_view(), name='challenge_history'),
    path('challenges/leaderboard/', LeaderboardView.as_view(), name='challenge_leaderboard'),
    
    # Jobseeker stats
    path('jobseeker/stats/', JobseekerApplicationsCountView.as_view(), name='jobseeker_applications_count'),
]