from django.db import models
from django.contrib.auth.models import AbstractUser


# ===========================
# CUSTOM USER
# ===========================
class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_coach = models.BooleanField(default=False)
    is_student = models.BooleanField(default=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()


# ===========================
# ACHIEVMENTS
# ===========================
class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    achievement_date = models.DateField()

    def __str__(self):
        return self.title


# ===========================
# PROFILES
# ===========================
class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.SET_NULL, null=True, blank=True)

    specialization = models.CharField(max_length=255)
    experience = models.IntegerField()

    def __str__(self):
        return self.specialization


# ===========================
# NEWS
# ===========================
class News(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ===========================
# CLUB TEAM
# ===========================
class ClubTeam(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievements = models.TextField(blank=True)

    def __str__(self):
        return f"Team member: {self.user}"
