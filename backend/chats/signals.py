from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Chat

@receiver(m2m_changed, sender=Chat.participants.through)
def update_personal_chat_name(sender, instance, action, **kwargs):
    """
    Обновляет название личного чата при изменении участников
    """
    if action in ["post_add", "post_remove", "post_clear"]:
        if instance.chat_type == Chat.ChatType.PERSONAL:
            # Обновляем название
            instance.save()  # Вызовет обновление в методе save