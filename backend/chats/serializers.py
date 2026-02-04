from rest_framework import serializers
from .models import Chat, Message, ChatSection, MessageAttachment
from users.serializers import UserSerializer
    

class ChatSectionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSection
        fields = ['id', 'name', 'order', 'chat', 
                 'created_by', 'created_by_name', 'message_count',
                 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)



class ChatSerializer(serializers.ModelSerializer):
    chat_type_display = serializers.CharField(source='get_chat_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    participants_info = UserSerializer(source='participants', many=True, read_only=True)
    teachers_info = UserSerializer(source='teachers', many=True, read_only=True)
    study_groups_info = serializers.StringRelatedField(source='study_groups', many=True, read_only=True)
    attached_courses_info = serializers.StringRelatedField(source='attached_courses', many=True, read_only=True) # временно, пока нет сериалайзера для курсов
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    display_avatar = serializers.SerializerMethodField()
    sections = ChatSectionSerializer(many=True, read_only=True)
    section_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = [
            'id', 'name', 'chat_type', 'chat_type_display', 'description', 'avatar', 'avatar_url', 'display_avatar',
            'department', 'created_by', 'created_by_name', 'created_at', 'updated_at',
            'teachers', 'teachers_info', 'study_groups', 'study_groups_info',
            'participants', 'participants_info', 'attached_courses', 'attached_courses_info',
            'sections', 'section_count',
            'last_message', 'unread_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None
    
    def get_section_count(self, obj):
        if obj.chat_type == Chat.ChatType.GROUP:
            return obj.sections.count()
        return 0
    
    def get_display_avatar(self, obj):
        if obj.chat_type == Chat.ChatType.GROUP:
            if obj.avatar:
                return obj.avatar.url
            else:
                return '/media/default_chat_avatar.png'
        else:
            request = self.context.get('request')
            if request and request.user:
                participants = obj.participants.exclude(id=request.user.id)
                if participants.exists():
                    participant = participants.first()
                    if participant.photo:
                        return participant.photo.url
                    else:
                        return '/media/default_user_avatar.png'
            return '/media/default_user_avatar.png'
    
    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'content': last_msg.content[:100],
                'author': last_msg.author.get_full_name(),
                'created_at': last_msg.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return 0
        return 0
    
    def validate(self, data):
        chat_type = data.get('chat_type', self.instance.chat_type if self.instance else None)
        
        if chat_type == Chat.ChatType.GROUP:
            if not data.get('department'):
                raise serializers.ValidationError({
                    "department": "Учебный чат должен иметь департамент"
                })
            if not data.get('study_groups') and not data.get('teachers'):
                raise serializers.ValidationError({
                    "detail": "Учебный чат должен иметь хотя бы одну учебную группу или преподавателя"
                })
        
        elif chat_type == Chat.ChatType.PERSONAL:
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
    
    unread_count = serializers.SerializerMethodField()
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from notifications.models import Notification
            return Notification.objects.filter(
                user=request.user,
                related_chat_id=obj.id,
                is_read=False
            ).count()
        return 0


class MessageAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    human_file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = MessageAttachment
        fields = [
            'id', 'file', 'file_url', 'original_filename', 
            'file_type', 'file_size', 'human_file_size', 
            'uploaded_at'
        ]
        read_only_fields = ['id', 'file_type', 'file_size', 'human_file_size', 'uploaded_at']
    
    def get_file_url(self, obj):
        """URL для скачивания файла"""
        if obj.file:
            return obj.file.url
        return None
    
    def get_human_file_size(self, obj):
        """Человеко-читаемый размер файла"""
        return obj.human_file_size


class MessageSerializer(serializers.ModelSerializer):
    """Сериализатор для сообщений (обновленный)"""
    author_info = UserSerializer(source='author', read_only=True)
    chat_name = serializers.CharField(source='chat.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True, allow_null=True)
    parent_message_content = serializers.CharField(source='parent_message.content', read_only=True, allow_null=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    has_attachments = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'chat', 'chat_name', 'section', 'section_name',
            'author', 'author_info', 'content',
            'parent_message', 'parent_message_content',
            'attachments', 'has_attachments', 'created_at'
        ]
        read_only_fields = ['author', 'created_at', 'has_attachments']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        
        # Если раздел не указан, находим #general для этого чата
        if not validated_data.get('section'):
            chat = validated_data['chat']
            general_section = chat.sections.filter(name='#general').first()
            if not general_section:
                general_section = ChatSection.objects.create(
                    chat=chat,
                    name='#general',
                    description='Основной раздел для общего обсуждения',
                    order=0,
                    created_by=chat.created_by
                )
            validated_data['section'] = general_section
        
        return super().create(validated_data)
    



class MessageCreateSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(max_length=100),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Message
        fields = ['chat', 'section', 'content', 'parent_message', 'attachments']
    
    def validate(self, data):
        request = self.context.get('request')

        chat = data.get('chat')
        if chat and request.user:
            if not chat.participants.filter(id=request.user.id).exists():
                if request.user not in chat.teachers.all():
                    if not (request.user.study_group and request.user.study_group in chat.study_groups.all()):
                        raise serializers.ValidationError(
                            "У вас нет доступа к этому чату"
                        )
        
        # Проверяем размер файлов
        attachments = data.get('attachments', [])
        for attachment in attachments:
            if attachment.size > 50 * 1024 * 1024:  # 50MB max
                raise serializers.ValidationError(
                    f"Файл {attachment.name} слишком большой. Максимальный размер: 50MB"
                )
        
        return data
    
    def create(self, validated_data):
        attachments = validated_data.pop('attachments', [])
        
        # Создаем сообщение
        validated_data['author'] = self.context['request'].user
        
        # Если раздел не указан, находим #general для этого чата
        if not validated_data.get('section'):
            chat = validated_data['chat']
            general_section = chat.sections.filter(name='#general').first()
            if not general_section:
                general_section = ChatSection.objects.create(
                    chat=chat,
                    name='#general',
                    description='Основной раздел для общего обсуждения',
                    order=0,
                    created_by=chat.created_by
                )
            validated_data['section'] = general_section
        
        message = Message.objects.create(**validated_data)
        
        # Прикрепляем файлы
        for attachment_file in attachments:
            MessageAttachment.objects.create(
                message=message,
                file=attachment_file,
                original_filename=attachment_file.name
            )
        
        return message

