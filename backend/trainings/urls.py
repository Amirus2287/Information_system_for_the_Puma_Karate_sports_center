from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GymViewSet, GroupViewSet, TrainingViewSet, 
    HomeworkViewSet, AttendanceViewSet, GroupStudentViewSet
)

router = DefaultRouter()
router.register('gyms', GymViewSet)
router.register('groups', GroupViewSet)
router.register('trainings', TrainingViewSet)
router.register('homeworks', HomeworkViewSet)
router.register('attendances', AttendanceViewSet)
router.register('group-students', GroupStudentViewSet, basename='groupstudent')

urlpatterns = [
    path('', include(router.urls)),
]
