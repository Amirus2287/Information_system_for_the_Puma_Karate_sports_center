from rest_framework import viewsets, permissions
from django.db.models import Q, Count
from .models import Competition, CompetitionCategory, CompetitionRegistration, CompetitionResult, TeamCompetitionResult
from .serializers import CompetitionSerializer, CompetitionCategorySerializer, CompetitionRegistrationSerializer, CompetitionResultSerializer, TeamCompetitionResultSerializer

class CompetitionViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            from accounts.permissions import IsCoachOrAdmin
            return [IsCoachOrAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Competition.objects.all()
        
        if user.is_staff:
            return queryset
        
        if user.is_authenticated:
            from trainings.models import GroupStudent
            user_groups = list(GroupStudent.objects.filter(
                student=user,
                is_active=True
            ).values_list('group_id', flat=True))
            
            queryset = queryset.annotate(
                visible_groups_count=Count('visible_groups')
            )
            
            if user_groups:
                queryset = queryset.filter(
                    Q(visible_groups__in=user_groups) | Q(visible_groups_count=0)
                ).distinct()
            else:
                queryset = queryset.filter(visible_groups_count=0)
        
        return queryset
    

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