from rest_framework.routers import DefaultRouter
from .views import (
    CompetitionViewSet, CompetitionCategoryViewSet,
    CompetitionRegistrationViewSet, CompetitionResultViewSet, TeamCompetitionResultViewSet
)

router = DefaultRouter()
router.register("competitions", CompetitionViewSet)
router.register("categories", CompetitionCategoryViewSet)
router.register("registrations", CompetitionRegistrationViewSet)
router.register("results", CompetitionResultViewSet)
router.register("team_results", TeamCompetitionResultViewSet)

urlpatterns = router.urls
