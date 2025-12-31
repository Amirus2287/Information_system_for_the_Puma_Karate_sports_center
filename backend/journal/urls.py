from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JournalViewSet, ProgressNoteViewSet, TechniqueRecordViewSet

router = DefaultRouter()
router.register('journals', JournalViewSet)
router.register('progress-notes', ProgressNoteViewSet)
router.register('technique-records', TechniqueRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]