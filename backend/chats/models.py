from django.db import models

class Chat(models.Model):
    name = models.CharField(max_length=200, verbose_name="Название чата")
    description = models.TextField(blank=True, verbose_name="Описание")

    department = models.ForeignKey(
        'users.Department',
        on_delete=models.CASCADE,
        related_name='chats',
        verbose_name="Департамент"
    )

    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='created_chats',
        verbose_name="Создатель"
    )

    teachers = models.ManyToManyField(
        'users.User',
        related_name='teaching_chats',
        limit_choices_to={'role': 'teacher'},
        verbose_name="Преподаватели"
    )

    study_groups = models.ManyToManyField(
        'users.StudyGroup',
        related_name='chats',
        verbose_name="Учебные группы"
    )

    attached_courses = models.ManyToManyField(
        'courses.Course',
        related_name='attached_to_chats',
        blank=True,
        verbose_name="Прикреплённые курсы"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    def __str__(self):
        return f"{self.name} (Департамент: {self.department.name})"
    
    class Meta:
        verbose_name = "Учебный чат"
        verbose_name_plural = "Учебные чаты"
        ordering = ['-created_at']
    
    # Метод для проверки ограничения на 2 курса
    def can_attach_course(self):
        return self.attached_courses.count() < 2
    

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
    
    def __str__(self):
        return f"{self.author}: {self.content[:50]}..."
    
    class Meta:
        verbose_name = "Сообщение"
        verbose_name_plural = "Сообщения"
        ordering = ['created_at']