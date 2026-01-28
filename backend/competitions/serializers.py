from rest_framework import serializers
from .models import Competition, CompetitionCategory, CompetitionRegistration, CompetitionResult, TeamCompetitionResult

class CompetitionSerializer(serializers.ModelSerializer):
    visible_groups_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Competition
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from trainings.models import Group
        self.fields['visible_groups'] = serializers.PrimaryKeyRelatedField(
            many=True, 
            queryset=Group.objects.all(), 
            required=False, 
            allow_null=True
        )
    
    def get_visible_groups_names(self, obj):
        return [group.name for group in obj.visible_groups.all()]
    
    def create(self, validated_data):
        visible_groups = validated_data.pop('visible_groups', [])
        competition = Competition.objects.create(**validated_data)
        if visible_groups:
            competition.visible_groups.set(visible_groups)
        return competition
    
    def update(self, instance, validated_data):
        visible_groups = validated_data.pop('visible_groups', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if visible_groups is not None:
            instance.visible_groups.set(visible_groups)
        return instance

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