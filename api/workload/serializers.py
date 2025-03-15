from rest_framework import serializers
from .models import Workload
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    """用户简单信息序列化器"""
    class Meta:
        model = User
        fields = ['id', 'username', 'role']

class WorkloadSerializer(serializers.ModelSerializer):
    """工作量序列化器"""
    submitter = UserSimpleSerializer(read_only=True)
    mentor_reviewer = UserSimpleSerializer(read_only=True)
    teacher_reviewer = UserSimpleSerializer(read_only=True)
    mentor_reviewer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='mentor'),
        write_only=True,
        required=False
    )

    class Meta:
        model = Workload
        fields = [
            'id', 'name', 'content', 'source', 'work_type',
            'start_date', 'end_date', 'intensity_type', 'intensity_value',
            'image_path', 'file_path', 'submitter', 
            'mentor_reviewer', 'mentor_reviewer_id', 'mentor_comment', 'mentor_review_time',
            'teacher_reviewer', 'teacher_comment', 'teacher_review_time',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'status', 'mentor_comment', 'teacher_comment',
            'mentor_review_time', 'teacher_review_time',
            'created_at', 'updated_at'
        ]

    def validate(self, data):
        """验证数据"""
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("无法获取当前用户信息")

        # 如果是学生提交，必须指定导师
        if request.user.role == 'student' and not data.get('mentor_reviewer_id'):
            raise serializers.ValidationError("学生提交工作量时必须指定导师")

        return data

    def create(self, validated_data):
        """创建工作量时设置提交者和审核者"""
        mentor_reviewer = validated_data.pop('mentor_reviewer_id', None)
        validated_data['submitter'] = self.context['request'].user
        if mentor_reviewer:
            validated_data['mentor_reviewer'] = mentor_reviewer
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """更新工作量时设置审核者"""
        if 'mentor_reviewer_id' in validated_data:
            mentor_reviewer = validated_data.pop('mentor_reviewer_id')
            validated_data['mentor_reviewer'] = mentor_reviewer
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
            if instance.submitter.role != 'student' or instance.mentor_reviewer != user:
                raise serializers.ValidationError("您不是该工作量的指定审核导师")
            if data['status'] not in ['mentor_approved', 'mentor_rejected']:
                raise serializers.ValidationError("导师只能将状态设置为'导师已审核'或'导师已驳回'")
            if not data.get('mentor_comment'):
                raise serializers.ValidationError("请填写审核评论")
            # 设置导师审核时间
            instance.mentor_review_time = timezone.now()
                
        elif user.role == 'teacher':
            if instance.submitter.role == 'student' and instance.status != 'mentor_approved':
                raise serializers.ValidationError("学生提交的工作量需要导师审核通过后才能进行教师审核")
            if data['status'] not in ['teacher_approved', 'teacher_rejected']:
                raise serializers.ValidationError("教师只能将状态设置为'教师已审核'或'教师已驳回'")
            if not data.get('teacher_comment'):
                raise serializers.ValidationError("请填写审核评论")
            # 设置教师审核时间和审核人
            instance.teacher_reviewer = user
            instance.teacher_review_time = timezone.now()
                
        return data 