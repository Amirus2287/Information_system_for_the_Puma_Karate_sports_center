from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile, Achievement, News


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Профиль'
    fk_name = 'user'
    max_num = 1
    min_num = 1


class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_coach', 'is_student', 'is_staff')
    list_filter = ('is_coach', 'is_student', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Персональная информация', {'fields': ('first_name', 'last_name', 'patronymic', 'email', 'phone', 'date_of_birth', 'avatar')}),
        ('Роли', {'fields': ('is_coach', 'is_student')}),
        ('Разрешения', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_coach', 'is_student'),
        }),
    )
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'grade', 'years_of_practice', 'competitions_participated', 'competitions_won')
    list_filter = ('grade', 'years_of_practice')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'grade')
    raw_id_fields = ('user',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'bio', 'location', 'grade', 'years_of_practice')
        }),
        ('Информация о родителях (для учеников)', {
            'fields': ('parent_name', 'parent_phone'),
            'classes': ('collapse',)
        }),
        ('Медицинская информация', {
            'fields': ('medical_notes', 'medical_insurance'),
            'classes': ('collapse',)
        }),
        ('Спортивные результаты', {
            'fields': ('competitions_participated', 'competitions_won')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'date')
    list_filter = ('date',)
    search_fields = ('title', 'user__username', 'description')
    raw_id_fields = ('user',)
    date_hierarchy = 'date'


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'content', 'author__username')
    raw_id_fields = ('author',)
    date_hierarchy = 'created_at'


admin.site.register(User, UserAdmin)