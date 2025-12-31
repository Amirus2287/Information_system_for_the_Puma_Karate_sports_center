from rest_framework import serializers
from .models import Journal, ProgressNote, TechniqueRecord

class JournalSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)
    
    class Meta:
        model = Journal
        fields = '__all__'
        read_only_fields = ['created_at']

class ProgressNoteSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)
    
    class Meta:
        model = ProgressNote
        fields = '__all__'
        read_only_fields = ['created_at']

class TechniqueRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = TechniqueRecord
        fields = '__all__'
        read_only_fields = ['date_recorded']