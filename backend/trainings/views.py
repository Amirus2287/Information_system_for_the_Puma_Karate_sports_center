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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'address']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['coach', 'gym']
    search_fields = ['name']
    
    def get_queryset(self):
        user = self.request.user
        is_coach = user.is_coach or user.is_staff
        if user.is_student and not is_coach:
            return Group.objects.filter(students__student=user, students__is_active=True).distinct()
        elif is_coach and not user.is_staff:
            return Group.objects.filter(coach=user)
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
        is_coach = user.is_coach or user.is_staff
        
        queryset = Training.objects.all()
        
        date_after = self.request.query_params.get('date_after')
        date_before = self.request.query_params.get('date_before')
        
        if date_after:
            queryset = queryset.filter(date__gte=date_after)
        if date_before:
            queryset = queryset.filter(date__lte=date_before)
        
        if user.is_student and not is_coach:
            queryset = queryset.filter(
                group__students__student=user, 
                group__students__is_active=True
            ).distinct()
        elif is_coach and not user.is_staff:
            queryset = queryset.filter(group__coach=user)
        
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
        is_coach = user.is_coach or user.is_staff
        if user.is_student and not is_coach:
            return Homework.objects.filter(student=user)
        elif is_coach and not user.is_staff:
            return Homework.objects.filter(
                training__group__coach=user
            )
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
        is_coach = user.is_coach or user.is_staff
        if user.is_student and not is_coach:
            return Attendance.objects.filter(student=user)
        elif is_coach and not user.is_staff:
            return Attendance.objects.filter(
                training__group__coach=user
            )
        return Attendance.objects.all()

class GroupStudentViewSet(viewsets.ModelViewSet):
    queryset = GroupStudent.objects.all()
    serializer_class = GroupStudentSerializer
    permission_classes = [IsCoachOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'student', 'is_active']
    
    def get_queryset(self):
        user = self.request.user
        is_coach = user.is_coach or user.is_staff
        if is_coach and not user.is_staff:
            return GroupStudent.objects.filter(group__coach=user)
        return GroupStudent.objects.all()
    
    def create(self, request, *args, **kwargs):
        group_id = request.data.get('group')
        student_id = request.data.get('student')
        
        existing = GroupStudent.objects.filter(
            group_id=group_id,
            student_id=student_id
        ).first()
        
        if existing:
            existing.is_active = True
            existing.save()
            serializer = self.get_serializer(existing)
            from rest_framework.response import Response
            from rest_framework import status
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return super().create(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        from rest_framework.response import Response
        from rest_framework import status
        return Response(status=status.HTTP_204_NO_CONTENT)