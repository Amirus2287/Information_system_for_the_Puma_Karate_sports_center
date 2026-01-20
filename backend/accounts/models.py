from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)
    telegram_id = models.CharField(max_length=100, blank=True, null=True)
    is_coach = models.BooleanField(default=False)
    is_student = models.BooleanField(default=True)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        # Если пользователь администратор, автоматически делаем его тренером
        if self.is_staff:
            self.is_coach = True
        super().save(*args, **kwargs)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Дополнительная информация
    bio = models.TextField('Биография', max_length=1000, blank=True)
    location = models.CharField('Город', max_length=100, blank=True)
    grade = models.CharField('Разряд/Кю/Дан', max_length=50, blank=True)
    years_of_practice = models.IntegerField('Лет занятий каратэ', default=0)
    
    # Контактная информация родителей (для студентов)
    parent_name = models.CharField('Имя родителя', max_length=255, blank=True)
    parent_phone = models.CharField('Телефон родителя', max_length=20, blank=True)
    
    # Медицинская информация
    medical_notes = models.TextField('Медицинские показания', blank=True)
    
    # Спортивная информация
    competitions_participated = models.IntegerField('Участие в соревнованиях', default=0)
    competitions_won = models.IntegerField('Побед в соревнованиях', default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'
    
    def __str__(self):
        return f"Профиль {self.user.first_name} {self.user.last_name}"
    
    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}"
    
    @property
    def win_rate(self):
        if self.competitions_participated == 0:
            return 0
        return (self.competitions_won / self.competitions_participated) * 100


class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    
    class Meta:
        verbose_name = 'Достижение'
        verbose_name_plural = 'Достижения'
    
    def __str__(self):
        return self.title


class News(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='news/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'
    
    def __str__(self):
        return self.title


# Сигналы для автоматического создания профиля
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Автоматически создает профиль при создании пользователя"""
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Автоматически сохраняет профиль при сохранении пользователя"""
    if hasattr(instance, 'profile'):
        instance.profile.save()

class ClubTeam(models.Model):
    name = models.CharField('Название команды', max_length=255)
    coach = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='coached_teams')
    students = models.ManyToManyField(User, related_name='teams', blank=True)
    description = models.TextField('Описание команды', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Команда клуба'
        verbose_name_plural = 'Команды клуба'
    
    def __str__(self):
        return self.name
    
    @property
    def student_count(self):
        return self.students.count()
    
    @property
    def active_students(self):
        return self.students.filter(is_active=True).count()