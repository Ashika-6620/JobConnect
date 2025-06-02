import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404

from api.models import Challenge, ChallengeAttempt, Jobseeker
from api.utils.jwt_utils import verify_token

@method_decorator(csrf_exempt, name='dispatch')
class ChallengeListView(View):
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = verify_token(token)
        
        if not payload:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        
        challenges = Challenge.objects.all().values(
            'id', 'title', 'topic', 'difficulty', 'question_count', 'created_at'
        )
        
        challenge_list = list(challenges)
        
        for challenge in challenge_list:
            solved_count = ChallengeAttempt.objects.filter(challenge_id=challenge['id']).count()
            challenge['solved_count'] = solved_count
        
        return JsonResponse({'challenges': challenge_list})

    def post(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = verify_token(token)
        
        if not payload:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        
        try:
            data = json.loads(request.body)
            title = data.get('title')
            topic = data.get('topic')
            difficulty = data.get('difficulty')
            questions = data.get('questions', [])
            
            challenge = Challenge(
                title=title,
                topic=topic,
                difficulty=difficulty,
                question_count=len(questions),
                questions=questions
            )
            challenge.save()
            
            return JsonResponse({
                'id': challenge.id,
                'title': challenge.title,
                'topic': challenge.topic,
                'difficulty': challenge.difficulty,
                'question_count': challenge.question_count,
            }, status=201)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class ChallengeDetailView(View):
    def get(self, request, challenge_id):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = verify_token(token)
        
        if not payload:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        
        try:
            challenge = Challenge.objects.get(id=challenge_id)
            
            questions = []
            for question in challenge.questions:
                question_copy = question.copy()
                question_copy.pop('correctAnswer', None)
                questions.append(question_copy)
            
            challenge_data = {
                'id': challenge.id,
                'title': challenge.title,
                'topic': challenge.topic,
                'difficulty': challenge.difficulty,
                'questions': questions
            }
            
            return JsonResponse({'challenge': challenge_data})
        
        except Challenge.DoesNotExist:
            return JsonResponse({'error': 'Challenge not found'}, status=404)

@method_decorator(csrf_exempt, name='dispatch')
class ChallengeSubmitView(View):
    def post(self, request, challenge_id):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = verify_token(token)
        
        if not payload:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        
        try:
            data = json.loads(request.body)
            answers = data.get('answers', {})
            time_taken = data.get('time_taken', 0)
            
            user_id = payload.get('user_id')
            jobseeker = get_object_or_404(Jobseeker, user_id=user_id)
            challenge = get_object_or_404(Challenge, id=challenge_id)
            
            correct_answers = 0
            for question in challenge.questions:
                question_id = question.get('id')
                correct_answer = question.get('correctAnswer')
                user_answer = answers.get(question_id)
                
                if user_answer == correct_answer:
                    correct_answers += 1
            
            total_questions = len(challenge.questions)
            
            attempt = ChallengeAttempt(
                jobseeker=jobseeker,
                challenge=challenge,
                answers=answers,
                correct_answers=correct_answers,
                total_questions=total_questions,
                time_taken_seconds=time_taken
            )
            
            points = attempt.calculate_points()
            attempt.points_earned = points
            attempt.save()
            
            result = {
                'correct_answers': correct_answers,
                'total_questions': total_questions,
                'points_earned': points,
                'time_taken': time_taken
            }
            
            return JsonResponse({'result': result})
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class ChallengeHistoryView(View):
    def get(self, request):
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = verify_token(token)
        
        if not payload:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        
        try:
            user_id = payload.get('user_id')
            jobseeker = get_object_or_404(Jobseeker, user_id=user_id)
            
            attempts = ChallengeAttempt.objects.filter(jobseeker=jobseeker).select_related('challenge')
            
            history = []
            for attempt in attempts:
                history.append({
                    'id': attempt.id,
                    'challenge_id': attempt.challenge.id,
                    'challenge_title': attempt.challenge.title,
                    'challenge_topic': attempt.challenge.topic,
                    'challenge_difficulty': attempt.challenge.difficulty,
                    'correct_answers': attempt.correct_answers,
                    'total_questions': attempt.total_questions,
                    'points_earned': attempt.points_earned,
                    'time_taken_seconds': attempt.time_taken_seconds,
                    'completed_at': attempt.completed_at.isoformat()
                })
            
            return JsonResponse({'history': history})
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class LeaderboardView(View):
    def get(self, request):
        try:
            from django.db.models import Sum
            leaderboard = (
                ChallengeAttempt.objects.values(
                    'jobseeker__user__id',
                    'jobseeker__user__username',
                    'jobseeker__first_name',
                    'jobseeker__last_name',
                    'jobseeker__profile_picture',
                    'jobseeker__profile_completeness',
                )
                .annotate(total_points=Sum('points_earned'))
                .order_by('-total_points')
            )
            leaderboard_list = []
            user_id = None
            if request.GET.get('user_id'):
                user_id = str(request.GET.get('user_id'))
            user_rank = None
            for idx, entry in enumerate(leaderboard):
                leaderboard_list.append({
                    'user_id': entry['jobseeker__user__id'],
                    'username': entry['jobseeker__user__username'],
                    'first_name': entry['jobseeker__first_name'],
                    'last_name': entry['jobseeker__last_name'],
                    'profile_picture': entry['jobseeker__profile_picture'],
                    'profile_completeness': entry['jobseeker__profile_completeness'],
                    'total_points': entry['total_points'] or 0,
                })
                if user_id and str(entry['jobseeker__user__id']) == user_id:
                    user_rank = idx + 1
            return JsonResponse({'leaderboard': leaderboard_list[:50], 'user_rank': user_rank})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)