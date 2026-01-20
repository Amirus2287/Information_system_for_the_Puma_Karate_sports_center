"""
Middleware для обработки CSRF в DRF API endpoints
"""
from django.utils.deprecation import MiddlewareMixin
from django.middleware.csrf import get_token


class CSRFExemptForAPI(MiddlewareMixin):
    """
    Middleware для установки CSRF cookie для API endpoints
    """
    def process_request(self, request):
        # Устанавливаем CSRF cookie для всех запросов, чтобы фронтенд мог его получить
        if request.path.startswith('/api/'):
            get_token(request)
        return None
