from django.db import models

class Challenge(models.Model):
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=100)
    difficulty = models.CharField(
        max_length=20,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ],
        default='medium'
    )
    question_count = models.IntegerField(default=5)
    questions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class ChallengeAttempt(models.Model):
    jobseeker = models.ForeignKey('Jobseeker', on_delete=models.CASCADE, related_name='challenge_attempts')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='attempts')
    answers = models.JSONField(default=dict)
    correct_answers = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    points_earned = models.IntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)
    time_taken_seconds = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.jobseeker.user.username} - {self.challenge.title}"
    
    def calculate_points(self):
        difficulty_multiplier = {
            'easy': 1,
            'medium': 2,
            'hard': 3
        }
        
        correct_ratio = self.correct_answers / self.total_questions
        points = int(100 * correct_ratio * difficulty_multiplier.get(self.challenge.difficulty, 1))
        return points
