from rest_framework import permissions

class IsCoach(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_coach)

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_student)

class IsAdmin(permissions.BasePermission):
    """Проверка, что пользователь является администратором (is_staff)"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)

class IsCoachOrAdmin(permissions.BasePermission):
    """Проверка, что пользователь является тренером или администратором"""
    def has_permission(self, request, view):
        # Администратор автоматически является тренером
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_coach or request.user.is_staff)
        )