from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Course, Module, Material
from .serializers import (
    CourseSerializer, CourseCreateSerializer,
    ModuleCreateSerializer, MaterialCreateSerializer,
    ModuleSerializer
)

class CourseViewSet(viewsets.ModelViewSet):
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CourseCreateSerializer
        return CourseSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_courses']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'create':
            # Создавать могут преподаватели и директора
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Редактировать может только автор
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        if self.action == 'my_courses':
            if user.role == 'student':
                # Студент: курсы, прикреплённые к его чатам
                from chats.models import Chat
                student_chats = Chat.objects.filter(study_groups=user.study_group)
                return Course.objects.filter(attached_to_chats__in=student_chats).distinct()
            else:
                # Преподаватель/директор/админ: их собственные курсы
                return Course.objects.filter(author=user)

        if user.role == 'admin':
            return Course.objects.all()
        elif user.role == 'director':
            # Директор видит курсы своего департамента
            return Course.objects.filter(department=user.department)
        elif user.role == 'teacher':
            # Преподаватель видит свои курсы и курсы своего департамента
            return Course.objects.filter(
                Q(author=user) | Q(department=user.department)
            ).distinct()
        elif user.role == 'student':
            # Студент видит курсы, прикреплённые к его чатам
            from chats.models import Chat
            student_chats = Chat.objects.filter(study_groups=user.study_group)
            return Course.objects.filter(attached_to_chats__in=student_chats).distinct()
        
        return Course.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user, department=self.request.user.department)
    
    @action(detail=False, methods=['get'], url_path='my-courses')
    def my_courses(self, request):
        courses = self.get_queryset()
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='add-module')
    def add_module(self, request, pk=None):
        course = self.get_object()
        
        # Проверяем, что пользователь автор курса
        if course.author != request.user and request.user.role not in ['admin', 'director']:
            return Response(
                {'error': 'Вы не можете добавлять модули в этот курс'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ModuleCreateSerializer(
            data=request.data,
            context={'course_id': course.id, 'request': request}
        )
        
        if serializer.is_valid():
            module = serializer.save()
            return Response(ModuleSerializer(module).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='modules/(?P<module_id>[^/.]+)/add-material')
    def add_material(self, request, pk=None, module_id=None):
        course = self.get_object()

        if course.author != request.user and request.user.role not in ['admin', 'director']:
            return Response(
                {'error': 'Вы не можете добавлять материалы в этот курс'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            module = Module.objects.get(id=module_id, course=course)
        except Module.DoesNotExist:
            return Response(
                {'error': 'Модуль не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = MaterialCreateSerializer(
            data=request.data,
            context={'module_id': module.id, 'request': request}
        )
        
        if serializer.is_valid():
            material = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def destroy(self, request, *args, **kwargs):
        module = self.get_object()
        
        if module.course.author != request.user and request.user.role not in ['admin', 'director']:
            return Response(
                {'error': 'Вы не можете удалять этот модуль'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def destroy(self, request, *args, **kwargs):
        material = self.get_object()
        
        if material.module.course.author != request.user and request.user.role not in ['admin', 'director']:
            return Response(
                {'error': 'Вы не можете удалять этот материал'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)