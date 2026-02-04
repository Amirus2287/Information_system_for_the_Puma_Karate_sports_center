from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompetitionViewSet, CompetitionCategoryViewSet,
    CompetitionRegistrationViewSet
)

router = DefaultRouter()
router.register('competitions', CompetitionViewSet)
router.register('categories', CompetitionCategoryViewSet)
router.register('registrations', CompetitionRegistrationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]