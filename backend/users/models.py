# backend/apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=200, verbose_name="Название", unique=True)
    director = models.OneToOneField(
        'User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='directed_department',
        verbose_name="Директор департамента"
    )
    
    class Meta:
        verbose_name = "Департамент"
        verbose_name_plural = "Департаменты"

    def __str__(self):
        return self.name

class StudyGroup(models.Model):
    name = models.CharField(max_length=50, verbose_name="Название группы", unique=True)
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE, 
        verbose_name="Департамент",
        related_name='study_groups'
    )
    
    def __str__(self):
        return f"{self.name} ({self.department})"
    
    class Meta:
        verbose_name = "Учебная группа"
        verbose_name_plural = "Учебные группы"

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Студент'
        TEACHER = 'teacher', 'Преподаватель'
        DIRECTOR = 'director', 'Директор департамента'
        ADMIN = 'admin', 'Администратор ИС'
    
    role = models.CharField(
        max_length=20, 
        choices=Role.choices,
        verbose_name="Роль в системе",
        default=Role.STUDENT
    )
    photo = models.ImageField(
        upload_to='user_photos/', 
        blank=True, 
        null=True,
        verbose_name="Фотография"
    )
    study_group = models.ForeignKey(
        StudyGroup, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='students',
        verbose_name="Учебная группа"
    )
    department = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='members',
        verbose_name="Департамент"
    )
    is_approved = models.BooleanField(
        default=False, 
        verbose_name="Аккаунт подтверждён"
    )

    patronymic = models.CharField(
        max_length=50, 
        blank=True, 
        verbose_name="Отчество"
    )

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='Группы',
        blank=True,
        related_name='custom_user_set',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='Права пользователя',
        blank=True,
        related_name='custom_user_set',
        related_query_name='user',
    )
    
    def get_full_name(self):
        """Возвращает полное имя с отчеством."""
        full_name = f"{self.last_name} {self.first_name}"
        if self.patronymic:
            full_name += f" {self.patronymic}"
        return full_name
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"