from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Workload
from .serializers import WorkloadSerializer

# Create your views here.

class WorkloadViewSet(viewsets.ModelViewSet):
    """工作量视图集"""
    serializer_class = WorkloadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取当前用户提交的工作量列表"""
        return Workload.objects.filter(submitter=self.request.user)

    def perform_create(self, serializer):
        """创建工作量时设置提交者"""
        serializer.save()

    def perform_update(self, serializer):
        """更新工作量时进行权限检查"""
        instance = self.get_object()
        if instance.status not in ['pending', 'mentor_rejected', 'teacher_rejected']:
            return Response(
                {"detail": "只能修改未审核或审核未通过的工作量"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()

    def perform_destroy(self, instance):
        """删除工作量时进行权限检查"""
        if instance.status not in ['pending', 'mentor_rejected', 'teacher_rejected']:
            return Response(
                {"detail": "只能删除未审核或审核未通过的工作量"},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()
