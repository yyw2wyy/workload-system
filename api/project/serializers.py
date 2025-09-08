from rest_framework import serializers
from .models import Project
from django.contrib.auth import get_user_model
from django.utils import timezone
import os
import logging

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """用户简单信息序列化器"""

    class Meta:
        model = User
        fields = ['id', 'username', 'role']


class ProjectSerializer(serializers.ModelSerializer):
    """项目序列化器"""
    submitter = UserSimpleSerializer(read_only=True)
    teacher_reviewer = UserSimpleSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'start_date', 'project_status',
            'submitter',
            'teacher_reviewer', 'teacher_comment', 'teacher_review_time',
            'review_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at'
        ]

    def validate(self, data):
        """验证数据"""
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("无法获取当前用户信息")

        return data

    def create(self, validated_data):
        """申报项目时设置提交者"""
        submitter = self.context['request'].user

        # 如果指定了ID但数据库中已存在相同ID的记录，则移除ID让数据库自动生成
        if 'id' in validated_data and Project.objects.filter(id=validated_data['id']).exists():
            # 记录警告日志
            logger = logging.getLogger(__name__)
            logger.warning(f"尝试创建ID为 {validated_data['id']} 的工作量但已存在，将移除ID让数据库自动生成")

            # 删除已存在的ID，让数据库自动生成
            validated_data.pop('id', None)

        try:
            # 创建项目记录
            instance = super().create({**validated_data, 'submitter': submitter})
            return instance
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"申报项目时出错: {str(e)}")
            raise

    def update(self, instance, validated_data):
        # 更新工作量记录
        instance = super().update(instance, validated_data)

        return instance


class ProjectReviewSerializer(serializers.ModelSerializer):
    """项目审核序列化器"""

    class Meta:
        model = Project
        fields = ['review_status', 'teacher_comment']

    def validate(self, data):
        """验证审核状态和评论"""
        user = self.context['request'].user
        instance = self.instance

        if not instance:
            raise serializers.ValidationError("无法获取项目信息")

        if user.role == 'teacher':
            if data['review_status'] not in ['approved', 'rejected']:
                raise serializers.ValidationError("教师只能将状态设置为'教师已审核'或'教师已驳回'")
            if not data.get('teacher_comment'):
                raise serializers.ValidationError("请填写审核评论")
            # 设置教师审核时间和审核人
            instance.teacher_reviewer = user
            instance.teacher_review_time = timezone.now()

        return data