# backend/apps/notifications/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Notification

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet для управления уведомлениями"""
    serializer_class = None  # Будем использовать простой сериализатор
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Пользователь видит только свои уведомления"""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        """Простой сериализатор для уведомлений"""
        from rest_framework import serializers
        
        class SimpleNotificationSerializer(serializers.ModelSerializer):
            class Meta:
                model = Notification
                fields = ['id', 'notification_type', 'title', 'message', 
                         'related_chat_id', 'related_course_id', 
                         'is_read', 'created_at']
        
        return SimpleNotificationSerializer
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Получить количество непрочитанных уведомлений"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Пометить все уведомления как прочитанные"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'message': 'Все уведомления помечены как прочитанные'})
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Пометить одно уведомление как прочитанное"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Уведомление помечено как прочитанное'})
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Получить последние 10 уведомлений"""
        notifications = self.get_queryset()[:10]
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)