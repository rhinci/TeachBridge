from rest_framework import serializers
from users.models import User, Department, StudyGroup
from chats.models import Chat
from courses.models import Course

class DirectorDepartmentSerializer(serializers.ModelSerializer):
    """Сериализатор для департамента с расширенной информацией"""
    director_name = serializers.CharField(source='director.get_full_name', read_only=True)
    student_count = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()
    chat_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'director', 'director_name', 
                 'student_count', 'teacher_count', 'chat_count']
    
    def get_student_count(self, obj):
        return User.objects.filter(department=obj, role='student', is_approved=True).count()
    
    def get_teacher_count(self, obj):
        return User.objects.filter(department=obj, role='teacher').count()
    
    def get_chat_count(self, obj):
        return Chat.objects.filter(department=obj, chat_type='group').count()


class CreateGroupChatSerializer(serializers.Serializer):
    """Сериализатор для создания группового чата"""
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    study_groups = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    teachers = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    attached_courses = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )