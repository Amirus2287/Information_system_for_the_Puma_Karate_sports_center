from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Achievement, Profile, News, ClubTeam

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username","email","first_name","last_name","is_coach","is_student","is_staff")
    search_fields = ("username","email","first_name","last_name")

admin.site.register(Achievement)
admin.site.register(Profile)
admin.site.register(News)
admin.site.register(ClubTeam)
