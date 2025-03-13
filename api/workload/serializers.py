from rest_framework import serializers
from .models import Workload
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    """用户简单信息序列化器"""
    class Meta:
        model = User
        fields = ['id', 'username', 'role']

class WorkloadSerializer(serializers.ModelSerializer):
    """工作量序列化器"""
    submitter = UserSimpleSerializer(read_only=True)
    reviewer = UserSimpleSerializer(read_only=True)
    reviewer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=['mentor', 'teacher']),
        write_only=True,
        required=True
    )

    class Meta:
        model = Workload
        fields = [
            'id', 'name', 'content', 'source', 'work_type',
            'start_date', 'end_date', 'intensity_type', 'intensity_value',
            'image_path', 'file_path', 'submitter', 'reviewer', 'reviewer_id',
            'status', 'mentor_comment', 'teacher_comment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'mentor_comment', 'teacher_comment', 'created_at', 'updated_at']

    def validate_reviewer_id(self, value):
        """验证审核者身份"""
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("无法获取当前用户信息")

        # 获取当前用户和目标审核者
        current_user = request.user
        reviewer = value

        # 验证审核者角色
        if current_user.role == 'student' and reviewer.role != 'mentor':
            raise serializers.ValidationError("学生提交的工作量必须由导师审核")
        elif current_user.role == 'mentor' and reviewer.role != 'teacher':
            raise serializers.ValidationError("导师提交的工作量必须由教师审核")

        return value

    def create(self, validated_data):
        """创建工作量时设置提交者和审核者"""
        reviewer = validated_data.pop('reviewer_id')
        validated_data['submitter'] = self.context['request'].user
        validated_data['reviewer'] = reviewer
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """更新工作量时设置审核者"""
        if 'reviewer_id' in validated_data:
            reviewer = validated_data.pop('reviewer_id')
            validated_data['reviewer'] = reviewer
        return super().update(instance, validated_data) 