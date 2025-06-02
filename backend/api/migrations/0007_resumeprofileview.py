from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ("api", "0006_alter_jobseeker_profile_picture_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="ResumeProfileView",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("viewed_at", models.DateTimeField(auto_now_add=True)),
                ("user_agent", models.CharField(max_length=512, blank=True, null=True)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("jobseeker", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="resume_views", to="api.jobseeker")),
                ("employer", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="viewed_resumes", to="api.employer")),
            ],
            options={
                "ordering": ["-viewed_at"],
                "unique_together": {("jobseeker", "employer", "viewed_at")},
            },
        ),
    ]
