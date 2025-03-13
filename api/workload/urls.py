from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkloadViewSet

router = DefaultRouter()
router.register('', WorkloadViewSet, basename='workload')

urlpatterns = [
    path('', include(router.urls)),
] 