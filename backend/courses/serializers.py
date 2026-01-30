from rest_framework import serializers
from .models import Course, Module, Material
from users.serializers import UserSerializer

class MaterialSerializer(serializers.ModelSerializer):
    """Сериализатор для материала (только название + файл)"""
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = Material
        fields = ['id', 'title', 'material_type', 'file', 'file_url', 'file_size', 'order', 'created_at']
        read_only_fields = ['id', 'material_type', 'file_url', 'file_size', 'order', 'created_at']
    
    def get_file_url(self, obj):
        """URL для скачивания файла"""
        if obj.file:
            return obj.file.url
        return None
    
    def get_file_size(self, obj):
        """Размер файла в МБ"""
        if obj.file and obj.file.size:
            return round(obj.file.size / (1024 * 1024), 2)
        return 0


class ModuleSerializer(serializers.ModelSerializer):
    """Сериализатор для модуля (только название + материалы)"""
    materials = MaterialSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'materials']
        read_only_fields = ['id', 'order']


class CourseSerializer(serializers.ModelSerializer):
    """Сериализатор для курса"""
    author_info = UserSerializer(source='author', read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'short_description', 'full_description',
            'author', 'author_info', 'department', 'created_at', 'updated_at',
            'modules'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'short_description', 'full_description']
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['author'] = request.user
        validated_data['department'] = request.user.department
        return super().create(validated_data)


class ModuleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['title']
    
    def create(self, validated_data):
        course_id = self.context.get('course_id')
        validated_data['course_id'] = course_id
        
        # Автоматически ставим последним по порядку
        last_module = Module.objects.filter(course_id=course_id).order_by('-order').first()
        validated_data['order'] = last_module.order + 1 if last_module else 1
        
        return super().create(validated_data)


class MaterialCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['title', 'material_type', 'file']
    
    def create(self, validated_data):
        #Автоматически определяем тип файла по расширению
        module_id = self.context.get('module_id')
        validated_data['module_id'] = module_id
        
        # Автоматически ставим порядок
        last_material = Material.objects.filter(module_id=module_id).order_by('-order').first()
        validated_data['order'] = last_material.order + 1 if last_material else 1
        
        # Автоматически определяем тип материала по расширению файла
        if not validated_data.get('material_type') and validated_data.get('file'):
            file_name = validated_data['file'].name.lower()
            if any(ext in file_name for ext in ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt']):
                validated_data['material_type'] = 'article'
            elif any(ext in file_name for ext in ['.ppt', '.pptx', '.odp', '.key']):
                validated_data['material_type'] = 'presentation'
            elif any(ext in file_name for ext in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm']):
                validated_data['material_type'] = 'video'
            else:
                validated_data['material_type'] = 'other'
        
        return super().create(validated_data)