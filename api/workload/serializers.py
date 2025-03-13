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
        queryset=User.objects.filter(role='mentor'),
        write_only=True,
        required=False
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

    def validate(self, data):
        """验证数据"""
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("无法获取当前用户信息")

        # 如果是学生提交，必须指定导师
        if request.user.role == 'student' and not data.get('reviewer_id'):
            raise serializers.ValidationError("学生提交工作量时必须指定导师")

        return data

    def create(self, validated_data):
        """创建工作量时设置提交者和审核者"""
        reviewer = validated_data.pop('reviewer_id', None)
        validated_data['submitter'] = self.context['request'].user
        if reviewer:
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
            
        # 验证审核权限和状态
        if user.role == 'mentor':
            if instance.submitter.role != 'student' or instance.reviewer != user:
                raise serializers.ValidationError("您不是该工作量的指定审核导师")
            if data['status'] not in ['mentor_approved', 'mentor_rejected']:
                raise serializers.ValidationError("导师只能将状态设置为'导师已审核'或'导师已驳回'")
            if not data.get('mentor_comment'):
                raise serializers.ValidationError("请填写审核评论")
                
        elif user.role == 'teacher':
            if instance.submitter.role == 'student' and instance.status != 'mentor_approved':
                raise serializers.ValidationError("学生提交的工作量需要导师审核通过后才能进行教师审核")
            if data['status'] not in ['teacher_approved', 'teacher_rejected']:
                raise serializers.ValidationError("教师只能将状态设置为'教师已审核'或'教师已驳回'")
            if not data.get('teacher_comment'):
                raise serializers.ValidationError("请填写审核评论")
                
        return data 