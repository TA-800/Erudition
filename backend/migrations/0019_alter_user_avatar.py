# Generated by Django 4.1.3 on 2023-01-22 20:35

import backend.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0018_alter_user_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, default='avatars/default/default.png', null=True, upload_to=backend.models.upload_path),
        ),
    ]
