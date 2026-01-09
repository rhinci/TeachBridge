# backend/apps/notifications/signals.py
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from chats.models import Chat
from courses.models import Material, Course
from users.models import User
from .models import Notification

@receiver(post_save, sender=User)
def create_registration_notification(sender, instance, created, **kwargs):
    """Уведомление при подтверждении регистрации"""
    if not created:  # Если пользователь обновляется
        try:
            old_user = User.objects.get(id=instance.id)
            if old_user.is_approved != instance.is_approved:
                if instance.is_approved:
                    Notification.objects.create(
                        user=instance,
                        notification_type='registration_approved',
                        title='Ваш аккаунт подтверждён',
                        message='Добро пожаловать в образовательную платформу ДВФУ!'
                    )
        except User.DoesNotExist:
            pass

@receiver(m2m_changed, sender=Chat.participants.through)
def create_chat_invitation_notification(sender, instance, action, **kwargs):
    """Уведомление о добавлении в чат (только для личных чатов)"""
    if action == 'post_add' and instance.chat_type == 'personal':
        user_ids = kwargs.get('pk_set', [])
        for user_id in user_ids:
            user = User.objects.get(id=user_id)
            other_participants = instance.participants.exclude(id=user_id)
            if other_participants.exists():
                other_user = other_participants.first()
                Notification.objects.create(
                    user=user,
                    notification_type='new_chat',
                    title='Новый личный чат',
                    message=f'У вас новый личный чат с {other_user.get_full_name()}',
                    related_chat_id=instance.id
                )

@receiver(post_save, sender=Material)
def create_material_notification(sender, instance, created, **kwargs):
    """Уведомление о новом материале в курсе"""
    if created and instance.module.course:
        # Получаем чаты, к которым прикреплён курс
        chats_with_course = Chat.objects.filter(attached_courses=instance.module.course)
        
        for chat in chats_with_course:
            # Уведомляем всех участников чата
            participants = set()
            
            # Студенты из групп
            for group in chat.study_groups.all():
                participants.update(group.students.all())
            
            # Преподаватели
            participants.update(chat.teachers.all())
            
            for user in participants:
                Notification.objects.create(
                    user=user,
                    notification_type='new_course_material',
                    title='Новый материал в курсе',
                    message=f'В курсе "{instance.module.course.title}" добавлен новый материал: {instance.title}',
                    related_course_id=instance.module.course.id
                )

@receiver(m2m_changed, sender=Chat.attached_courses.through)
def create_course_attached_notification(sender, instance, action, **kwargs):
    """Уведомление о прикреплении курса к чату"""
    if action == 'post_add':
        course_ids = kwargs.get('pk_set', [])
        
        for course_id in course_ids:
            course = Course.objects.get(id=course_id)
            
            # Уведомляем всех участников чата
            participants = set()
            
            for group in instance.study_groups.all():
                participants.update(group.students.all())
            
            participants.update(instance.teachers.all())
            
            for user in participants:
                Notification.objects.create(
                    user=user,
                    notification_type='course_attached',
                    title='Курс прикреплён к чату',
                    message=f'Курс "{course.title}" теперь доступен в чате "{instance.name}"',
                    related_course_id=course.id,
                    related_chat_id=instance.id
                )