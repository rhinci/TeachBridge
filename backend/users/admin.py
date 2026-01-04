from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Department, StudyGroup
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'director')
    search_fields = ('name', 'code')

@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    list_display = ('code', 'department')
    list_filter = ('department',)
    search_fields = ('name', 'code')

class CustomUserCreationForm(UserCreationForm):
    """Форма для создания пользователя в админке"""
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'patronymic', 
                  'role', 'study_group', 'department', 'is_approved')


class CustomUserChangeForm(UserChangeForm):
    """Форма для редактирования пользователя в админке"""
    class Meta:
        model = User
        fields = '__all__'

class CustomUserAdmin(UserAdmin):
    """Кастомный админ для пользователей"""
    
    # Поля для отображения в списке
    list_display = ('email', 'get_full_name', 'role', 'is_approved', 'is_active')
    list_filter = ('role', 'is_approved', 'is_active', 'department')
    search_fields = ('email', 'first_name', 'last_name', 'patronymic')
    
    # Порядок полей в форме
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Персональная информация'), {
            'fields': ('first_name', 'last_name', 'patronymic', 'photo')
        }),
        (_('Учебная информация'), {
            'fields': ('role', 'study_group', 'department')
        }),
        (_('Статус аккаунта'), {
            'fields': ('is_approved', 'is_active', 'is_staff', 'is_superuser')
        }),
        (_('Даты'), {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    # Поля при создании пользователя
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 
                      'patronymic', 'role', 'study_group', 'department', 'is_approved'),
        }),
    )
    
    ordering = ('email',)
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = _('ФИО')

admin.site.register(User, CustomUserAdmin)