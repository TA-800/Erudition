# Generated by Django 4.1.3 on 2023-01-25 02:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0021_alter_user_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='field',
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name='user',
            name='year',
            field=models.IntegerField(default=1),
        ),
    ]
