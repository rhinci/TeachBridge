# backend/apps/courses/models.py
from django.db import models
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext_lazy as _

class Course(models.Model):
    title = models.CharField(
        max_length=200,
        verbose_name=_("Название курса"),
        help_text=_("Введите название курса")
    )
    
    short_description = models.TextField(
        blank=True,
        verbose_name=_("Краткое описание"),
        help_text=_("Краткое описание курса (до 500 символов)")
    )
    
    full_description = models.TextField(
        blank=True,
        verbose_name=_("Полное описание"),
        help_text=_("Подробное описание курса")
    )
    
    author = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='created_courses',
        verbose_name=_("Автор курса"),
        help_text=_("Преподаватель или директор, создавший курс"),
        limit_choices_to={'role__in': ['teacher', 'director']}
    )
    
    department = models.ForeignKey(
        'users.Department',
        on_delete=models.CASCADE,
        related_name='courses',
        verbose_name=_("Департамент"),
        help_text=_("Департамент, к которому относится курс"),
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Дата создания")
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Дата обновления")
    )
    
    class Meta:
        verbose_name = _("Курс")
        verbose_name_plural = _("Курсы")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['author']),
            models.Index(fields=['department']),
        ]
    
    def __str__(self):
        return f"{self.title} (Автор: {self.author.get_full_name()})"
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('course-detail', kwargs={'pk': self.pk})


class Module(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='modules',
        verbose_name=_("Курс"),
        help_text=_("Курс, к которому относится модуль")
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name=_("Название модуля"),
        help_text=_("Введите название модуля")
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Порядок"),
        help_text=_("Порядковый номер модуля в курсе")
    )
    
    class Meta:
        verbose_name = _("Модуль курса")
        verbose_name_plural = _("Модули курса")
        ordering = ['order', 'id']
        unique_together = ['course', 'order']  # Порядок уникален в рамках курса
        
    def __str__(self):
        return f"{self.order}. {self.title} ({self.course.title})"
    
    def save(self, *args, **kwargs):
        # При сохранении нового модуля без указания порядка ставим его последним
        if not self.pk and self.order == 0:
            last_module = Module.objects.filter(course=self.course).order_by('-order').first()
            self.order = last_module.order + 1 if last_module else 1
        super().save(*args, **kwargs)


class Material(models.Model):
    class MaterialType(models.TextChoices):
        ARTICLE = 'article', _('Статья')
        PRESENTATION = 'presentation', _('Презентация')
        VIDEO = 'video', _('Видео')
        OTHER = 'other', _('Другой материал')
    
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='materials',
        verbose_name=_("Модуль"),
        help_text=_("Модуль, к которому относится материал")
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name=_("Название материала"),
        help_text=_("Введите название материала")
    )
    
    material_type = models.CharField(
        max_length=20,
        choices=MaterialType.choices,
        default=MaterialType.ARTICLE,
        verbose_name=_("Тип материала"),
        help_text=_("Выберите тип материала")
    )
    
    content = models.TextField(
        blank=True,
        verbose_name=_("Текстовое содержание"),
        help_text=_("Текстовое описание или содержание материала")
    )

    file = models.FileField(
        upload_to='course_materials/%Y/%m/%d/',
        blank=True,
        null=True,
        verbose_name=_("Файл"),
        help_text=_("Загрузите файл материала"),
        validators=[
            FileExtensionValidator([
                # Статьи
                'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
                # Презентации
                'ppt', 'pptx', 'odp', 'key',
                # Видео
                'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm',
                # Изображения (для иллюстраций к статьям)
                'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg',
                # Архивы (если нужно)
                'zip', 'rar', '7z'
            ])
        ]
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Порядок"),
        help_text=_("Порядковый номер материала в модуле")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Дата создания")
    )
    
    class Meta:
        verbose_name = _("Материал курса")
        verbose_name_plural = _("Материалы курса")
        ordering = ['order', 'id']
        unique_together = ['module', 'order']  # Порядок уникален в рамках модуля
        
    def __str__(self):
        return f"{self.title} ({self.get_material_type_display()})"
    
    def save(self, *args, **kwargs):
        # При сохранении нового материала без указания порядка ставим его последним
        if not self.pk and self.order == 0:
            last_material = Material.objects.filter(module=self.module).order_by('-order').first()
            self.order = last_material.order + 1 if last_material else 1
        super().save(*args, **kwargs)
    
    @property
    def file_extension(self):
        if self.file and self.file.name:
            return self.file.name.split('.')[-1].lower()
        return None
    
    @property
    def file_size(self):
        if self.file and self.file.size:
            return round(self.file.size / (1024 * 1024), 2)  # МБ
        return 0
    
    @property
    def is_downloadable(self):
        return bool(self.file)
    
    def clean(self):
        """Валидация данных"""
        from django.core.exceptions import ValidationError

        if not self.content and not self.file:
            raise ValidationError(
                _("Заполните текстовое содержание или загрузите файл")
            )

        if self.file and self.file.size > 100 * 1024 * 1024:
            raise ValidationError(
                _("Размер файла не должен превышать 100 МБ")
            )
        
        super().clean()


# Сигналы для обработки файлов
from django.db.models.signals import pre_delete
from django.dispatch import receiver

@receiver(pre_delete, sender=Material)
def delete_material_file(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)