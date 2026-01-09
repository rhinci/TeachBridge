# backend/apps/chats/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from users.models import User

class ChatViewSet(viewsets.ModelViewSet):
    """ViewSet для управления чатами"""
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Пользователь видит только свои чаты"""
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
        """Автоматически устанавливаем создателя чата"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def group_chats(self, request):
        """Получить только учебные чаты"""
        chats = self.get_queryset().filter(chat_type=Chat.ChatType.GROUP)
        serializer = self.get_serializer(chats, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def personal_chats(self, request):
        """Получить только личные чаты"""
        chats = self.get_queryset().filter(chat_type=Chat.ChatType.PERSONAL)
        serializer = self.get_serializer(chats, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['post'], url_path='create-personal')
    def create_personal_chat(self, request):
        """Создать личный чат с пользователем"""
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {"error": "Не указан user_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            other_user = User.objects.get(id=user_id)
            
            # Проверяем, нет ли уже личного чата
            existing_chat = Chat.objects.filter(
                chat_type=Chat.ChatType.PERSONAL,
                participants=request.user
            ).filter(participants=other_user).distinct().first()
            
            if existing_chat:
                return Response(ChatSerializer(existing_chat).data)
            
            # Создаём новый
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


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet для сообщений"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Пользователь видит сообщения только из своих чатов"""
        user = self.request.user
        user_chats = Chat.objects.filter(
            Q(study_groups=user.study_group) | 
            Q(teachers=user) |
            Q(participants=user) |
            Q(created_by=user)
        ).distinct()
        
        return Message.objects.filter(chat__in=user_chats).order_by('created_at')
    
    def perform_create(self, serializer):
        """Автоматически устанавливаем автора"""
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'])
    def chat_messages(self, request):
        """Получить сообщения конкретного чата"""
        chat_id = request.query_params.get('chat_id')
        if not chat_id:
            return Response(
                {"error": "Не указан chat_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        messages = self.get_queryset().filter(chat_id=chat_id)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)