# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User, Profile, Achievement, News, ClubTeam  # <-- Важно: импорт ClubTeam

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'phone', 'telegram_id', 'is_coach', 'is_student', 
                 'date_of_birth', 'avatar', 'is_active']
        read_only_fields = ['id', 'is_active']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'bio', 'location', 'grade', 'years_of_practice',
                 'parent_name', 'parent_phone', 'medical_notes',
                 'competitions_participated', 'competitions_won',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AchievementSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Achievement
        fields = ['id', 'user', 'user_name', 'title', 'description', 'date']
        read_only_fields = ['id']


class NewsSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = News
        fields = ['id', 'author', 'author_name', 'title', 'content', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']


class ClubTeamSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)
    student_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ClubTeam  # <-- Теперь модель определена
        fields = ['id', 'name', 'coach', 'coach_name', 'students', 
                 'student_count', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']