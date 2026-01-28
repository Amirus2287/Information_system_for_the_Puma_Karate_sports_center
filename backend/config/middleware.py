from django.utils.deprecation import MiddlewareMixin
from django.middleware.csrf import get_token


class CSRFExemptForAPI(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/api/'):
            get_token(request)
        return None
