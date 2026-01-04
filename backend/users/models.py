from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):
    """Кастомный менеджер для работы с email вместо username"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Требуется email')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_approved', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Суперпользователь должен иметь is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Суперпользователь должен иметь is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


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
    code = models.CharField(max_length=20, verbose_name="Код группы", unique=True)
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE, 
        verbose_name="Департамент",
        related_name='study_groups'
    )
    
    def __str__(self):
        return f"{self.code} ({self.department})"
    
    class Meta:
        verbose_name = "Учебная группа"
        verbose_name_plural = "Учебные группы"

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Студент'
        TEACHER = 'teacher', 'Преподаватель'
        DIRECTOR = 'director', 'Директор департамента'
        ADMIN = 'admin', 'Администратор ИС'
    
    username = None
    objects = UserManager()

    email = models.EmailField(
        _('Корпоративная почта'),
        unique=True,
        help_text=_('Используйте почту в домене ДВФУ')
    )

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

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']
    
    def get_full_name(self):
        """Возвращает полное имя с отчеством."""
        full_name = f"{self.last_name} {self.first_name}"
        if self.patronymic:
            full_name += f" {self.patronymic}"
        return full_name
    
    def get_short_name(self):
        """Возвращает короткое имя (Имя Фамилия)"""
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        ordering = ['last_name', 'first_name']