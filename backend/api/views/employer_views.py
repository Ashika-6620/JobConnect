import json
import os
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

from api.utils.jwt_middleware import get_user_from_token
from api.models import Employer


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
class EmployerProfileView(View):
    def get(self, request):
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can access this endpoint'
            }, status=403)
        
        try:
            employer = Employer.objects.get(user=user)
             
            profile_completeness = employer.calculate_profile_completeness()
            employer.profile_completeness = profile_completeness
            employer.save()
            
            # Count open positions
            open_positions = employer.jobs.count() if hasattr(employer, 'jobs') else 0
            
            # Format the benefits as a list if it exists
            benefits_list = []
            if employer.benefits:
                benefits_list = [benefit.strip() for benefit in employer.benefits.split('\n') if benefit.strip()]
            
            profile_data = {
                'companyName': employer.company_name,
                'industry': employer.industry or '',
                'companySize': employer.company_size,
                'founded': employer.founded_year or '',
                'website': employer.website or '',
                'location': employer.location or '',
                'description': employer.description or '',
                'mission': employer.mission or '',
                'benefits': employer.benefits or '',
                'benefitsList': benefits_list,
                'culture': employer.culture or '',
                'facebook': employer.facebook or '',
                'twitter': employer.twitter or '',
                'linkedin': employer.linkedin or '',
                'instagram': employer.instagram or '',
                'profileCompleteness': profile_completeness,
                'openPositions': open_positions,
                'locations': employer.locations or [],
                'teamMembers': employer.team_members or [],
                'companyEmail': employer.company_email,
                'logoUrl': get_full_url(request, employer.logo.url) if employer.logo else None,
            }
            
            return JsonResponse({
                'success': True,
                'data': profile_data
            })
            
        except Employer.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Employer profile not found'
            }, status=404)
    
    def put(self, request):
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can access this endpoint'
            }, status=403)
        
        try:
            employer = Employer.objects.get(user=user)
            
            # Handle multipart form data (with file uploads) or JSON data
            content_type = request.headers.get('Content-Type', '')
            
            if 'multipart/form-data' in content_type:
                data = request.POST.dict()
                
                # Update text fields
                if 'companyName' in data:
                    employer.company_name = data['companyName']
                if 'industry' in data:
                    employer.industry = data['industry']
                if 'companySize' in data:
                    employer.company_size = data['companySize']
                if 'founded' in data:
                    employer.founded_year = data['founded']
                if 'website' in data:
                    employer.website = data['website']
                if 'location' in data:
                    employer.location = data['location']
                if 'description' in data:
                    employer.description = data['description']
                if 'mission' in data:
                    employer.mission = data['mission']
                if 'benefits' in data:
                    employer.benefits = data['benefits']
                if 'culture' in data:
                    employer.culture = data['culture']
                if 'facebook' in data:
                    employer.facebook = data['facebook']
                if 'twitter' in data:
                    employer.twitter = data['twitter']
                if 'linkedin' in data:
                    employer.linkedin = data['linkedin']
                if 'instagram' in data:
                    employer.instagram = data['instagram']
                
                # Handle locations as JSON string if provided
                if 'locations' in data and data['locations']:
                    try:
                        employer.locations = json.loads(data['locations'])
                    except json.JSONDecodeError:
                        pass
                
                # Handle team members as JSON string if provided
                if 'teamMembers' in data and data['teamMembers']:
                    try:
                        employer.team_members = json.loads(data['teamMembers'])
                    except json.JSONDecodeError:
                        pass
                
                if 'logo' in request.FILES:
                    if employer.logo:
                        if os.path.isfile(employer.logo.path):
                            os.remove(employer.logo.path)
                    employer.logo = request.FILES['logo']
                
            else:
                # Handle JSON data
                data = json.loads(request.body)
                
                employer.company_name = data.get('companyName', employer.company_name)
                employer.industry = data.get('industry', employer.industry)
                employer.company_size = data.get('companySize', employer.company_size)
                employer.founded_year = data.get('founded', employer.founded_year)
                employer.website = data.get('website', employer.website)
                employer.location = data.get('location', employer.location)
                employer.description = data.get('description', employer.description)
                employer.mission = data.get('mission', employer.mission)
                employer.benefits = data.get('benefits', employer.benefits)
                employer.culture = data.get('culture', employer.culture)
                employer.facebook = data.get('facebook', employer.facebook)
                employer.twitter = data.get('twitter', employer.twitter)
                employer.linkedin = data.get('linkedin', employer.linkedin)
                employer.instagram = data.get('instagram', employer.instagram)
                
                if 'locations' in data:
                    employer.locations = data.get('locations')
                
                if 'teamMembers' in data:
                    employer.team_members = data.get('teamMembers')
            
            employer.save()
            
            # Calculate and update profile completeness
            profile_completeness = employer.calculate_profile_completeness()
            employer.profile_completeness = profile_completeness
            employer.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Profile updated successfully',
                'data': {
                    'profileCompleteness': profile_completeness
                }
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


