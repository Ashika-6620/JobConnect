# Generated by Django 5.2 on 2025-05-20 14:04

import api.models.jobseeker
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_challenge_challengeattempt'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jobseeker',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to=api.models.jobseeker.profile_picture_upload_path),
        ),
        migrations.AlterField(
            model_name='jobseeker',
            name='resume',
            field=models.FileField(blank=True, null=True, upload_to=api.models.jobseeker.resume_upload_path),
        ),
    ]
