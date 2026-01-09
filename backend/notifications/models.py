from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    """Простая модель уведомления"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Пользователь"
    )
    
    # Типы уведомлений
    NOTIFICATION_TYPES = [
        ('new_chat', 'Добавлен в чат'),
        ('new_course_material', 'Новый материал в курсе'),
        ('course_attached', 'Курс прикреплён к чату'),
        ('registration_approved', 'Регистрация подтверждена'),
        ('registration_rejected', 'Регистрация отклонена'),
        ('system', 'Системное уведомление'),
    ]
    
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        verbose_name="Тип уведомления"
    )
    
    title = models.CharField(max_length=200, verbose_name="Заголовок")
    message = models.TextField(verbose_name="Сообщение")
    
    # Ссылка на связанный объект (опционально)
    related_chat_id = models.PositiveIntegerField(null=True, blank=True)
    related_course_id = models.PositiveIntegerField(null=True, blank=True)
    
    is_read = models.BooleanField(default=False, verbose_name="Прочитано")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Уведомление"
        verbose_name_plural = "Уведомления"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email}: {self.title}"