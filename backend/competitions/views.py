from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import (
    Competition, CompetitionCategory,
    CompetitionRegistration, CompetitionResult, TeamCompetitionResult
)
from .serializers import (
    CompetitionSerializer, CompetitionCategorySerializer,
    CompetitionRegistrationSerializer, CompetitionResultSerializer, TeamCompetitionResultSerializer
)
from accounts.permissions import IsCoach, IsStudent

class CompetitionViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CompetitionCategoryViewSet(viewsets.ModelViewSet):
    queryset = CompetitionCategory.objects.all()
    serializer_class = CompetitionCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CompetitionRegistrationViewSet(viewsets.ModelViewSet):
    queryset = CompetitionRegistration.objects.all()
    serializer_class = CompetitionRegistrationSerializer

    def get_permissions(self):
        # Регистрация: только аутентифицированный пользователь
        if self.action in ["create"]:
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]

class CompetitionResultViewSet(viewsets.ModelViewSet):
    queryset = CompetitionResult.objects.all()
    serializer_class = CompetitionResultSerializer

    def get_permissions(self):
        # Запись результата — тренер (или админ)
        if self.action in ["create","update","partial_update","destroy"]:
            return [IsAuthenticated(), IsCoach()]
        return [IsAuthenticatedOrReadOnly()]

class TeamCompetitionResultViewSet(viewsets.ModelViewSet):
    queryset = TeamCompetitionResult.objects.all()
    serializer_class = TeamCompetitionResultSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
