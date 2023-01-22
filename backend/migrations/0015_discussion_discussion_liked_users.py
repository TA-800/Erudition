# Generated by Django 4.1.3 on 2023-01-19 03:21

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0014_rename_discussion_course_discussion_discussion_courses'),
    ]

    operations = [
        migrations.AddField(
            model_name='discussion',
            name='discussion_liked_users',
            field=models.ManyToManyField(blank=True, related_name='liked_discussions', to=settings.AUTH_USER_MODEL),
        ),
    ]