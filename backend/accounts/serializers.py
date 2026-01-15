# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User, Profile, Achievement, News, ClubTeam  # <-- Важно: импорт ClubTeam

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6, allow_blank=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'phone', 'telegram_id', 'is_coach', 'is_student', 
                 'date_of_birth', 'avatar', 'is_active', 'password']
        read_only_fields = ['id', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'Пароль обязателен для регистрации'})
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


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