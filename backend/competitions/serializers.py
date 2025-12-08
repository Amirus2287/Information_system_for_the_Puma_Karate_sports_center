from rest_framework import serializers
from .models import (
    Competition, CompetitionCategory,
    CompetitionRegistration, CompetitionResult, TeamCompetitionResult
)

class CompetitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competition
        fields = "__all__"

class CompetitionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetitionCategory
        fields = "__all__"

class CompetitionRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetitionRegistration
        fields = "__all__"

class CompetitionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetitionResult
        fields = "__all__"

class TeamCompetitionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamCompetitionResult
        fields = "__all__"
