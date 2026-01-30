from django.db import models
from uuid import uuid4
import os


def chat_avatar_upload_path(instance, filename):
    if instance.chat_type == Chat.ChatType.GROUP:
        # Для учебных чатов: chat_avatars/группа/{uuid}.{ext}
        ext = filename.split('.')[-1]
        filename = f"{uuid4()}.{ext}"
        return os.path.join('chat_avatars', 'group', filename)
    else:
        # Для личных чатов аватарка не используется
        return None

class Chat(models.Model):
    
    class ChatType(models.TextChoices):
        GROUP = 'group', 'Учебный чат'
        PERSONAL = 'personal', 'Личный чат'
    
    name = models.CharField(
        max_length=200, 
        verbose_name="Название",
        blank=True,
        help_text="Для учебных чатов: название дисциплины. Для личных: автоматически генерируется"
    )
    
    chat_type = models.CharField(
        max_length=20,
        choices=ChatType.choices,
        default=ChatType.GROUP,
        verbose_name="Тип чата"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Описание"
    )

    avatar = models.ImageField(
        upload_to=chat_avatar_upload_path,
        blank=True,
        null=True,
        verbose_name="Аватарка чата",
        help_text="Только для учебных чатов. Рекомендуемый размер: 200x200 пикселей"
    )
    
    # Для учебных чатов
    department = models.ForeignKey(
        'users.Department',
        on_delete=models.CASCADE,
        related_name='chats',
        null=True,
        blank=True,
        verbose_name="Департамент"
    )
    
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='created_chats',
        verbose_name="Создатель"
    )
    
    # Для учебных чатов
    teachers = models.ManyToManyField(
        'users.User',
        related_name='teaching_chats',
        limit_choices_to=models.Q(role='teacher') | models.Q(role='director'),
        blank=True,
        verbose_name="Преподаватели"
    )
    
    study_groups = models.ManyToManyField(
        'users.StudyGroup',
        related_name='chats',
        blank=True,
        verbose_name="Учебные группы"
    )
    
    # Для личных чатов
    participants = models.ManyToManyField(
        'users.User',
        related_name='personal_chats',
        blank=True,
        verbose_name="Участники"
    )
    
    # Связь с курсами (только для учебных чатов)
    attached_courses = models.ManyToManyField(
        'courses.Course',
        related_name='attached_to_chats',
        blank=True,
        verbose_name="Прикреплённые курсы"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Чат"
        verbose_name_plural = "Чаты"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_chat_type_display()})"
    
    def save(self, *args, **kwargs):
        if self.chat_type == self.ChatType.PERSONAL and not self.name:
            # Название как "User1 - User2"
            participants = list(self.participants.all())
            if len(participants) == 2:
                names = [p.get_full_name() for p in participants]
                self.name = " - ".join(names)

        # Удаляем аватарку для личных чатов
        if self.chat_type == self.ChatType.PERSONAL:
            if self.avatar:
                if os.path.isfile(self.avatar.path):
                    os.remove(self.avatar.path)
                self.avatar = None
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and self.chat_type == self.ChatType.GROUP:
            self._create_default_section()

        if self.chat_type == self.ChatType.GROUP:
            self._sync_participants_from_groups()

    def _sync_participants_from_groups(self):
        if not self.study_groups.exists():
            return
        
        from users.models import User
        students = User.objects.filter(
            study_group__in=self.study_groups.all(),
            role='student'
        )
        
        # Добавляем студентов как участников
        current_participants = set(self.participants.all())
        students_to_add = set(students) - current_participants
        
        if students_to_add:
            self.participants.add(*students_to_add)
        
        # Также добавляем преподавателей как участников
        teachers_to_add = set(self.teachers.all()) - current_participants
        if teachers_to_add:
            self.participants.add(*teachers_to_add)
        
        # Добавляем создателя чата как участника (если его еще нет)
        if self.created_by not in current_participants:
            self.participants.add(self.created_by)

    def _create_default_section(self):
        from .models import ChatSection

        if not self.sections.filter(name='#general').exists():
            ChatSection.objects.create(
                chat=self,
                name='#general',
                order=0,
                created_by=self.created_by
            )

    def get_avatar_url(self):
        if self.chat_type == self.ChatType.GROUP and self.avatar:
            return self.avatar.url
        elif self.chat_type == self.ChatType.PERSONAL:
            # Для личных чатов возвращаем аватарку собеседника
            participants = self.participants.all()
            if participants.count() == 2:
                return None
        return None
    
    @property
    def display_avatar_url(self):
        return self.get_avatar_url()

class Message(models.Model):
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name="Чат"
    )
    
    section = models.ForeignKey(
        'ChatSection',
        on_delete=models.CASCADE,
        null=False,
        related_name='messages',
        verbose_name="Раздел",
        default=1,
        help_text="Cообщение будет относиться к конкретному разделу"
    )
    
    author = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name="Автор"
    )
    
    content = models.TextField(verbose_name="Содержание")
    
    parent_message = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name="Ответ на сообщение"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Сообщение"
        verbose_name_plural = "Сообщения"
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.author}: {self.content[:50]}..."
    
    def save(self, *args, **kwargs):
        if not self.section_id and self.chat_id:
            general_section = self.chat.sections.filter(name='#general').first()
            if not general_section:
                general_section = ChatSection.objects.create(
                    chat=self.chat,
                    name='#general',
                    order=0,
                    created_by=self.chat.created_by
                )
            self.section = general_section
        
        if self.section and self.section.chat != self.chat:
            raise ValueError("Раздел должен принадлежать тому же чату")
        super().save(*args, **kwargs)
    

class ChatSection(models.Model):
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='sections',
        verbose_name="Чат",
        limit_choices_to={'chat_type': Chat.ChatType.GROUP}  # Только для учебных чатов
    )
    
    name = models.CharField(max_length=200, verbose_name="Название раздела")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")
    
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_chat_sections',
        verbose_name="Создатель раздела"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Раздел чата"
        verbose_name_plural = "Разделы чатов"
        ordering = ['order', 'created_at']
        unique_together = ['chat', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.chat.name})"