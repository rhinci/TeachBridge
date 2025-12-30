from django.contrib import admin
from .models import Chat

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'created_by', 'created_at')
    list_filter = ('department', 'created_at')
    filter_horizontal = ('teachers', 'study_groups')
    search_fields = ('name', 'description')
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)