from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ProfileViewSet, RegisterView, AchievementViewSet, NewsViewSet,
    me, login_view, logout_view, csrf_token
)

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('profiles', ProfileViewSet)
router.register('achievements', AchievementViewSet)
router.register('news', NewsViewSet)

urlpatterns = [
    path('csrf-token/', csrf_token, name='csrf_token'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', me, name='me'),
    path('', include(router.urls)),
]