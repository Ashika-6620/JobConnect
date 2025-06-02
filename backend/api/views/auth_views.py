import json
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime
from django.conf import settings

from api.utils.jwt_utils import generate_access_token, generate_refresh_token, verify_token
from api.models import Employer, Jobseeker


def get_full_url(request, path):
    """
    Helper function to get the full URL for media files
    """
    if not path:
        return None
    
    protocol = 'https' if request.is_secure() else 'http'
    domain = request.get_host()
    return f"{protocol}://{domain}{path}"

@method_decorator(csrf_exempt, name='dispatch')
class JobseekerRegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            terms_accepted = data.get('agreeToTerms')
            
            if not all([username, email, password, terms_accepted]):
                return JsonResponse({
                    'success': False,
                    'message': 'Username, email, password, and terms acceptance are required'
                }, status=400)
                
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already exists'
                }, status=400)
                
            if not terms_accepted:
                return JsonResponse({
                    'success': False,
                    'message': 'You must accept the terms and conditions'
                }, status=400)
                
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username,
                    password=password,
                    email=email
                )
                
                # Extract first_name and last_name from username if not provided
                first_name = data.get('first_name', username.split()[0] if ' ' in username else username)
                last_name = data.get('last_name', username.split()[-1] if ' ' in username else '')
                
                jobseeker = Jobseeker.objects.create(
                    user=user,
                    email=email,
                    first_name=first_name,
                    last_name=last_name
                )
                
                profile_picture_url = None
                if jobseeker.profile_picture:
                    profile_picture_url = jobseeker.profile_picture.url
                    
                return JsonResponse({
                    'success': True,
                    'message': 'Jobseeker registered successfully',
                    'data': {
                        'username': user.username,
                        'email': jobseeker.email,
                        'first_name': jobseeker.first_name,
                        'last_name': jobseeker.last_name,
                        'profile_picture': profile_picture_url
                    }
                }, status=201)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class EmployerRegisterView(View):
    def post(self, request):
        try:
            if request.content_type and 'multipart/form-data' in request.content_type:
                company_name = request.POST.get('companyName')
                email = request.POST.get('companyEmail')
                company_size = request.POST.get('companySize')
                company_password = request.POST.get('companyPassword')
                terms_accepted = request.POST.get('agreeToTerms') == 'true'
                industry = request.POST.get('industry')
                founded_year = request.POST.get('founded')
                website = request.POST.get('website')
                location = request.POST.get('location')
                description = request.POST.get('description')
                mission = request.POST.get('mission')
                benefits = request.POST.get('benefits')
                culture = request.POST.get('culture')
                facebook = request.POST.get('facebook')
                twitter = request.POST.get('twitter')
                linkedin = request.POST.get('linkedin')
                instagram = request.POST.get('instagram')
                
                team_members_json = request.POST.get('teamMembers', '[]')
                locations_json = request.POST.get('locations', '[]')
                
                try:
                    team_members = json.loads(team_members_json)
                    locations = json.loads(locations_json)
                except json.JSONDecodeError:
                    team_members = []
                    locations = []
                
                logo = request.FILES.get('logo')
                cover_image = request.FILES.get('coverImage')
            else:
                data = json.loads(request.body)
                company_name = data.get('companyName')
                email = data.get('companyEmail')
                company_size = data.get('companySize')
                company_password = data.get('companyPassword')
                terms_accepted = data.get('agreeToTerms')
                industry = data.get('industry')
                founded_year = data.get('founded')
                website = data.get('website')
                location = data.get('location')
                description = data.get('description')
                mission = data.get('mission')
                benefits = data.get('benefits')
                culture = data.get('culture')
                facebook = data.get('facebook')
                twitter = data.get('twitter')
                linkedin = data.get('linkedin')
                instagram = data.get('instagram')
                team_members = data.get('teamMembers', [])
                locations = data.get('locations', [])
                logo = None
                cover_image = None
            
            if not all([company_name, email, company_size, terms_accepted]):
                return JsonResponse({
                    'success': False,
                    'message': 'Company name, email, company size, and terms acceptance are required'
                }, status=400)
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already exists'
                }, status=400)
            if not terms_accepted:
                return JsonResponse({
                    'success': False,
                    'message': 'You must accept the terms and conditions'
                }, status=400)
            with transaction.atomic():
                user = User.objects.create_user(
                    username=email,
                    password=company_password,
                    email=email
                )
                employer = Employer.objects.create(
                    user=user,
                    company_name=company_name,
                    company_email=email,
                    company_size=company_size,
                    terms_accepted=terms_accepted,
                    industry=industry,
                    founded_year=founded_year,
                    website=website,
                    location=location,
                    description=description,
                    mission=mission,
                    benefits=benefits,
                    culture=culture,
                    facebook=facebook,
                    twitter=twitter,
                    linkedin=linkedin,
                    instagram=instagram,
                    team_members=team_members,
                    locations=locations
                )
                
                if logo:
                    employer.logo = logo
                
                if cover_image:
                    employer.cover_image = cover_image
                
                # Process team members with proper identifiers if any were uploaded
                if team_members:
                    processed_members = []
                    for idx, member in enumerate(team_members):
                        member_id = idx + 1
                        processed_member = {
                            'id': member_id,
                            'name': member.get('name', ''),
                            'position': member.get('position', ''),
                            'bio': member.get('bio', ''),
                            'linkedin': member.get('linkedin', ''),
                            'twitter': member.get('twitter', ''),
                            'avatar': member.get('avatar', '')
                        }
                        processed_members.append(processed_member)
                    employer.team_members = processed_members
                
                employer.profile_completeness = employer.calculate_profile_completeness()
                employer.save()
                 
                logo_url = None
                cover_image_url = None
                
                if employer.logo:
                    logo_url = employer.logo.url
                
                if employer.cover_image:
                    cover_image_url = employer.cover_image.url
                
                return JsonResponse({
                    'success': True,
                    'message': 'Employer registered successfully',
                    'data': {
                        'username': user.username,
                        'company_name': employer.company_name,
                        'company_email': employer.company_email,
                        'company_size': employer.company_size,
                        'logoUrl': logo_url,
                        'coverImageUrl': cover_image_url,
                        'profile_completeness': employer.profile_completeness
                    },
                }, status=201)
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'User does not exist'
            }, status=404)
        except Employer.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Employer does not exist'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)

  
