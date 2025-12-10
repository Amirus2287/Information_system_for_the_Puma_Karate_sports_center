from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Achievement, Profile, News, ClubTeam

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id","username","email","password","first_name","last_name","phone","is_coach","is_student")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id","username","email","first_name","last_name","phone","is_coach","is_student","is_active")

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = "__all__"

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = "__all__"

class ClubTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubTeam
        fields = "__all__"