@method_decorator(csrf_exempt, name='dispatch')
class EmployerTeamMembersView(View):
    def post(self, request):
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can access this endpoint'
            }, status=403)
        
        try:
            employer = Employer.objects.get(user=user)
            data = json.loads(request.body)
            
            name = data.get('name')
            position = data.get('position')
            bio = data.get('bio', '')
            linkedin = data.get('linkedin', '')
            twitter = data.get('twitter', '')
            avatar = data.get('avatar', '')
            
            if not name or not position:
                return JsonResponse({
                    'success': False,
                    'message': 'Name and position are required'
                }, status=400)
            
            # Get current team members or initialize empty list
            team_members = employer.team_members or []
            
            # Add new team member
            new_member = {
                'id': len(team_members) + 1,
                'name': name,
                'position': position,
                'bio': bio,
                'linkedin': linkedin,
                'twitter': twitter,
                'avatar': avatar
            }
            
            team_members.append(new_member)
            employer.team_members = team_members
            employer.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Team member added successfully',
                'data': new_member
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
    
    def delete(self, request, member_id=None):
        if not member_id:
            return JsonResponse({
                'success': False,
                'message': 'Member ID is required'
            }, status=400)
        
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can access this endpoint'
            }, status=403)
        
        try:
            employer = Employer.objects.get(user=user)
            team_members = employer.team_members or []
            
            # Find and remove the team member
            updated_members = [member for member in team_members if member.get('id') != int(member_id)]
            
            if len(updated_members) == len(team_members):
                return JsonResponse({
                    'success': False,
                    'message': f'Team member with ID {member_id} not found'
                }, status=404)
            
            employer.team_members = updated_members
            employer.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Team member deleted successfully'
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
class EmployerLogoUploadView(View):
    def post(self, request):
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can access this endpoint'
            }, status=403)
        
        try:
            employer = Employer.objects.get(user=user)
            
            if 'logo' not in request.FILES:
                return JsonResponse({
                    'success': False,
                    'message': 'No logo file provided'
                }, status=400)
            
            # Delete old logo if exists
            if employer.logo:
                if os.path.isfile(employer.logo.path):
                    os.remove(employer.logo.path)
            
            # Save new logo
            employer.logo = request.FILES['logo']
            employer.save()
            
            # Calculate and update profile completeness
            profile_completeness = employer.calculate_profile_completeness()
            employer.profile_completeness = profile_completeness
            employer.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Logo uploaded successfully',
                'data': {
                    'logoUrl': get_full_url(request, employer.logo.url),
                    'profileCompleteness': profile_completeness
                }
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
class EmployerCoverUploadView(View):
    def post(self, request):
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can access this endpoint'
            }, status=403)
        
        try:
            employer = Employer.objects.get(user=user)
            
            if 'coverImage' not in request.FILES:
                return JsonResponse({
                    'success': False,
                    'message': 'No cover image file provided'
                }, status=400)
            
            # Delete old cover image if exists
            if employer.cover_image:
                if os.path.isfile(employer.cover_image.path):
                    os.remove(employer.cover_image.path)
            
            # Save new cover image
            employer.cover_image = request.FILES['coverImage']
            employer.save()
            
            # Calculate and update profile completeness
            profile_completeness = employer.calculate_profile_completeness()
            employer.profile_completeness = profile_completeness
            employer.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Cover image uploaded successfully',
                'data': {
                    'coverImageUrl': get_full_url(request, employer.cover_image.url),
                    'profileCompleteness': profile_completeness
                }
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
class TeamMemberView(View):
    def post(self, request):
        user, role, error = get_user_from_token(request)
        if error:
            return error
        
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can add team members'
            }, status=403)
            
        try:
            employer = Employer.objects.get(user=user)
            team_members = employer.team_members or []
            
            if request.content_type and 'multipart/form-data' in request.content_type:
                name = request.POST.get('name')
                position = request.POST.get('position')
                bio = request.POST.get('bio', '')
                linkedin = request.POST.get('linkedin', '')
                twitter = request.POST.get('twitter', '')
                avatar_file = request.FILES.get('avatar')
                
                avatar_url = None
                if avatar_file:
                    file_path = f'team_members/{user.id}_{len(team_members) + 1}_{avatar_file.name}'
                    avatar_path = default_storage.save(file_path, ContentFile(avatar_file.read()))
                    avatar_url = default_storage.url(avatar_path)
            else:
                data = json.loads(request.body)
                name = data.get('name')
                position = data.get('position')
                bio = data.get('bio', '')
                linkedin = data.get('linkedin', '')
                twitter = data.get('twitter', '')
                avatar_url = data.get('avatar', '')
            
            if not name or not position:
                return JsonResponse({
                    'success': False,
                    'message': 'Name and position are required'
                }, status=400)
                
            member_id = 1
            if team_members:
                existing_ids = [member.get('id', 0) for member in team_members]
                member_id = max(existing_ids) + 1 if existing_ids else 1
            
            new_member = {
                'id': member_id,
                'name': name,
                'position': position,
                'bio': bio,
                'linkedin': linkedin,
                'twitter': twitter,
                'avatar': avatar_url
            }
            
            team_members.append(new_member)
            employer.team_members = team_members
            employer.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Team member added successfully',
                'data': new_member
            }, status=201)
            
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
            
    def get(self, request):
        user, role, error = get_user_from_token(request)
        if error:
            return error
            
        try:
            employer = Employer.objects.get(user=user)
            team_members = employer.team_members or []
            
            return JsonResponse({
                'success': True,
                'data': team_members
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
            
    def put(self, request, member_id):
        user, role, error = get_user_from_token(request)
        if error:
            return error
            
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can update team members'
            }, status=403)
            
        try:
            employer = Employer.objects.get(user=user)
            team_members = employer.team_members or []
            
            member_index = None
            for idx, member in enumerate(team_members):
                if member.get('id') == int(member_id):
                    member_index = idx
                    break
                    
            if member_index is None:
                return JsonResponse({
                    'success': False,
                    'message': f'Team member with ID {member_id} not found'
                }, status=404)
            
            existing_member = team_members[member_index]
            
            if request.content_type and 'multipart/form-data' in request.content_type:
                name = request.POST.get('name', existing_member.get('name'))
                position = request.POST.get('position', existing_member.get('position'))
                bio = request.POST.get('bio', existing_member.get('bio'))
                linkedin = request.POST.get('linkedin', existing_member.get('linkedin'))
                twitter = request.POST.get('twitter', existing_member.get('twitter'))
                avatar_file = request.FILES.get('avatar')
                
                avatar_url = existing_member.get('avatar')
                if avatar_file:
                    file_path = f'team_members/{user.id}_{member_id}_{avatar_file.name}'
                    avatar_path = default_storage.save(file_path, ContentFile(avatar_file.read()))
                    avatar_url = default_storage.url(avatar_path)
            else:
                data = json.loads(request.body)
                name = data.get('name', existing_member.get('name'))
                position = data.get('position', existing_member.get('position'))
                bio = data.get('bio', existing_member.get('bio'))
                linkedin = data.get('linkedin', existing_member.get('linkedin'))
                twitter = data.get('twitter', existing_member.get('twitter'))
                avatar_url = data.get('avatar', existing_member.get('avatar'))
            
            updated_member = {
                'id': int(member_id),
                'name': name,
                'position': position,
                'bio': bio,
                'linkedin': linkedin,
                'twitter': twitter,
                'avatar': avatar_url
            }
            
            team_members[member_index] = updated_member
            employer.team_members = team_members
            employer.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Team member updated successfully',
                'data': updated_member
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
            
    def delete(self, request, member_id):
        user, role, error = get_user_from_token(request)
        if error:
            return error
            
        if role != 'employer':
            return JsonResponse({
                'success': False,
                'message': 'Only employers can delete team members'
            }, status=403)
            
        try:
            employer = Employer.objects.get(user=user)
            team_members = employer.team_members or []
            
            filtered_members = [member for member in team_members if member.get('id') != int(member_id)]
            
            if len(filtered_members) == len(team_members):
                return JsonResponse({
                    'success': False,
                    'message': f'Team member with ID {member_id} not found'
                }, status=404)
                
            employer.team_members = filtered_members
            employer.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Team member deleted successfully'
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