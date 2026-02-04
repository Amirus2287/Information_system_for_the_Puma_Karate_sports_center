from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import date


def age_from_birth(birth_date):
    if not birth_date:
        return None
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


class User(AbstractUser):
    patronymic = models.CharField('Отчество', max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_coach = models.BooleanField(default=False)
    is_student = models.BooleanField(default=True)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self):
        return age_from_birth(self.date_of_birth)
    
    def save(self, *args, **kwargs):
        if self.is_staff:
            self.is_coach = True
        super().save(*args, **kwargs)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    bio = models.TextField('Биография', max_length=1000, blank=True)
    location = models.CharField('Город', max_length=100, blank=True)
    grade = models.CharField('Разряд/Кю/Дан', max_length=50, blank=True)
    years_of_practice = models.IntegerField('Лет занятий каратэ', default=0)
    
    parent_name = models.CharField('Имя родителя', max_length=255, blank=True)
    parent_phone = models.CharField('Телефон родителя', max_length=20, blank=True)
    
    medical_notes = models.TextField('Медицинские показания', blank=True)
    medical_insurance = models.CharField('Мед. страховка', max_length=100, blank=True)
    
    competitions_participated = models.IntegerField('Участие в соревнованиях', default=0)
    competitions_won = models.IntegerField('Побед в соревнованиях', default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'
    
    def __str__(self):
        return f"Профиль {self.user.first_name} {self.user.last_name}"


class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    image = models.ImageField(upload_to='achievements/', null=True, blank=True)
    
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


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()