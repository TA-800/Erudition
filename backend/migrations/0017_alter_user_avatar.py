# Generated by Django 4.1.3 on 2023-01-22 20:21

import backend.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0016_remove_user_is_public_user_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, default='default.png', null=True, upload_to=backend.models.upload_path),
        ),
    ]
