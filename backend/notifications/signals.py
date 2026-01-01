# backend/apps/notifications/signals.py
from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model
from chats.models import Message, Chat
from courses.models import Material, Course
from users.models import User
from .models import Notification, NotificationSettings

User = get_user_model()

# 1. Уведомление о новом сообщении в чате
@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    if created and instance.chat:
        # Получаем всех пользователей чата кроме автора сообщения
        users_to_notify = set()
        
        # Студенты из учебных групп
        for group in instance.chat.study_groups.all():
            users_to_notify.update(group.students.all())
        
        # Преподаватели чата
        users_to_notify.update(instance.chat.teachers.all())
        
        # Убираем автора сообщения
        users_to_notify.discard(instance.author)
        
        for user in users_to_notify:
            # Проверяем настройки пользователя
            settings, _ = NotificationSettings.objects.get_or_create(user=user)
            
            if settings.receive_message_notifications:
                Notification.objects.create(
                    user=user,
                    notification_type=Notification.NotificationType.NEW_MESSAGE,
                    title=f"Новое сообщение в чате {instance.chat.name}",
                    message=f"{instance.author.get_full_name()}: {instance.content[:100]}...",
                    related_model='chat_message',
                    related_id=instance.chat.id,
                    send_push=settings.enable_push_notifications
                )

# 2. Уведомление о новом материале курса
@receiver(post_save, sender=Material)
def create_material_notification(sender, instance, created, **kwargs):
    if created and instance.module.course:
        # Получаем чаты, к которым прикреплён этот курс
        chats_with_course = Chat.objects.filter(attached_courses=instance.module.course)
        
        for chat in chats_with_course:
            # Получаем всех пользователей чата
            users_to_notify = set()
            
            for group in chat.study_groups.all():
                users_to_notify.update(group.students.all())
            
            users_to_notify.update(chat.teachers.all())
            
            for user in users_to_notify:
                settings, _ = NotificationSettings.objects.get_or_create(user=user)
                
                if settings.receive_course_notifications:
                    Notification.objects.create(
                        user=user,
                        notification_type=Notification.NotificationType.NEW_COURSE_MATERIAL,
                        title=f"Новый материал в курсе {instance.module.course.title}",
                        message=f"Добавлен материал: {instance.title}",
                        related_model='course_material',
                        related_id=instance.module.course.id,
                        send_push=settings.enable_push_notifications
                    )

# 3. Уведомление о прикреплении курса к чату
@receiver(m2m_changed, sender=Chat.attached_courses.through)
def create_course_attached_notification(sender, instance, action, **kwargs):
    if action == 'post_add':
        # Получаем добавленные курсы
        course_ids = kwargs.get('pk_set', [])
        
        for course_id in course_ids:
            course = Course.objects.get(id=course_id)
            
            # Уведомляем всех пользователей чата
            users_to_notify = set()
            
            for group in instance.study_groups.all():
                users_to_notify.update(group.students.all())
            
            users_to_notify.update(instance.teachers.all())
            
            for user in users_to_notify:
                settings, _ = NotificationSettings.objects.get_or_create(user=user)
                
                if settings.receive_course_notifications:
                    Notification.objects.create(
                        user=user,
                        notification_type=Notification.NotificationType.COURSE_ATTACHED,
                        title=f"К курсу прикреплён к чату {instance.name}",
                        message=f"Курс '{course.title}' теперь доступен в чате",
                        related_model='course',
                        related_id=course.id,
                        send_push=settings.enable_push_notifications
                    )

# 4. Уведомление о подтверждении регистрации
@receiver(post_save, sender=User)
def create_registration_notification(sender, instance, created, **kwargs):
    if not created:  # Если пользователь обновляется
        # Проверяем, изменился ли статус подтверждения
        try:
            old_user = User.objects.get(id=instance.id)
            if old_user.is_approved != instance.is_approved:
                if instance.is_approved:
                    # Аккаунт подтверждён
                    Notification.objects.create(
                        user=instance,
                        notification_type=Notification.NotificationType.REGISTRATION_APPROVED,
                        title="Ваш аккаунт подтверждён",
                        message="Добро пожаловать в образовательную платформу ДВФУ!",
                        send_push=False
                    )
                else:
                    # Аккаунт отклонён
                    Notification.objects.create(
                        user=instance,
                        notification_type=Notification.NotificationType.REGISTRATION_REJECTED,
                        title="Ваша регистрация отклонена",
                        message="Обратитесь к администратору для выяснения причин",
                        send_push=False
                    )
        except User.DoesNotExist:
            pass

# 5. Автоматическое создание настроек уведомлений при создании пользователя
@receiver(post_save, sender=User)
def create_notification_settings(sender, instance, created, **kwargs):
    if created:
        NotificationSettings.objects.get_or_create(user=instance)