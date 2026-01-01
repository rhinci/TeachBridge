# backend/apps/notifications/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


User = get_user_model()

class Notification(models.Model):    
    class NotificationType(models.TextChoices):
        NEW_MESSAGE = 'new_message', _('Новое сообщение')
        NEW_COURSE_MATERIAL = 'new_course_material', _('Новый материал курса')
        CHAT_INVITATION = 'chat_invitation', _('Приглашение в чат')
        COURSE_ATTACHED = 'course_attached', _('Курс прикреплён к чату')
        REGISTRATION_APPROVED = 'registration_approved', _('Регистрация подтверждена')
        REGISTRATION_REJECTED = 'registration_rejected', _('Регистрация отклонена')
        PASSWORD_RESET = 'password_reset', _('Сброс пароля')
        SYSTEM_ANNOUNCEMENT = 'system_announcement', _('Системное объявление')
    
    class NotificationStatus(models.TextChoices):
        UNREAD = 'unread', _('Не прочитано')
        READ = 'read', _('Прочитано')
        ARCHIVED = 'archived', _('В архиве')
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_("Пользователь")
    )
    
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices,
        verbose_name=_("Тип уведомления")
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name=_("Заголовок")
    )
    
    message = models.TextField(
        verbose_name=_("Сообщение")
    )

    related_model = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Связанная модель")
    )
    
    related_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("ID связанного объекта")
    )
    
    status = models.CharField(
        max_length=20,
        choices=NotificationStatus.choices,
        default=NotificationStatus.UNREAD,
        verbose_name=_("Статус")
    )

    send_push = models.BooleanField(
        default=False,
        verbose_name=_("Отправить push-уведомление")
    )
    
    push_sent = models.BooleanField(
        default=False,
        verbose_name=_("Push отправлено")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Дата создания")
    )
    
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Дата прочтения")
    )
    
    class Meta:
        verbose_name = _("Уведомление")
        verbose_name_plural = _("Уведомления")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status', 'created_at']),
            models.Index(fields=['user', 'notification_type']),
        ]
    
    def __str__(self):
        return f"{self.get_notification_type_display()}: {self.user}"
    
    def mark_as_read(self):
        if self.status == self.NotificationStatus.UNREAD:
            self.status = self.NotificationStatus.READ
            self.read_at = timezone.now()
            self.save(update_fields=['status', 'read_at'])
    
    def get_absolute_url(self):
        """Ссылка на связанный объект (если есть)"""
        if self.related_model and self.related_id:
            if self.related_model == 'chat_message':
                from django.urls import reverse
                return reverse('chat', kwargs={'chat_id': self.related_id})
        return None


class NotificationSettings(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_settings',
        verbose_name=_("Пользователь")
    )

    receive_message_notifications = models.BooleanField(
        default=True,
        verbose_name=_("Уведомления о новых сообщениях")
    )
    
    receive_course_notifications = models.BooleanField(
        default=True,
        verbose_name=_("Уведомления о новых материалах курсов")
    )
    
    receive_system_notifications = models.BooleanField(
        default=True,
        verbose_name=_("Системные уведомления")
    )
    
    # Push-уведомления
    enable_push_notifications = models.BooleanField(
        default=False,
        verbose_name=_("Включить push-уведомления")
    )
    
    push_token = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Токен для push-уведомлений")
    )
    
    last_notification_check = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Последняя проверка уведомлений")
    )
    
    class Meta:
        verbose_name = _("Настройка уведомлений")
        verbose_name_plural = _("Настройки уведомлений")
    
    def __str__(self):
        return f"Настройки уведомлений: {self.user}"