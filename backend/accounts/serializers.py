from rest_framework import serializers
from django.contrib.auth import get_user_model
import re
from .models import User, Profile, Achievement, News

User = get_user_model()


def build_file_url(file_field, request=None):
    if not file_field:
        return None
    try:
        url = file_field.url
    except Exception:
        return None

    if request and url and not url.startswith(('http://', 'https://')):
        return request.build_absolute_uri(url)
    return url


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6, allow_blank=False)
    age = serializers.IntegerField(read_only=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'patronymic',
                 'phone', 'is_coach', 'is_student', 'is_staff',
                 'date_of_birth', 'age', 'avatar', 'is_active', 'password']
        read_only_fields = ['id', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.avatar:
            representation['avatar'] = build_file_url(instance.avatar, self.context.get('request'))
        return representation
    
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
        # Обработка удаления аватарки (пустой файл означает удаление)
        if 'avatar' in validated_data:
            avatar_value = validated_data['avatar']
            # Если передан пустой файл, пустая строка или None, удаляем аватарку
            if avatar_value is None or avatar_value == '' or (hasattr(avatar_value, 'size') and avatar_value.size == 0):
                if instance.avatar:
                    instance.avatar.delete(save=False)
                validated_data['avatar'] = None
        return super().update(instance, validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'bio', 'location', 'grade', 'years_of_practice',
                 'parent_name', 'parent_phone', 'medical_notes', 'medical_insurance',
                 'competitions_participated', 'competitions_won',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Убеждаемся, что вложенный UserSerializer получает контекст
        if 'user' in representation and isinstance(representation['user'], dict):
            user_serializer = UserSerializer(instance.user, context=self.context)
            representation['user'] = user_serializer.data
        return representation


class AchievementSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Achievement
        fields = ['id', 'user', 'user_name', 'title', 'description', 'date', 'image']
        read_only_fields = ['id']
    
    def update(self, instance, validated_data):
        # Обработка удаления изображения
        if 'image' in validated_data:
            image_value = validated_data['image']
            # Если передан пустой файл, пустая строка или None, удаляем изображение
            if image_value is None or image_value == '' or (hasattr(image_value, 'size') and image_value.size == 0):
                if instance.image:
                    instance.image.delete(save=False)
                validated_data['image'] = None
        return super().update(instance, validated_data)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = build_file_url(instance.image, self.context.get('request'))
        return representation


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
        text_content = re.sub(r'<[^>]+>', '', value).strip()
        if not text_content:
            raise serializers.ValidationError('Содержание не может быть пустым')
        return value
