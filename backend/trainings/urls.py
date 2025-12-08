from rest_framework.routers import DefaultRouter
from .views import (
    GymViewSet, GroupViewSet, GroupStudentViewSet,
    TrainingViewSet, HomeworkViewSet, AttendanceViewSet
)

router = DefaultRouter()
router.register("gyms", GymViewSet)
router.register("groups", GroupViewSet)
router.register("group_students", GroupStudentViewSet)
router.register("trainings", TrainingViewSet)
router.register("homeworks", HomeworkViewSet)
router.register("attendance", AttendanceViewSet)

urlpatterns = router.urls
