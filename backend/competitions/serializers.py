from rest_framework import serializers
from .models import Competition, CompetitionCategory, CompetitionRegistration, CompetitionResult, TeamCompetitionResult

class CompetitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competition
        fields = '__all__'

class CompetitionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetitionCategory
        fields = '__all__'

class CompetitionRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetitionRegistration
        fields = '__all__'
        read_only_fields = ['user', 'registered_at']

class CompetitionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetitionResult
        fields = '__all__'

class TeamCompetitionResultSerializer(serializers.ModelSerializer):
    competition_name = serializers.CharField(source='competition.name', read_only=True)
    
    class Meta:
        model = TeamCompetitionResult
        fields = ['id', 'competition', 'competition_name', 'team_name', 
                 'score', 'place', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']