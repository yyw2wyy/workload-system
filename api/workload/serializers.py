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

class WorkloadReviewSerializer(serializers.ModelSerializer):
    """工作量审核序列化器"""
    class Meta:
        model = Workload
        fields = ['status', 'mentor_comment', 'teacher_comment']
        
    def validate(self, data):
        """验证审核状态和评论"""
        user = self.context['request'].user
        instance = self.instance
        
        if not instance:
            raise serializers.ValidationError("无法获取工作量信息")
            
        # 验证审核权限
        if user.role == 'mentor' and instance.reviewer != user:
            raise serializers.ValidationError("您不是该工作量的指定审核导师")
        elif user.role == 'teacher' and instance.reviewer != user:
            raise serializers.ValidationError("您不是该工作量的指定审核教师")
            
        # 验证审核流程
        if user.role == 'mentor':
            if instance.submitter.role != 'student':
                raise serializers.ValidationError("导师只能审核学生提交的工作量")
            if data['status'] not in ['mentor_approved', 'mentor_rejected']:
                raise serializers.ValidationError("导师只能将状态设置为'导师已审核'或'导师已驳回'")
            if not data.get('mentor_comment'):
                raise serializers.ValidationError("请填写审核评论")
                
        elif user.role == 'teacher':
            if instance.status not in ['pending', 'mentor_approved'] and instance.submitter.role == 'student':
                raise serializers.ValidationError("教师只能审核待审核或导师已审核的工作量")
            if data['status'] not in ['teacher_approved', 'teacher_rejected']:
                raise serializers.ValidationError("教师只能将状态设置为'教师已审核'或'教师已驳回'")
            if not data.get('teacher_comment'):
                raise serializers.ValidationError("请填写审核评论")
                
        return data 