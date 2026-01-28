from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Gym(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    work_time = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = 'Зал'
        verbose_name_plural = 'Залы'
    
    def __str__(self):
        return self.name

class Group(models.Model):
    name = models.CharField(max_length=255)
    coach = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_coach': True})
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'
    
    def __str__(self):
        return self.name

class Training(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='trainings')
    date = models.DateField()
    time = models.TimeField()
    topic = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = 'Тренировка'
        verbose_name_plural = 'Тренировки'
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.group} - {self.date}"

class Homework(models.Model):
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='homeworks', null=True, blank=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_student': True}, related_name='homeworks')
    task = models.TextField()
    deadline = models.DateField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = 'Домашнее задание'
        verbose_name_plural = 'Домашние задания'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student} - {self.task[:50]}"

class Attendance(models.Model):
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    present = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = 'Посещаемость'
        verbose_name_plural = 'Посещаемость'
        unique_together = ['training', 'student']
        ordering = ['-training__date']
    
    def __str__(self):
        return f"{self.student} - {self.training.date}"
    
class GroupStudent(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='students')
    student = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='training_groups')
    joined_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Ученик группы'
        verbose_name_plural = 'Ученики групп'
        unique_together = ['group', 'student']
    
    def __str__(self):
        return f"{self.student} в {self.group}"