@method_decorator(csrf_exempt, name='dispatch')
class AuthLoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('companyEmail') if data.get('companyEmail') else data.get('email')
            password = data.get('companyPassword') if data.get('companyPassword') else data.get('password')
            user_type = data.get('userType', "jobseeker")

            if not email or not password:
                return JsonResponse({
                    'success': False,
                    'message': 'Email and password are required'
                }, status=400)
            
            if user_type not in ["jobseeker", "employer"]:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid user type'
                }, status=400)
            
            if user_type == "jobseeker":
                thisguy_exists = Jobseeker.objects.filter(email=email).exists()
                if not thisguy_exists:
                    return JsonResponse({
                        'success': False,
                        'message': "You're not registered as a jobseeker yet"
                    }, status=404)
                
                # Try to get the user by email
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    return JsonResponse({
                        'success': False,
                        'message': 'Invalid email or password'
                    }, status=401)
                     
                user = authenticate(username=user.username, password=password)

                if user is None:
                    return JsonResponse({
                        'success': False,
                        'message': 'Invalid email or password'
                    }, status=401)
                
                jobseeker = Jobseeker.objects.get(user=user)
                access_token = generate_access_token(user=user)

                return JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                    'data': {
                        'access_token': access_token,
                        'user_id': user.id,
                        'role': user_type,
                        'email': user.email,
                        'profile_picture': jobseeker.profile_picture.url if jobseeker.profile_picture else None,
                        'first_name': jobseeker.first_name,
                        'last_name': jobseeker.last_name,
                        'profile_completeness': jobseeker.profile_completeness
                    }
                }, status=200)
            
            elif user_type == "employer":
                thisguy_exists = Employer.objects.filter(company_email=email).exists()
                if not thisguy_exists:
                    return JsonResponse({
                        'success': False,
                        'message': "You're not registered as an employer yet"
                    }, status=404)
                
                # Try to get the user by email
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    return JsonResponse({
                        'success': False,
                        'message': 'Invalid email or password'
                    }, status=401)
                    
                # Now authenticate with username
                user = authenticate(username=user.username, password=password)

                if user is None:
                    return JsonResponse({
                        'success': False,
                        'message': 'Invalid email or password'
                    }, status=401)
                
                employer = Employer.objects.get(user=user)
                access_token = generate_access_token(user=user)

                return JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                    'data': {
                        'access_token': access_token,
                        'user_id': user.id,
                        'role': user_type,
                        'email': user.email,
                        'company_name': employer.company_name,
                        'company_size': employer.company_size,
                        'logoUrl': get_full_url(request, employer.logo.url) if employer.logo else None,
                        'coverImageUrl': get_full_url(request, employer.cover_image.url) if employer.cover_image else None,
                        'profile_completeness': employer.profile_completeness
                    }
                }, status=200)
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'User does not exist'
            }, status=404)
        except Employer.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Employer does not exist'
            }, status=404)
        except Jobseeker.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Jobseeker does not exist'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)