from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Journal(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journals')
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coach_journals')
    date = models.DateField()
    attendance = models.BooleanField(default=True)
    technique_score = models.IntegerField(null=True, blank=True)
    kata_score = models.IntegerField(null=True, blank=True)
    kumite_score = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    video = models.FileField(upload_to='journal_videos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Журнал'
        verbose_name_plural = 'Журналы'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.student} - {self.date}"

class ProgressNote(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress_notes')
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name='written_notes')
    date = models.DateField()
    category = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Заметка о прогрессе'
        verbose_name_plural = 'Заметки о прогрессе'
    
    def __str__(self):
        return f"{self.student} - {self.category}"

class TechniqueRecord(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='technique_records')
    technique = models.CharField(max_length=200)
    mastery_level = models.IntegerField()
    notes = models.TextField(blank=True)
    date_recorded = models.DateField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Запись техники'
        verbose_name_plural = 'Записи техник'
    
    def __str__(self):
        return f"{self.student} - {self.technique}"