from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Chat, Message, ChatSection, MessageAttachment
from .serializers import ChatSerializer, MessageSerializer, ChatSectionSerializer, MessageAttachmentSerializer, MessageCreateSerializer
from users.models import User
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Chat.objects.all()
        
        elif user.role == 'director':
            # Директор видит чаты своего департамента
            return Chat.objects.filter(
                Q(department=user.department) | 
                Q(participants=user) |
                Q(created_by=user)
            ).distinct()
        
        elif user.role == 'teacher':
            # Преподаватель видит чаты где он учитель или его личные
            return Chat.objects.filter(
                Q(teachers=user) | 
                Q(participants=user) |
                Q(created_by=user)
            ).distinct()
        
        elif user.role == 'student':
            # Студент видит чаты своей группы или личные
            return Chat.objects.filter(
                Q(study_groups=user.study_group) | 
                Q(participants=user)
            ).distinct()
        
        return Chat.objects.none()
    
    def perform_create(self, serializer):
        chat = serializer.save(created_by=self.request.user)

        if chat.chat_type == Chat.ChatType.GROUP:
            ChatSection.objects.create(
                chat=chat,
                name='general',
                description='Основной раздел для общего обсуждения',
                order=0,
                created_by=self.request.user
            )
    
    @action(detail=False, methods=['get'])
    def group_chats(self, request):
        chats = self.get_queryset().filter(chat_type=Chat.ChatType.GROUP)
        serializer = self.get_serializer(chats, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def personal_chats(self, request):
        chats = self.get_queryset().filter(chat_type=Chat.ChatType.PERSONAL)
        serializer = self.get_serializer(chats, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['post'], url_path='create-personal')
    def create_personal_chat(self, request):
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {"error": "Не указан user_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            other_user = User.objects.get(id=user_id)

            existing_chat = Chat.objects.filter(
                chat_type=Chat.ChatType.PERSONAL,
                participants=request.user
            ).filter(participants=other_user).distinct().first()
            
            if existing_chat:
                return Response(ChatSerializer(existing_chat).data)

            chat = Chat.objects.create(
                chat_type=Chat.ChatType.PERSONAL,
                created_by=request.user
            )
            chat.participants.add(request.user, other_user)
            
            return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def sections(self, request, pk=None):
        chat = self.get_object()
        sections = chat.sections.all().order_by('order')
        serializer = ChatSectionSerializer(sections, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def create_section(self, request, pk=None):
        chat = self.get_object()

        if chat.chat_type != Chat.ChatType.GROUP:
            return Response(
                {'error': 'Разделы доступны только для учебных чатов'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user not in [chat.created_by] + list(chat.teachers.all()):
            if request.user.role not in ['teacher', 'director', 'admin']:
                return Response(
                    {'error': 'Недостаточно прав для создания разделов'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ChatSectionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(chat=chat, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def upload_avatar(self, request, pk=None):
        chat = self.get_object()

        if chat.chat_type != Chat.ChatType.GROUP:
            return Response(
                {'error': 'Аватарка доступна только для учебных чатов'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.role not in ['teacher', 'director', 'admin']:
            return Response(
                {'error': 'Только преподаватели, директора и администраторы могут загружать аватарки'},
                status=status.HTTP_403_FORBIDDEN
            )

        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response(
                {'error': 'Файл аватарки не предоставлен'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        chat.avatar = avatar_file
        chat.save()
        
        return Response({
            'message': 'Аватарка успешно загружена',
            'avatar_url': chat.avatar.url
        })
    
    @action(detail=True, methods=['delete'])
    def remove_avatar(self, request, pk=None):
        chat = self.get_object()
        
        if chat.chat_type != Chat.ChatType.GROUP:
            return Response(
                {'error': 'Аватарка доступна только для учебных чатов'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not chat.avatar:
            return Response(
                {'error': 'У чата нет аватарки'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.role not in ['teacher', 'director', 'admin']:
            return Response(
                {'error': 'Только преподаватели, директора и администраторы могут удалять аватарки'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        chat.avatar.delete(save=False)
        chat.avatar = None
        chat.save()
        
        return Response({'message': 'Аватарка успешно удалена'})
    

class ChatSectionViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSectionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ChatSection.objects.filter(
            chat__in=Chat.objects.filter(
                Q(participants=user) |
                Q(study_groups__students=user) |
                Q(teachers=user) |
                Q(created_by=user)
            )
        )
    
    def perform_create(self, serializer):
        chat = serializer.validated_data['chat']

        if chat.chat_type != Chat.ChatType.GROUP:
            raise PermissionDenied("Разделы доступны только для учебных чатов")

        if self.request.user not in [chat.created_by] + list(chat.teachers.all()):
            if self.request.user.role not in ['teacher', 'director', 'admin']:
                raise PermissionDenied("Недостаточно прав для создания разделов")
        
        serializer.save(created_by=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet для сообщений (обновленный)"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # Добавляем поддержку multipart
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MessageCreateSerializer
        return MessageSerializer
    
    def get_queryset(self):
        user = self.request.user
        user_chats = Chat.objects.filter(
            Q(study_groups=user.study_group) | 
            Q(teachers=user) |
            Q(participants=user) |
            Q(created_by=user)
        ).distinct()
        
        return Message.objects.filter(chat__in=user_chats).order_by('created_at')
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'])
    def chat_messages(self, request):
        chat_id = request.query_params.get('chat_id')
        section_id = request.query_params.get('section_id')
        
        if not chat_id:
            return Response(
                {"error": "Не указан chat_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            chat = Chat.objects.get(id=chat_id)
            if not self._has_chat_access(request.user, chat):
                return Response(
                    {"error": "У вас нет доступа к этому чату"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Chat.DoesNotExist:
            return Response(
                {"error": "Чат не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Базовый запрос для сообщений чата
        messages = self.get_queryset().filter(chat_id=chat_id)
        
        # Если указан раздел - фильтруем по нему
        if section_id:
            messages = messages.filter(section_id=section_id)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def attach_file(self, request, pk=None):
        message = self.get_object()
        
        # Проверяем, что пользователь является автором сообщения
        if message.author != request.user:
            return Response(
                {"error": "Вы можете прикреплять файлы только к своим сообщениям"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        file = request.FILES.get('file')
        if not file:
            return Response(
                {"error": "Файл не предоставлен"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Проверяем размер файла (максимум 50MB)
        if file.size > 50 * 1024 * 1024:
            return Response(
                {"error": "Файл слишком большой. Максимальный размер: 50MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Создаем прикрепленный файл
        attachment = MessageAttachment.objects.create(
            message=message,
            file=file,
            original_filename=file.name
        )
        
        return Response(MessageAttachmentSerializer(attachment).data, 
                       status=status.HTTP_201_CREATED)
    
    def _has_chat_access(self, user, chat):
        if user in chat.participants.all():
            return True
        if user in chat.teachers.all():
            return True
        if user == chat.created_by:
            return True
        if user.study_group and user.study_group in chat.study_groups.all():
            return True
        return False
    
    def get_serializer_context(self):
        """Добавляем request в контекст сериализатора"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    


class MessageAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = MessageAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        user_chats = Chat.objects.filter(
            Q(study_groups=user.study_group) | 
            Q(teachers=user) |
            Q(participants=user) |
            Q(created_by=user)
        ).distinct()
        
        return MessageAttachment.objects.filter(message__chat__in=user_chats)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Скачать прикрепленный файл"""
        attachment = self.get_object()
        
        # Проверяем доступ к файлу
        if not self._has_chat_access(request.user, attachment.message.chat):
            return Response(
                {"error": "У вас нет доступа к этому файлу"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Возвращаем файл для скачивания
        response = FileResponse(attachment.file.open(), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{attachment.original_filename}"'
        return response
    
    def _has_chat_access(self, user, chat):
        if user in chat.participants.all():
            return True
        if user in chat.teachers.all():
            return True
        if user == chat.created_by:
            return True
        if user.study_group and user.study_group in chat.study_groups.all():
            return True
        return False