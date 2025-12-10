from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Competition(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    date = models.DateField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class CompetitionCategory(models.Model):
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    weight_min = models.IntegerField()
    weight_max = models.IntegerField()

    age_min = models.IntegerField()
    age_max = models.IntegerField()

    def __str__(self):
        return f"{self.name} ({self.competition.name})"

class CompetitionRegistration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE)
    category = models.ForeignKey(CompetitionCategory, on_delete=models.SET_NULL, null=True)

    registered_at = models.DateTimeField(auto_now_add=True)
    is_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} — {self.competition}"

class CompetitionResult(models.Model):
    registration = models.OneToOneField(CompetitionRegistration, on_delete=models.CASCADE)

    place = models.IntegerField()
    score = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.registration.user}: {self.place} место"

class TeamCompetitionResult(models.Model):
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE)
    team_name = models.CharField(max_length=255)

    place = models.IntegerField()
    achievements = models.TextField(blank=True)

    def __str__(self):
        return f"{self.team_name} — {self.place} место"
