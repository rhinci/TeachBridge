# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def home_view(request):
    """Заглушка для корневой страницы"""
    return HttpResponse("""
        <h1>Образовательная платформа ДВФУ</h1>
        <p>Backend API работает корректно!</p>
        <p>Доступные endpoints:</p>
        <ul>
            <li><a href="/admin/">Админ-панель</a></li>
            <li><a href="/api/auth/">API аутентификации</a></li>
                <ul>
                    <li>POST /api/auth/users/register/ - регистрация</a></li>

                    <li>POST /api/auth/users/login/ - авторизация</a></li>
                    
                    <li>GET /api/auth/users/study-groups/ - учебные группы</a></li>

                    <li>GET /api/auth/users/departments/ - департаменты</a></li>

                    <li>GET /api/auth/users/users/ - пользователи</a></li>
                        
                    <li>GET /api/auth/users/me/ - Информация о текущем пользователе</a></li>
                         
                    <li>POST /api/auth/password-reset/request/ - Запрос кода восстановления пароля</a></li>

                    <li>POST /api/auth/password-reset/confirm/ - Подтверждение восстановления пароля</a></li>

                    <li>POST /api/auth/token/refresh/ - Обновление JWT токена</a></li>   
                    
                </ul>
            </li>
                        
            <li><a href="/api/chats/">API чатов</a>
                <ul>
                    <li>GET /api/chats/chats/group_chats/ - учебные чаты</a></li>

                    <li>GET /api/chats/chats/personal_chats/ - личные чаты</a></li>

                    <li>POST /api/chats/chats/ - создать чат</a></li>
                        
                    <li>POST /api/chats/chats/{id}/add_participant/ - Добавить участника в чат</a></li>

                    <li>GET /api/chats/messages/chat_messages/?chat_id=1 - сообщения чата</a></li>

                    <li>POST /api/chats/messages/ - отправить сообщение</li></a></li>
                        
                    <li>GET /api/chats/messages/chat_messages/?chat_id=1 - Сообщения конкретного чата</li></a></li>
                </ul>
            </li>
                        
            <li><a href="/api/courses/">API курсов</a>
                <ul>
                    <li>POST /api/courses/courses/ - создать курс</a></li>

                    <li>POST /api/courses/courses/1/add-module/ - добавить модуль</a></li>

                    <li>POST /api/courses/courses/1/modules/1/add-material/ - добавить материал</a></li>
                        
                    <li>GET /api/courses/courses/my-courses/ - получить "мои" курсы</a></li>

                    <li>GET /api/courses/courses/ - получить все курсы</a></li>
                </ul>
            </li>
                        
            <li><a href="/api/notifications/">API уведомлений</a>
                <ul>
                    <li>GET /api/notifications/notifications/ - все уведомления</a></li>

                    <li>GET /api/notifications/notifications/recent/ - последние 10 уведов</a></li>

                    <li>GET /api/notifications/notifications/unread_count/ - счётчик непрочитанных</a></li>
                        
                    <li>POST /api/notifications/notifications/mark_all_as_read/ - прочитать всё</a></li>

                    <li>POST /api/notifications/notifications/{id}/mark_as_read/ - прочитать одно</a></li>
                </ul>
            </li>
        </ul>
        <p>Frontend запускается на <a href="http://localhost:3000">http://localhost:3000</a></p>
    """)


urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/chats/', include('chats.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/notifications/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)