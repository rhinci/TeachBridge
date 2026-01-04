from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Department, StudyGroup

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации пользователя"""
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 
                  'patronymic', 'role', 'study_group', 'photo')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        
        # Проверка email домена ДВФУ 
        if not attrs['email'].endswith('@dvfu.ru'):
            raise serializers.ValidationError({
                "email": "Используйте корпоративную почту ДВФУ (@dvfu.ru)"
            })
        
        # Проверки для студента
        if attrs['role'] == 'student' and not attrs.get('study_group'):
            raise serializers.ValidationError({
                "study_group": "Студент должен выбрать учебную группу"
            })
        
        # Проверки для не-студента
        if attrs['role'] != 'student' and attrs.get('study_group'):
            raise serializers.ValidationError({
                "study_group": "Только студенты могут выбирать учебную группу"
            })
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для отображения пользователя"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    study_group_name = serializers.CharField(source='study_group.name', read_only=True, allow_null=True)
    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'patronymic',
                  'full_name', 'role', 'role_display', 'photo', 'is_approved', 
                  'is_active', 'study_group', 'study_group_name', 'department', 
                  'department_name', 'date_joined')
        read_only_fields = ('id', 'date_joined', 'role_display', 
                           'study_group_name', 'department_name', 'full_name')


class StudyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = ('id', 'code', 'department')


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'name')