from django.contrib.auth.models import User
from django.http import JsonResponse
from .jwt_utils import verify_token
from api.models import Employer, Jobseeker

def get_user_from_token(request, require_auth=True):
    """
    Helper function to get the authenticated user from JWT token
    
    Args:
        request: The HTTP request
        require_auth: If True, authentication is required. If False, 
                     no error will be returned when no token is provided.
    
    Returns:
        tuple: (user, role, error_response) 
               If require_auth=False and no token provided, returns (None, None, None)
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        if require_auth:
            return None, None, JsonResponse({
                'success': False,
                'message': 'No valid authorization token provided'
            }, status=401)
        else:
            # Authentication is optional, return None for user and role
            return None, None, None
    
    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    
    if not payload:
        if require_auth:
            return None, None, JsonResponse({
                'success': False,
                'message': 'Invalid or expired token'
            }, status=401)
        else:
            # Authentication is optional, return None for user and role
            return None, None, None
    
    try:
        user = User.objects.get(id=payload.get('user_id'))
        
        # Determine if user is employer or jobseeker
        is_employer = Employer.objects.filter(user=user).exists()
        is_jobseeker = Jobseeker.objects.filter(user=user).exists()
        
        role = None
        if is_employer:
            role = 'employer'
        elif is_jobseeker:
            role = 'jobseeker'
        
        if not role and require_auth:
            return None, None, JsonResponse({
                'success': False,
                'message': 'User does not have a valid role'
            }, status=403)
        
        return user, role, None
        
    except User.DoesNotExist:
        if require_auth:
            return None, None, JsonResponse({
                'success': False,
                'message': 'User not found'
            }, status=404)
        else:
            return None, None, None

class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request): 
        skip_paths = [
            '/api/auth/login/',
            '/api/auth/register/',
            '/api/auth/register/student/',
            '/profile_pictures/',
            '/static/',
            '/api/jobs/',
            '/api/jobs/<str:job_id>/',
            '/media/',
            '/jobs/',
        ]

        print(f"Request path: {request.path}")

        if any(request.path.startswith(path) for path in skip_paths):
            return self.get_response(request)
            
        # Skip authentication for OPTIONS requests (CORS preflight)
        if request.method == 'OPTIONS':
            return self.get_response(request)
        
        user, role, error = get_user_from_token(request, require_auth=False)
        
        if error:
            return error
            
        # Add user and role to request
        request.user = user
        request.user_role = role
        
        return self.get_response(request)