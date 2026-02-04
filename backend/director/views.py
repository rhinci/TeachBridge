from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Q
from users.models import User, Department, StudyGroup
from chats.models import Chat, ChatSection
from courses.models import Course
from users.serializers import UserSerializer, StudyGroupSerializer
from chats.serializers import ChatSerializer
from courses.serializers import CourseSerializer
import json
from rest_framework.permissions import IsAuthenticated

class IsDirector(permissions.BasePermission):
    """Проверка, что пользователь - директор департамента"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'director'

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsDirector])
def pending_registrations(request):
    """Получить список неподтверждённых студентов своего департамента"""
    if not request.user.department:
        return Response(
            {"error": "У вас не назначен департамент"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Студенты текущего департамента, которые не подтверждены
    pending_students = User.objects.filter(
        department=request.user.department,
        role='student',
        is_approved=False
    ).select_related('study_group')
    
    serializer = UserSerializer(pending_students, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsDirector])
def approve_student(request, user_id):
    """Подтвердить регистрацию студента"""
    if not request.user.department:
        return Response(
            {"error": "У вас не назначен департамент"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    student = get_object_or_404(User, id=user_id)
    
    # Проверяем, что студент из того же департамента
    if student.department != request.user.department:
        return Response(
            {"error": "Студент не принадлежит вашему департаменту"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if student.role != 'student':
        return Response(
            {"error": "Можно подтверждать только студентов"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    student.is_approved = True
    student.save()
    
    return Response({
        "message": f"Регистрация студента {student.get_full_name()} подтверждена",
        "user": UserSerializer(student).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsDirector])
def reject_student(request, user_id):
    """Отклонить регистрацию студента"""
    if not request.user.department:
        return Response(
            {"error": "У вас не назначен департамент"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    student = get_object_or_404(User, id=user_id)
    
    # Проверяем, что студент из того же департамента
    if student.department != request.user.department:
        return Response(
            {"error": "Студент не принадлежит вашему департаменту"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if student.role != 'student':
        return Response(
            {"error": "Можно отклонять только студентов"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Удаляем пользователя
    student_email = student.email
    student.delete()
    
    return Response({
        "message": f"Регистрация студента {student_email} отклонена и удалена"
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsDirector])
def create_group_chat(request):
    """Создать учебный чат"""
    if not request.user.department:
        return Response(
            {"error": "У вас не назначен департамент"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Проверяем данные
    name = request.data.get('name')
    description = request.data.get('description', '')
    study_group_ids = request.data.get('study_groups', [])
    teacher_ids = request.data.get('teachers', [])
    attached_course_ids = request.data.get('attached_courses', [])
    
    if not name:
        return Response(
            {"error": "Не указано название чата"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not study_group_ids and not teacher_ids:
        return Response(
            {"error": "Укажите хотя бы одну учебную группу или преподавателя"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Проверяем, что группы принадлежат департаменту директора
    study_groups = StudyGroup.objects.filter(
        id__in=study_group_ids,
        department=request.user.department
    )
    
    if len(study_groups) != len(study_group_ids):
        return Response(
            {"error": "Некоторые учебные группы не принадлежат вашему департаменту"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Проверяем преподавателей (только учителя или директоры того же департамента)
    teachers = User.objects.filter(
        id__in=teacher_ids,
        role__in=['teacher', 'director'],
        department=request.user.department
    )
    
    # Создаем чат
    chat = Chat.objects.create(
        name=name,
        description=description,
        chat_type='group',
        department=request.user.department,
        created_by=request.user
    )
    
    # Добавляем группы, преподавателей
    if study_groups:
        chat.study_groups.set(study_groups)
    
    if teachers:
        chat.teachers.set(teachers)
    
    # Прикрепляем курсы (проверяем, что курсы принадлежат департаменту)
    if attached_course_ids:
        courses = Course.objects.filter(
            id__in=attached_course_ids,
            department=request.user.department
        )
        if courses.exists():
            chat.attached_courses.set(courses)
    
    # Автоматически добавляем участников
    chat._sync_participants_from_groups()
    
    # Создаем стандартный раздел #general
    ChatSection.objects.create(
        chat=chat,
        name='#general',
        description='Основной раздел для общего обсуждения',
        order=0,
        created_by=request.user
    )
    
    return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsDirector])
def department_info(request):
    """Получить информацию о департаменте директора"""
    if not request.user.department:
        return Response(
            {"error": "У вас не назначен департамент"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    department = request.user.department
    
    # Статистика
    total_students = User.objects.filter(
        department=department,
        role='student',
        is_approved=True
    ).count()
    
    pending_students = User.objects.filter(
        department=department,
        role='student',
        is_approved=False
    ).count()
    
    teachers = User.objects.filter(
        department=department,
        role='teacher'
    ).count()
    
    study_groups = StudyGroup.objects.filter(department=department).count()
    
    # Чаты департамента
    department_chats = Chat.objects.filter(
        department=department,
        chat_type='group'
    ).count()
    
    # Курсы департамента
    department_courses = Course.objects.filter(department=department).count()
    
    # Учебные группы с количеством студентов
    groups_with_counts = []
    for group in StudyGroup.objects.filter(department=department):
        student_count = User.objects.filter(
            study_group=group,
            role='student',
            is_approved=True
        ).count()
        groups_with_counts.append({
            'id': group.id,
            'name': group.name,
            'student_count': student_count
        })
    
    return Response({
        "department": {
            "id": department.id,
            "name": department.name,
            "director": department.director.get_full_name() if department.director else None
        },
        "statistics": {
            "total_students": total_students,
            "pending_students": pending_students,
            "teachers": teachers,
            "study_groups": study_groups,
            "department_chats": department_chats,
            "department_courses": department_courses
        },
        "study_groups": groups_with_counts,
        "recent_chats": ChatSerializer(
            Chat.objects.filter(department=department, chat_type='group')[:5],
            many=True
        ).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsDirector])
def department_chats(request):
    """Получить все чаты департамента"""
    if not request.user.department:
        return Response(
            {"error": "У вас не назначен департамент"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    chats = Chat.objects.filter(
        department=request.user.department,
        chat_type='group'
    ).prefetch_related('study_groups', 'teachers', 'participants')
    
    return Response(ChatSerializer(chats, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsDirector])
def department_users(request):
    """Получить всех пользователей департамента"""
    if not request.user.department:
        return Response(
            {"error": "У вас не назначен департамент"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    role = request.query_params.get('role', None)
    
    users = User.objects.filter(department=request.user.department)
    
    if role:
        users = users.filter(role=role)
    
    # Для студентов показываем только подтвержденных
    if role == 'student':
        users = users.filter(is_approved=True)
    
    return Response(UserSerializer(users, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsDirector])
def department_courses(request):
    """Получить все курсы департамента"""
    if not request.user.department:
        return Response(
            {"error": "У вас не назначен департамент"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    courses = Course.objects.filter(department=request.user.department)
    return Response(CourseSerializer(courses, many=True).data)