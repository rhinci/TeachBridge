from django.contrib import admin
from .models import Notification, NotificationSettings

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'status', 'created_at']
    list_filter = ['notification_type', 'status', 'created_at']
    search_fields = ['user__username', 'user__email', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    list_editable = ['status']
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        queryset.update(status='read')
    mark_as_read.short_description = "Пометить как прочитанные"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(status='unread')
    mark_as_unread.short_description = "Пометить как непрочитанные"

@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'enable_push_notifications', 'receive_message_notifications']
    list_filter = ['enable_push_notifications']
    search_fields = ['user__username', 'user__email']