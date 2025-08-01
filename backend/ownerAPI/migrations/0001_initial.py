# Generated by Django 5.2.3 on 2025-07-28 17:42

import datetime
import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_owner', models.BooleanField(default=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now)),
                ('owner_name', models.CharField(blank=True, max_length=50)),
                ('phone', models.CharField(blank=True, max_length=20, null=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='OwnerProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('futsal_name', models.CharField(max_length=255)),
                ('location', models.CharField(blank=True, max_length=255, null=True)),
                ('ground_type', models.CharField(choices=[('5A', '5-a-side'), ('7A', '7-a-side'), ('MAT', 'Mat Futsal'), ('TURF', 'Turf'), ('WOOD', 'Wooden Floor')], max_length=10)),
                ('opening_time', models.TimeField(default=datetime.time(5, 0))),
                ('closing_time', models.TimeField(default=datetime.time(22, 0))),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='owner_profile', to='ownerAPI.customuser')),
            ],
        ),
        migrations.CreateModel(
            name='GroundImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='ground_images/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('ground', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ground_images', to='ownerAPI.ownerprofile')),
            ],
        ),
    ]
