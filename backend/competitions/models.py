from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Competition(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    date = models.DateField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    visible_groups = models.ManyToManyField('trainings.Group', related_name='competitions', blank=True, verbose_name='Видимые группы')
    
    class Meta:
        verbose_name = 'Соревнование'
        verbose_name_plural = 'Соревнования'
    
    def __str__(self):
        return self.name

class CompetitionCategory(models.Model):
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    weight_min = models.IntegerField(null=True, blank=True)
    weight_max = models.IntegerField(null=True, blank=True)
    age_min = models.IntegerField(null=True, blank=True)
    age_max = models.IntegerField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
    
    def __str__(self):
        return f"{self.name} ({self.competition.name})"

class CompetitionRegistration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE)
    category = models.ForeignKey(CompetitionCategory, on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)
    is_confirmed = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Регистрация'
        verbose_name_plural = 'Регистрации'
    
    def __str__(self):
        return f"{self.user} - {self.competition}"
