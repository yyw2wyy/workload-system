from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Workload
from .serializers import WorkloadSerializer, WorkloadReviewSerializer

# Create your views here.

class WorkloadViewSet(viewsets.ModelViewSet):
    """工作量视图集"""
    serializer_class = WorkloadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取用户可以访问的工作量列表"""
        user = self.request.user
        submitted = self.request.query_params.get('submitted', 'false').lower() == 'true'

        # 如果是获取已提交的工作量列表，只返回自己提交的
        if submitted:
            return Workload.objects.filter(submitter=user)

        # 否则根据角色返回可访问的工作量
        if user.role == 'student':
            # 学生只能看到自己提交的工作量
            return Workload.objects.filter(submitter=user)
        elif user.role == 'mentor':
            # 导师可以看到：1.自己提交的工作量 2.自己需要审核的学生工作量
            return Workload.objects.filter(
                Q(submitter=user) |  # 自己提交的
                Q(mentor_reviewer=user, submitter__role='student')  # 需要审核的学生工作量
            )
        elif user.role == 'teacher':
            # 教师可以看到所有工作量
            return Workload.objects.all()
        return Workload.objects.none()

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
        
        # 如果是被驳回的工作量，修改后重置状态为待审核
        if instance.status in ['mentor_rejected', 'teacher_rejected']:
            serializer.save(status='pending')
        else:
            serializer.save()

    def perform_destroy(self, instance):
        """删除工作量时进行权限检查"""
        if instance.status not in ['pending', 'mentor_rejected', 'teacher_rejected']:
            return Response(
                {"detail": "只能删除未审核或审核未通过的工作量"},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()

    @action(detail=False, methods=['get'])
    def pending_review(self, request):
        """获取待审核的工作量列表"""
        user = request.user
        if user.role == 'mentor':
            # 导师获取自己需要审核的待审核工作量
            queryset = Workload.objects.filter(
                mentor_reviewer=user,
                submitter__role='student'
            ).filter(
                Q(status='pending') |  # 待审核的工作量
                Q(status='mentor_rejected')  # 被导师驳回的工作量
            )
        elif user.role == 'teacher':
            # 教师获取所有需要教师审核的工作量
            queryset = Workload.objects.filter(
                Q(status='mentor_approved') |  # 导师已审核通过的工作量
                Q(submitter__role='mentor', status='pending') |  # 导师提交的待审核工作量
                Q(status='teacher_rejected')  # 被教师驳回的工作量
            )
        else:
            return Response(
                {"detail": "只有导师和教师可以查看待审核工作量"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def reviewed(self, request):
        """获取已审核的工作量列表"""
        user = request.user
        if user.role == 'mentor':
            # 导师获取自己已审核的工作量
            queryset = Workload.objects.filter(
                mentor_reviewer=user,
                submitter__role='student'
            ).exclude(status='pending')
        elif user.role == 'teacher':
            # 教师获取所有已审核的工作量
            queryset = Workload.objects.filter(
                teacher_reviewer=user)
        else:
            return Response(
                {"detail": "只有导师和教师可以查看已审核工作量列表"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def all_workloads(self, request):
        """教师获取所有工作量列表"""
        user = request.user
        if user.role != 'teacher':
            return Response(
                {"detail": "只有教师可以查看所有工作量"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = Workload.objects.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """审核工作量"""
        instance = self.get_object()
        user = request.user

        # 检查审核权限
        if user.role == 'mentor':
            if instance.submitter.role != 'student' or instance.mentor_reviewer != user:
                return Response(
                    {"detail": "您不是该工作量的指定审核导师"},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user.role == 'teacher':
            if instance.submitter.role == 'student' and instance.status != 'mentor_approved':
                return Response(
                    {"detail": "学生提交的工作量需要导师审核通过后才能进行教师审核"},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {"detail": "只有导师和教师可以审核工作量"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = WorkloadReviewSerializer(
            instance,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            # 返回更新后的完整工作量信息
            return Response(
                self.get_serializer(instance).data
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
