from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Gym, Group, Training, Homework, Attendance, GroupStudent
from .serializers import (
    GymSerializer, GroupSerializer, TrainingSerializer, 
    HomeworkSerializer, AttendanceSerializer, GroupStudentSerializer
)
from accounts.permissions import IsCoachOrAdmin

class GymViewSet(viewsets.ModelViewSet):
    queryset = Gym.objects.all()
    serializer_class = GymSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'address']

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['coach', 'gym']
    search_fields = ['name']
    
    def get_queryset(self):
        user = self.request.user
        # Администратор автоматически является тренером
        is_coach = user.is_coach or user.is_staff
        if user.is_student and not is_coach:
            # Ученики видят только группы, в которых они состоят
            return Group.objects.filter(students__student=user, students__is_active=True).distinct()
        elif is_coach and not user.is_staff:
            # Тренеры (не админы) видят только свои группы
            return Group.objects.filter(coach=user)
        # Администраторы видят все группы
        return Group.objects.all()

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['group', 'date']
    ordering_fields = ['date', 'time']
    ordering = ['-date', '-time']
    
    def get_queryset(self):
        user = self.request.user
        # Администратор автоматически является тренером
        is_coach = user.is_coach or user.is_staff
        
        queryset = Training.objects.all()
        
        # Фильтрация по дате
        date_after = self.request.query_params.get('date_after')
        date_before = self.request.query_params.get('date_before')
        
        if date_after:
            queryset = queryset.filter(date__gte=date_after)
        if date_before:
            queryset = queryset.filter(date__lte=date_before)
        
        if user.is_student and not is_coach:
            # Ученики видят тренировки своих групп
            queryset = queryset.filter(
                group__students__student=user, 
                group__students__is_active=True
            ).distinct()
        elif is_coach and not user.is_staff:
            # Тренеры (не админы) видят тренировки своих групп
            queryset = queryset.filter(group__coach=user)
        # Администраторы видят все тренировки (уже отфильтрованные по дате)
        
        return queryset

class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['training', 'student', 'completed']
    ordering_fields = ['deadline', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        # Администратор автоматически является тренером
        is_coach = user.is_coach or user.is_staff
        if user.is_student and not is_coach:
            # Ученики видят только свои домашние задания
            return Homework.objects.filter(student=user)
        elif is_coach and not user.is_staff:
            # Тренеры (не админы) видят домашние задания учеников своих групп
            return Homework.objects.filter(
                training__group__coach=user
            )
        # Администраторы видят все домашние задания
        return Homework.objects.all()

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['training', 'student', 'present']
    ordering_fields = ['training__date']
    ordering = ['-training__date']
    
    def get_queryset(self):
        user = self.request.user
        # Администратор автоматически является тренером
        is_coach = user.is_coach or user.is_staff
        if user.is_student and not is_coach:
            # Ученики видят только свою посещаемость
            return Attendance.objects.filter(student=user)
        elif is_coach and not user.is_staff:
            # Тренеры (не админы) видят посещаемость учеников своих групп
            return Attendance.objects.filter(
                training__group__coach=user
            )
        # Администраторы видят всю посещаемость
        return Attendance.objects.all()

class GroupStudentViewSet(viewsets.ModelViewSet):
    queryset = GroupStudent.objects.all()
    serializer_class = GroupStudentSerializer
    permission_classes = [IsCoachOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'student', 'is_active']
    
    def get_queryset(self):
        user = self.request.user
        # Администратор автоматически является тренером
        is_coach = user.is_coach or user.is_staff
        if is_coach and not user.is_staff:
            # Тренеры (не админы) видят только учеников своих групп
            return GroupStudent.objects.filter(group__coach=user)
        # Администраторы видят всех учеников
        return GroupStudent.objects.all()