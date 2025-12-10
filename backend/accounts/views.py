from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    RegisterSerializer, UserSerializer,
    AchievementSerializer, ProfileSerializer, NewsSerializer, ClubTeamSerializer
)
from .models import Achievement, Profile, News, ClubTeam

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all().order_by("-created_at")
    serializer_class = NewsSerializer
    permission_classes = [IsAuthenticated]

class ClubTeamViewSet(viewsets.ModelViewSet):
    queryset = ClubTeam.objects.all()
    serializer_class = ClubTeamSerializer
    permission_classes = [IsAuthenticated]

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)
