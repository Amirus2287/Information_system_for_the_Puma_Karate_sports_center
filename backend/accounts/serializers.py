from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User, Profile, Achievement, News, ClubTeam

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6, allow_blank=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'phone', 'telegram_id', 'is_coach', 'is_student', 'is_staff',
                 'date_of_birth', 'avatar', 'is_active', 'password']
        read_only_fields = ['id', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        if value and User.objects.filter(email=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует.')
        return value
    
    def validate_username(self, value):
        if value and User.objects.filter(username=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError('Пользователь с таким именем уже существует.')
        return value
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'Пароль обязателен для регистрации'})
        if validated_data.get('is_staff'):
            validated_data['is_coach'] = True
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        if validated_data.get('is_staff') or instance.is_staff:
            validated_data['is_coach'] = True
        return super().update(instance, validated_data)


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
        read_only_fields = ['id', 'author', 'created_at']
        extra_kwargs = {
            'title': {'required': True},
            'content': {'required': True},
        }
    
    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Заголовок не может быть пустым')
        return value.strip()
    
    def validate_content(self, value):
        if not value:
            raise serializers.ValidationError('Содержание не может быть пустым')
        import re
        text_content = re.sub(r'<[^>]+>', '', value).strip()
        if not text_content:
            raise serializers.ValidationError('Содержание не может быть пустым')
        return value


class ClubTeamSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)
    student_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ClubTeam
        fields = ['id', 'name', 'coach', 'coach_name', 'students', 
                 'student_count', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']