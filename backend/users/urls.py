from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, StudyGroupViewSet, DepartmentViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'study-groups', StudyGroupViewSet, basename='studygroup')
router.register(r'departments', DepartmentViewSet, basename='department')

urlpatterns = [
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]