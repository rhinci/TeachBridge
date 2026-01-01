from django.contrib import admin
from .models import Course, Module, Material

class MaterialInline(admin.TabularInline):
    model = Material
    extra = 1
    fields = ['title', 'material_type', 'order', 'file']
    ordering = ['order']

class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1
    fields = ['title', 'description', 'order']
    ordering = ['order']
    show_change_link = True

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'department', 'created_at']
    list_filter = ['department', 'created_at']
    search_fields = ['title', 'short_description', 'full_description']
    inlines = [ModuleInline]
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    search_fields = ['title', 'description']
    ordering = ['course', 'order']
    inlines = [MaterialInline]

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'material_type', 'order', 'created_at']
    list_filter = ['material_type', 'created_at']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at', 'file_size']