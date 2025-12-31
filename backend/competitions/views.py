from rest_framework import viewsets, permissions
from .models import Competition, CompetitionCategory, CompetitionRegistration, CompetitionResult, TeamCompetitionResult
from .serializers import CompetitionSerializer, CompetitionCategorySerializer, CompetitionRegistrationSerializer, CompetitionResultSerializer, TeamCompetitionResultSerializer

class CompetitionViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CompetitionCategoryViewSet(viewsets.ModelViewSet):
    queryset = CompetitionCategory.objects.all()
    serializer_class = CompetitionCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CompetitionRegistrationViewSet(viewsets.ModelViewSet):
    queryset = CompetitionRegistration.objects.all()
    serializer_class = CompetitionRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

class CompetitionResultViewSet(viewsets.ModelViewSet):
    queryset = CompetitionResult.objects.all()
    serializer_class = CompetitionResultSerializer
    permission_classes = [permissions.IsAuthenticated]

class TeamCompetitionResultViewSet(viewsets.ModelViewSet):
    queryset = TeamCompetitionResult.objects.all()
    serializer_class = TeamCompetitionResultSerializer
    permission_classes = [permissions.IsAuthenticated]