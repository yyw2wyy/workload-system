from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.http import HttpResponse
from .models import Project, ProjectShare
from .serializers import ProjectSerializer, ProjectReviewSerializer
import logging
import traceback
import os
import django.db.utils
import re
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from datetime import datetime

# 获取logger
logger = logging.getLogger(__name__)


# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    """项目视图集"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取用户可以访问的项目列表"""
        user = self.request.user
        submitted = self.request.query_params.get('submitted', 'false').lower() == 'true'

        # 如果是获取已提交的项目列表，只返回自己提交的
        if submitted:
            return Project.objects.filter(submitter=user)

        # 否则根据角色返回可访问的项目
        if user.role == 'teacher':
            # 教师可以看到所有项目
            return Project.objects.all()
        else:
            # 其他人只能看到自己提交的项目
            return Project.objects.filter(submitter=user)
        return Project.objects.none()

    def create(self, request, *args, **kwargs):
        """申报项目"""
        try:
            # 记录请求信息
            logger.info(f"用户 {request.user.username} 正在申报项目")

            # 调用序列化器进行验证
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # 保存项目
            try:
                self.perform_create(serializer)
            except django.db.utils.IntegrityError as e:
                # 捕获主键冲突错误
                if "Duplicate entry" in str(e) and "PRIMARY" in str(e):
                    # 从错误消息中提取ID
                    match = re.search(r"Duplicate entry '(\d+)' for key", str(e))
                    if match:
                        conflict_id = match.group(1)
                        logger.warning(f"主键冲突: ID {conflict_id}，尝试使用不同的ID创建")

                        # 获取最大ID
                        max_id = Project.objects.all().order_by('-id').first()
                        new_id = (max_id.id + 1) if max_id else 1

                        # 尝试用新ID创建
                        serializer.save(id=new_id, submitter=request.user)
                else:
                    # 其他完整性错误，重新抛出
                    raise

            # 记录成功信息
            logger.info(f"项目申报成功: ID {serializer.instance.id}, 名称: {serializer.instance.name}")

            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except Exception as e:
            # 记录错误信息
            logger.error(f"项目申报失败: {str(e)}")
            logger.error(traceback.format_exc())

            # 返回友好的错误信息
            if hasattr(e, 'detail'):
                error_detail = str(e.detail)
            else:
                error_detail = str(e)

            return Response(
                {"detail": f"提交失败: {error_detail}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        """申报项目时设置提交者"""
        try:
            serializer.save(submitter=self.request.user)
        except Exception as e:
            logger.error(f"保持项目失败: {str(e)}")
            logger.error(traceback.format_exc())
            raise e

    def update(self, request, *args, **kwargs):
        """更新项目时进行权限和状态检查"""
        try:
            instance = self.get_object()
            user = self.request.user

            # 重新从数据库获取最新状态
            instance.refresh_from_db()

            # 检查项目当前状态
            if user.role != 'teacher':  # 只对非教师角色进行状态检查
                if instance.review_status not in ['pending', 'rejected']:
                    return Response(
                        {"detail": "只能修改未审核或审核未通过的项目"},
                        status=status.HTTP_403_FORBIDDEN
                    )

            # 调用父类的 update 方法
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            serializer.is_valid(raise_exception=True)

            # 如果是被驳回的项目，修改后重置状态为待审核
            if user.role != 'teacher' and instance.review_status == 'rejected':
                serializer.save(review_status='pending')
            else:
                serializer.save()

            return Response(serializer.data)

        except Exception as e:
            logger.error(f"更新项目失败: {str(e)}")
            logger.error(traceback.format_exc())

            if hasattr(e, 'detail'):
                error_detail = str(e.detail)
            else:
                error_detail = str(e)

            return Response(
                {"detail": f"更新失败: {error_detail}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_update(self, serializer):
        """更新项目的实际操作"""
        serializer.save()

    def perform_destroy(self, instance):
        """删除项目时进行权限检查"""
        if instance.review_status not in ['pending', 'rejected']:
            return Response(
                {"detail": "只能删除未审核或审核未通过的项目"},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()

    # 获取每个人自身申报的项目
    @action(detail=False, methods=['get'])
    def getDeclaredById(self, request):
        user = self.request.user

        queryset = Project.objects.filter(
            Q(submitter_id=user.id)  # 提交的待审核项目
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # @action(detail=False, methods=['get'])
    # def getRelatedById(self, request):
    #     def get_related_project_ids(user):
    #         print(user.id)
    #         queryset = ProjectShare.objects.filter(
    #             Q(user_id=user.id)  # 提交的待审核项目
    #         )
    #
    #         serializer = self.get_serializer(queryset, many=True)
    #
    #         return serializer.data
    #
    #     user = self.request.user
    #
    #     project_ids = get_related_project_ids(user)
    #
    #     print(project_ids)
    #
    #     queryset = Project.objects.filter(
    #         Q(id in project_ids)  # 提交的待审核项目
    #     )
    #
    #     serializer = self.get_serializer(queryset, many=True)
    #     return Response(serializer.data)

    # 只有老师能看到所有的项目，其他人只能看到和自己相关的
    # 获取每个人自身关联的项目
    @action(detail=False, methods=['get'])
    def getRelatedById(self, request):
        try:
            user = self.request.user

            project_ids = ProjectShare.objects.filter(
                user_id=user.id
            ).values_list('project_id', flat=True)
            projects = Project.objects.filter(id__in=project_ids)

            serializer = self.get_serializer(projects, many=True)
            return Response(serializer.data)

        except Exception as e:
            # 记录异常并返回错误响应
            print(f"Error in getRelatedById: {str(e)}")
            return Response(
                {"error": "服务器内部错误"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def pending_review(self, request):
        """获取待审核的项目列表"""

        queryset = Project.objects.filter(
            Q(review_status="pending")  # 提交的待审核项目
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def approved_review(self, request):
        user = self.request.user
        """获取审核成功的项目列表"""
        if user.role == 'teacher':
            # 教师可以看到所有项目
            queryset = Project.objects.filter(
                Q(review_status='approved')
            )
        else:
            # 其他人什么都看不到
            queryset = Project.objects.filter(
                Q(review_status='teacher_want_you_see')
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def reviewed(self, request):
        """获取已审核的项目列表"""
        # user = request.user
        # if user.role == 'teacher':
        #     # 教师获取已审核的
        #     queryset = Project.objects.filter(
        #         teacher_reviewer=user)
        # else:
        #     return Response(
        #         {"detail": "只有教师可以查看已审核项目列表"},
        #         status=status.HTTP_403_FORBIDDEN
        #     )

        queryset = Project.objects.filter(
            Q(review_status='approved') |
            Q(review_status='rejected')
        )


        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def all_projects(self, request):
        """教师获取所有项目列表"""
        user = request.user
        if user.role != 'teacher':
            return Response(
                {"detail": "只有教师可以查看所有项目"},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = Project.objects.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """审核项目"""
        instance = self.get_object()
        user = request.user

        # 检查审核权限
        if user.role != 'teacher':
            return Response(
                {"detail": "只有教师可以审核项目"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectReviewSerializer(
            instance,
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            # 返回更新后的完整项目信息
            return Response(
                self.get_serializer(instance).data
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

