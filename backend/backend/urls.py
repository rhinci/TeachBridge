# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def home_view(request):
    """Простая заглушка для корневой страницы"""
    return HttpResponse("""
        <h1>Образовательная платформа ДВФУ</h1>
        <p>Backend API работает корректно!</p>
        <p>Доступные endpoints:</p>
        <ul>
            <li><a href="/admin/">Админ-панель</a></li>
            <li><a href="/api/auth/">API аутентификации</a></li>
        </ul>
        <p>Frontend запускается на <a href="http://localhost:3000">http://localhost:3000</a></p>
    """)


urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)