from rest_framework import serializers
from .models import Chat, Message
from users.serializers import UserSerializer
# from courses.serializers import CourseSerializer

class ChatSerializer(serializers.ModelSerializer):
    """Сериализатор для чатов"""
    chat_type_display = serializers.CharField(source='get_chat_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    participants_info = UserSerializer(source='participants', many=True, read_only=True)
    teachers_info = UserSerializer(source='teachers', many=True, read_only=True)
    study_groups_info = serializers.StringRelatedField(source='study_groups', many=True, read_only=True)
    attached_courses_info = serializers.StringRelatedField(source='attached_courses', many=True, read_only=True) # временно, пока нет сериалайзера для курсов
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = [
            'id', 'name', 'chat_type', 'chat_type_display', 'description',
            'department', 'created_by', 'created_by_name', 'created_at', 'updated_at',
            'teachers', 'teachers_info', 'study_groups', 'study_groups_info',
            'participants', 'participants_info', 'attached_courses', 'attached_courses_info',
            'last_message', 'unread_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_last_message(self, obj):
        """Получить последнее сообщение в чате"""
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'content': last_msg.content[:100],
                'author': last_msg.author.get_full_name(),
                'created_at': last_msg.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        """Получить количество непрочитанных сообщений (пока заглушка)"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Здесь позже добавим логику подсчёта непрочитанных
            return 0
        return 0
    
    def validate(self, data):
        """Валидация данных в зависимости от типа чата"""
        chat_type = data.get('chat_type', self.instance.chat_type if self.instance else None)
        
        if chat_type == Chat.ChatType.GROUP:
            # Учебный чат должен иметь департамент
            if not data.get('department'):
                raise serializers.ValidationError({
                    "department": "Учебный чат должен иметь департамент"
                })
            # Учебный чат должен иметь хотя бы одну группу или преподавателя
            if not data.get('study_groups') and not data.get('teachers'):
                raise serializers.ValidationError({
                    "detail": "Учебный чат должен иметь хотя бы одну учебную группу или преподавателя"
                })
        
        elif chat_type == Chat.ChatType.PERSONAL:
            # Личный чат должен иметь участников (2 человека)
            participants = data.get('participants', [])
            if len(participants) != 2:
                raise serializers.ValidationError({
                    "participants": "Личный чат должен иметь ровно 2 участника"
                })
            # Убираем лишние поля для личных чатов
            data['department'] = None
            data['teachers'] = []
            data['study_groups'] = []
            data['attached_courses'] = []
        
        return data


class MessageSerializer(serializers.ModelSerializer):
    """Сериализатор для сообщений"""
    author_info = UserSerializer(source='author', read_only=True)
    chat_name = serializers.CharField(source='chat.name', read_only=True)
    parent_message_content = serializers.CharField(source='parent_message.content', read_only=True, allow_null=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'chat', 'chat_name', 'author', 'author_info', 'content',
            'parent_message', 'parent_message_content', 'created_at'
        ]
        read_only_fields = ['author', 'created_at']
    
    def create(self, validated_data):
        """Автоматически устанавливаем автора сообщения"""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)