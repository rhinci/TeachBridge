# backend/apps/users/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from .serializers import (
    UserRegistrationSerializer, 
    UserSerializer,
    StudyGroupSerializer,
    DepartmentSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .models import StudyGroup, Department
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import PasswordResetCode

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet для управления пользователями"""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """Разные permissions для разных действий"""
        if self.action in ['register', 'login', 'study_groups', 'departments', 'password_reset_request', 'password_reset_confirm']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['retrieve', 'update', 'partial_update', 'me']:
            permission_classes = [permissions.IsAuthenticated]
        else:  # list, create, destroy
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        """Регистрация нового пользователя"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Здесь позже добавим создание уведомления для администратора
            
            return Response({
                'message': 'Регистрация успешна! Ожидайте подтверждения администратором.',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        """Авторизация пользователя"""
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Пожалуйста, предоставьте email и пароль'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Аутентифицируем пользователя
        user = authenticate(username=email, password=password)
        
        if user is None:
            return Response(
                {'error': 'Неверные учетные данные'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_approved:
            return Response(
                {'error': 'Ваш аккаунт еще не подтвержден администратором'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Ваш аккаунт отключен'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Генерируем JWT токены
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """Получение информации о текущем пользователе"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='study-groups')
    def study_groups(self, request):
        """Получение списка учебных групп (для формы регистрации)"""
        groups = StudyGroup.objects.all()
        serializer = StudyGroupSerializer(groups, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='departments')
    def departments(self, request):
        """Получение списка департаментов"""
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)
    


    @action(detail=False, methods=['post'], url_path='password-reset/request')
    def password_reset_request(self, request):
        """Запрос на восстановление пароля"""
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                
                # Создаём новый код (старые помечаем как использованные)
                PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)
                reset_code = PasswordResetCode.objects.create(user=user)

                subject = 'Восстановление пароля - Образовательная платформа ДВФУ'
                message = f"""
                Восстановление пароля для образовательной платформы ДВФУ

                Здравствуйте, {user.get_full_name()}!

                Вы запросили восстановление пароля для вашего аккаунта.

                Код восстановления: {reset_code.code}

                Код действителен 15 минут.

                Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.

                С уважением,
                Команда TeachBridge
                """
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email='noreply@dvfu.ru',
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                
                # Для тестирования - возвращаем код в ответе
                # В ПРОДАКШЕНЕ ЭТО УБРАТЬ!
                return Response({
                    'message': 'Код восстановления отправлен на вашу почту',
                    'email': user.email,
                    'code': reset_code.code  # ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ!
                })
                
            except User.DoesNotExist:
                # Для безопасности не говорим, существует ли пользователь
                return Response({
                    'message': 'Если email зарегистрирован, код будет отправлен'
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudyGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для учебных групп (только чтение)"""
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для департаментов (только чтение)"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]