from rest_framework import serializers
from .models import Gym, Group, Training, Homework, Attendance, GroupStudent

class GymSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gym
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    gym_address = serializers.CharField(source='gym.address', read_only=True)
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'coach', 'coach_name', 'gym', 'gym_name', 'gym_address', 'student_count']
    
    def get_student_count(self, obj):
        return obj.students.filter(is_active=True).count()

class TrainingSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    coach_name = serializers.CharField(source='group.coach.get_full_name', read_only=True)
    gym_name = serializers.CharField(source='group.gym.name', read_only=True)
    gym_address = serializers.CharField(source='group.gym.address', read_only=True)
    
    class Meta:
        model = Training
        fields = ['id', 'group', 'group_name', 'coach_name', 'gym_name', 'gym_address', 
                 'date', 'time', 'topic', 'created_at']
        read_only_fields = ['created_at']

class HomeworkSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    training_date = serializers.SerializerMethodField()
    training_topic = serializers.SerializerMethodField()
    
    class Meta:
        model = Homework
        fields = ['id', 'training', 'training_date', 'training_topic', 'student', 
                 'student_name', 'task', 'deadline', 'completed', 'created_at']
        read_only_fields = ['created_at']
    
    def get_training_date(self, obj):
        return obj.training.date if obj.training else None
    
    def get_training_topic(self, obj):
        return obj.training.topic if obj.training else None

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    training_date = serializers.DateField(source='training.date', read_only=True)
    training_time = serializers.TimeField(source='training.time', read_only=True)
    training_topic = serializers.CharField(source='training.topic', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'training', 'training_date', 'training_time', 'training_topic',
                 'student', 'student_name', 'present', 'notes', 'created_at']
        read_only_fields = ['created_at']

class GroupStudentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    student_first_name = serializers.CharField(source='student.first_name', read_only=True)
    student_last_name = serializers.CharField(source='student.last_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    
    class Meta:
        model = GroupStudent
        fields = ['id', 'group', 'group_name', 'student', 'student_name', 
                 'student_first_name', 'student_last_name', 'student_email',
                 'joined_date', 'is_active']
        read_only_fields = ['joined_date']