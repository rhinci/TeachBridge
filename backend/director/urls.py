from django.urls import path
from . import views

app_name = 'director'

urlpatterns = [
    path('department-info/', views.department_info, name='department-info'),
    path('pending-registrations/', views.pending_registrations, name='pending-registrations'),
    path('users/<int:user_id>/approve/', views.approve_student, name='approve-student'),
    path('users/<int:user_id>/reject/', views.reject_student, name='reject-student'),
    path('group-chats/create/', views.create_group_chat, name='create-group-chat'),
    path('department-chats/', views.department_chats, name='department-chats'),
    path('department-users/', views.department_users, name='department-users'),
    path('department-courses/', views.department_courses, name='department-courses'),
]