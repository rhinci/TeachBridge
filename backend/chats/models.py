from django.db import models

class Chat(models.Model):
    """Модель чата (может быть учебным или личным)"""
    
    class ChatType(models.TextChoices):
        GROUP = 'group', 'Учебный чат'
        PERSONAL = 'personal', 'Личный чат'
    
    name = models.CharField(
        max_length=200, 
        verbose_name="Название",
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
        limit_choices_to={'role': 'teacher'},
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
        """Автоматически генерируем название для личных чатов"""
        if self.chat_type == self.ChatType.PERSONAL and not self.name:
            # Название как "User1 - User2"
            participants = list(self.participants.all())
            if len(participants) == 2:
                names = [p.get_full_name() for p in participants]
                self.name = " - ".join(names)
        super().save(*args, **kwargs)

class Message(models.Model):
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name="Чат"
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