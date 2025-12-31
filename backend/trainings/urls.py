from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GymViewSet, GroupViewSet, TrainingViewSet, HomeworkViewSet, AttendanceViewSet

router = DefaultRouter()
router.register('gyms', GymViewSet)
router.register('groups', GroupViewSet)
router.register('trainings', TrainingViewSet)
router.register('homework', HomeworkViewSet)
router.register('attendance', AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
