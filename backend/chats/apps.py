from django.apps import AppConfig


class ChatsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chats'
    verbose_name = 'Чаты и сообщения'

    def ready(self):
        """Импортируем сигналы при запуске приложения"""
        import chats.signals
