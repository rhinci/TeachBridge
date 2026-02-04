from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatViewSet, MessageViewSet, ChatSectionViewSet, MessageAttachmentViewSet

router = DefaultRouter()
router.register(r'chats', ChatViewSet, basename='chat')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'chat-sections', ChatSectionViewSet, basename='chatsection')
router.register(r'attachments', MessageAttachmentViewSet, basename='attachment')

urlpatterns = [
    path('', include(router.urls)),
]