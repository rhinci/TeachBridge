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
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    def __str__(self):
        return f"{self.name} (Департамент: {self.department.code})"
    
    class Meta:
        verbose_name = "Учебный чат"
        verbose_name_plural = "Учебные чаты"
        ordering = ['-created_at']