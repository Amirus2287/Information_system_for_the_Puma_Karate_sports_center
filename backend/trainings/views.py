from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Gym, Group, GroupStudent, Training, Homework, Attendance
from .serializers import (
    GymSerializer, GroupSerializer, GroupStudentSerializer,
    TrainingSerializer, HomeworkSerializer, AttendanceSerializer
)
from accounts.permissions import IsCoach, IsStudent

class GymViewSet(viewsets.ModelViewSet):
    queryset = Gym.objects.all()
    serializer_class = GymSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class GroupStudentViewSet(viewsets.ModelViewSet):
    queryset = GroupStudent.objects.all()
    serializer_class = GroupStudentSerializer
    permission_classes = [IsAuthenticated]

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer

    def get_permissions(self):
        # создание/редактирование домашки — только тренер
        if self.action in ["create","update","partial_update","destroy"]:
            return [IsAuthenticated(), IsCoach()]
        return [IsAuthenticatedOrReadOnly()]

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        # запись посещаемости — тренер; просмотр — любой аутентифицированный
        if self.action in ["create","update","partial_update","destroy"]:
            return [IsAuthenticated(), IsCoach()]
        return [IsAuthenticatedOrReadOnly()]
