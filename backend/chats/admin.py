from django.contrib import admin
from django import forms
from django.utils.html import format_html
from django.core.exceptions import ValidationError
from .models import Chat, Message, ChatSection

class ChatSectionInline(admin.TabularInline):
    """Разделы чата в админке (только для учебных)"""
    model = ChatSection
    extra = 1
    readonly_fields = ['created_by', 'created_at']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(chat__chat_type='group')
    
    def has_add_permission(self, request, obj=None):
        # Разделы можно добавлять только к учебным чатам
        if obj and obj.chat_type == 'group':
            return True
        return False

class ChatAdminForm(forms.ModelForm):
    """Кастомная форма для чатов с валидацией"""
    class Meta:
        model = Chat
        fields = '__all__'
    
    def clean(self):
        """Кастомная валидация в зависимости от типа чата"""
        cleaned_data = super().clean()
        chat_type = cleaned_data.get('chat_type')
        name = cleaned_data.get('name')
        
        if chat_type == 'group':
            # Для учебных чатов название обязательно
            if not name:
                self.add_error('name', 'Для учебного чата обязательно укажите название')
            
            # Учебный чат должен иметь департамент
            if not cleaned_data.get('department'):
                self.add_error('department', 'Учебный чат должен иметь департамент')
        
        elif chat_type == 'personal':
            # Для личных чатов проверяем участников
            participants = cleaned_data.get('participants', [])
            if len(participants) != 2:
                self.add_error('participants', 'Личный чат должен иметь ровно 2 участника')
            
            # Если название не указано - оно сгенерируется автоматически
            # не добавляем ошибку для name
        
        return cleaned_data

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    form = ChatAdminForm
    list_display = ['name', 'chat_type', 'department', 'created_by', 'participants_list', 'created_at']
    list_filter = ['chat_type', 'department', 'created_at']
    search_fields = ['name', 'description']
    filter_horizontal = ['teachers', 'study_groups', 'participants', 'attached_courses']
    inlines = [ChatSectionInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('chat_type', 'name', 'description')
        }),
        ('Учебный чат', {
            'fields': ('department', 'teachers', 'study_groups', 'attached_courses', 'avatar'),
            'classes': ('fieldset-group',),
        }),
        ('Личный чат', {
            'fields': ('participants',),
            'classes': ('fieldset-group',),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def participants_list(self, obj):
        """Отображение участников в списке"""
        participants = obj.participants.all()
        if obj.chat_type == 'personal':
            return format_html('<span title="{}">{}</span>', 
                             ' ↔ '.join([p.get_full_name() for p in participants]),
                             ' ↔ '.join([p.get_full_name() for p in participants]))
        else:
            count = participants.count()
            return format_html('<span title="{} участников">👥 {}</span>', 
                             count, count)
    participants_list.short_description = 'Участники'
    
    def get_fieldsets(self, request, obj=None):
        """Динамически меняем fieldsets в зависимости от типа чата"""
        # Базовый набор полей для нового чата
        fieldsets = list(super().get_fieldsets(request, obj))
        
        # Если объект уже существует
        if obj:
            if obj.chat_type == 'personal':
                # Скрываем поля учебного чата
                fieldsets = [
                    fieldsets[0],  # Основная информация
                    fieldsets[2],  # Личный чат
                ]
            elif obj.chat_type == 'group':
                # Скрываем поле участников (оно заполняется автоматически)
                fieldsets = [
                    fieldsets[0],  # Основная информация
                    fieldsets[1],  # Учебный чат
                ]
        
        return fieldsets
    
    def get_form(self, request, obj=None, **kwargs):
        """Переопределяем форму для динамического изменения"""
        form = super().get_form(request, obj, **kwargs)
        
        # Настройка помощи для полей
        form.base_fields['name'].help_text = 'Обязательно для учебных чатов. Для личных чатов сгенерируется автоматически'
        
        if obj:
            if obj.chat_type == 'personal':
                # Для личных чатов делаем name необязательным
                form.base_fields['name'].required = False
                form.base_fields['name'].help_text = 'Можно оставить пустым - название сгенерируется автоматически'
                
                # Скрываем ненужные поля
                for field in ['department', 'teachers', 'study_groups', 'attached_courses', 'avatar']:
                    if field in form.base_fields:
                        form.base_fields[field].widget = forms.HiddenInput()
                        form.base_fields[field].required = False
            
            elif obj.chat_type == 'group':
                # Для учебных чатов name обязательно
                form.base_fields['name'].required = True
                form.base_fields['participants'].widget = forms.HiddenInput()
                form.base_fields['participants'].required = False
        
        return form
    
    def save_model(self, request, obj, form, change):
        """Автоматически устанавливаем создателя и обрабатываем логику"""
        if not obj.pk:
            obj.created_by = request.user
        
        # Для личных чатов генерируем название, если оно пустое
        if obj.chat_type == 'personal' and not obj.name:
            participants = list(form.cleaned_data.get('participants', []))
            if len(participants) == 2:
                names = [p.get_full_name() for p in participants]
                obj.name = " ↔ ".join(names)
        
        super().save_model(request, obj, form, change)
        
        # Для учебных чатов автоматически добавляем участников
        if obj.chat_type == 'group':
            obj._sync_participants_from_groups()
    
    def save_related(self, request, form, formsets, change):
        """Обрабатываем сохранение связанных объектов"""
        super().save_related(request, form, formsets, change)
        
        # После сохранения ManyToMany полей
        if form.instance.chat_type == 'group':
            form.instance._sync_participants_from_groups()

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['truncated_content', 'author', 'chat', 'section', 'created_at']
    list_filter = ['chat', 'section', 'created_at']
    search_fields = ['content', 'author__first_name', 'author__last_name']
    
    def truncated_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    truncated_content.short_description = 'Сообщение'
    
    def get_queryset(self, request):
        """Оптимизируем запросы"""
        qs = super().get_queryset(request)
        return qs.select_related('author', 'chat', 'section')

@admin.register(ChatSection)
class ChatSectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'chat', 'order', 'created_by', 'created_at']
    list_filter = ['chat', 'created_at']
    search_fields = ['name', 'description']
    
    def get_queryset(self, request):
        """Ограничиваем выбор чатов только учебными"""
        qs = super().get_queryset(request)
        return qs.filter(chat__chat_type='group')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Ограничиваем выбор чатов при создании раздела"""
        if db_field.name == "chat":
            kwargs["queryset"] = Chat.objects.filter(chat_type='group')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)