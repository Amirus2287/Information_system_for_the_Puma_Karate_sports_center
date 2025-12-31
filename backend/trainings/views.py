from rest_framework import viewsets, permissions
from .models import Gym, Group, Training, Homework, Attendance
from .serializers import GymSerializer, GroupSerializer, TrainingSerializer, HomeworkSerializer, AttendanceSerializer

class GymViewSet(viewsets.ModelViewSet):
    queryset = Gym.objects.all()
    serializer_class = GymSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()  # <-- ДОБАВЬТЕ ЭТУ СТРОКУ!
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]