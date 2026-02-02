from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Exists, OuterRef
from .models import Competition, CompetitionCategory, CompetitionRegistration, CompetitionResult
from .serializers import CompetitionSerializer, CompetitionCategorySerializer, CompetitionRegistrationSerializer, CompetitionResultSerializer


def _user_age(user):
    from accounts.models import age_from_birth
    return age_from_birth(user.date_of_birth) if getattr(user, 'date_of_birth', None) else None
    

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
            
            filter_by_age = self.request.query_params.get('filter_by_age', 'false').lower() == 'true'
            user_age = _user_age(user)
            if filter_by_age and user_age is not None:
                has_any_category = CompetitionCategory.objects.filter(competition_id=OuterRef('pk'))
                age_match = CompetitionCategory.objects.filter(
                    competition_id=OuterRef('pk')
                ).filter(
                    Q(age_min__isnull=True, age_max__isnull=True)
                    | Q(age_min__lte=user_age, age_max__gte=user_age)
                )
                queryset = queryset.filter(
                    ~Exists(has_any_category) | Exists(age_match)
                )
        
        return queryset
    

class CompetitionCategoryViewSet(viewsets.ModelViewSet):
    queryset = CompetitionCategory.objects.all()
    serializer_class = CompetitionCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['competition']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            from accounts.permissions import IsCoachOrAdmin
            return [IsCoachOrAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class CompetitionRegistrationViewSet(viewsets.ModelViewSet):
    queryset = CompetitionRegistration.objects.all()
    serializer_class = CompetitionRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

class CompetitionResultViewSet(viewsets.ModelViewSet):
    queryset = CompetitionResult.objects.all()
    serializer_class = CompetitionResultSerializer
    permission_classes = [permissions.IsAuthenticated]