from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Puma Karate API",
        default_version='v1',
        description="API для системы спортивного центра Пума-Каратэ",
        contact=openapi.Contact(email="admin@pumakarate.ru"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)