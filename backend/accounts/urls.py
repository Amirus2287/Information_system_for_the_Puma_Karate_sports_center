from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserViewSet, RegisterView, AchievementViewSet, NewsViewSet, me

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('achievements', AchievementViewSet)
router.register('news', NewsViewSet)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', me, name='me'),
    path('', include(router.urls)),
]