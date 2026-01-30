from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Chat, Message, ChatSection
from .serializers import ChatSerializer, MessageSerializer, ChatSectionSerializer
from users.models import User

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
                name='#general',
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
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
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
        validated_data = serializer.validated_data

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
            
            serializer.validated_data['section'] = general_section
        
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

        messages = self.get_queryset().filter(chat_id=chat_id)

        if section_id:
            messages = messages.filter(section_id=section_id)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context