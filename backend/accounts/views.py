from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.db.models import Q
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from django_filters.rest_framework import DjangoFilterBackend
from .models import User, Profile, Achievement, News
from .permissions import IsAdmin, IsCoachOrAdmin, IsAdminOrSelfUser
from .serializers import (
    UserSerializer, ProfileSerializer, AchievementSerializer, 
    NewsSerializer
)

User = get_user_model()


class UserPageNumberPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 500


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = UserPageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['date_joined', 'last_name', 'first_name']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        elif user.is_coach:
            from trainings.models import GroupStudent
            student_ids = GroupStudent.objects.filter(
                group__coach=user,
                is_active=True
            ).values_list('student_id', flat=True)
            return User.objects.filter(id__in=student_ids)
        return User.objects.filter(id=user.id)
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        if self.action in ['update', 'partial_update']:
            return [IsAdminOrSelfUser()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Profile.objects.all()
        if user.is_coach:
            from trainings.models import GroupStudent
            student_ids = list(GroupStudent.objects.filter(
                group__coach=user,
                is_active=True
            ).values_list('student_id', flat=True).distinct())
            student_ids = list(student_ids) + [user.id]
            return Profile.objects.filter(user_id__in=student_ids)
        return Profile.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user']
    ordering_fields = ['date']
    ordering = ['-date']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_student and not user.is_coach:
            return Achievement.objects.filter(user=user)
        return Achievement.objects.all()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsCoachOrAdmin()]
        return [permissions.IsAuthenticated()]


class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(ensure_csrf_cookie, name='dispatch')
class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        login(request, user)
        
        return Response({
            'user': UserSerializer(user, context=self.get_serializer_context()).data,
            'message': 'Пользователь успешно создан'
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
@ensure_csrf_cookie
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Необходимо указать username и password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'message': 'Вход выполнен успешно'
        })
    else:
        return Response(
            {'error': 'Неверные учетные данные'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def logout_view(request):
    logout(request)
    return Response({'message': 'Выход выполнен успешно'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_token(request):
    from django.middleware.csrf import get_token
    token = get_token(request)
    return Response({'csrfToken': token})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)