from rest_framework import serializers
from .models import Workload, WorkloadShare
from django.contrib.auth import get_user_model
from django.utils import timezone
import os
import logging
from datetime import timedelta,date
import json

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    """用户简单信息序列化器"""
    class Meta:
        model = User
        fields = ['id', 'username', 'role']

class WorkloadShareSerializer(serializers.ModelSerializer):
    """大创工作量参与人及占比"""
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    user_info = UserSimpleSerializer(source='user', read_only=True)

    class Meta:
        model = WorkloadShare
        fields = ['user', 'user_info', 'percentage']

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
    attachments_url = serializers.SerializerMethodField()
    original_filename = serializers.SerializerMethodField()
    # 新增字段：大创参与人及占比
    shares = WorkloadShareSerializer(many=True, required=False)

    class Meta:
        model = Workload
        fields = [
            'id', 'name', 'content', 'source', 'work_type',
            'start_date', 'end_date', 'intensity_type', 'intensity_value',
            'innovation_stage', 'assistant_salary_paid',
            'attachments', 'attachments_url', 'original_filename', 'submitter', 
            'mentor_reviewer', 'mentor_reviewer_id', 'mentor_comment', 'mentor_review_time',
            'teacher_reviewer', 'teacher_comment', 'teacher_review_time',
            'status', 'created_at', 'updated_at',
            'shares'
        ]
        read_only_fields = [
            'status', 'mentor_comment', 'teacher_comment',
            'mentor_review_time', 'teacher_review_time',
            'created_at', 'updated_at'
        ]

    def get_attachments_url(self, obj):
        """获取附件的URL"""
        if obj.attachments:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachments.url)
        return None

    def get_original_filename(self, obj):
        """获取原始文件名"""
        if obj.attachments:
            return os.path.basename(obj.attachments.name)
        return None

    def validate(self, data):
        """验证数据"""
        request = self.context.get('request')
        # 统一处理 shares（前端可能传字符串）
        raw_shares = self.initial_data.get('shares')
        if raw_shares and isinstance(raw_shares, str):
            try:
                shares_parsed = json.loads(raw_shares)
            except json.JSONDecodeError:
                raise serializers.ValidationError({"shares": "必须是合法的 JSON 数组"})

            # 再走嵌套 serializer 校验
            share_serializer = WorkloadShareSerializer(data=shares_parsed, many=True)
            share_serializer.is_valid(raise_exception=True)
            data['shares'] = share_serializer.validated_data

        if not request or not request.user:
            raise serializers.ValidationError("无法获取当前用户信息")

        # 如果是学生提交，必须指定导师
        if request.user.role == 'student' and not data.get('mentor_reviewer_id'):
            raise serializers.ValidationError("学生提交工作量时必须指定导师")

        # 验证文件大小
        attachments = data.get('attachments')
        if attachments:
            if attachments.size > 10 * 1024 * 1024:  # 10MB
                raise serializers.ValidationError({
                    "attachments": "文件大小不能超过10MB"
                })

        # 材料撰写必须在完成后1个月内申报
        source = data.get('source', getattr(self.instance, 'source', None))
        end_date = data.get('end_date', getattr(self.instance, 'end_date', None))
        if source == 'documentation' and end_date:
            today = date.today()
            if today - end_date > timedelta(days=30):
                raise serializers.ValidationError({
                    "end_date": "材料撰写类工作量必须在完成后1个月内申报"
                })

        # 大创必须填写阶段
        innovation_stage = data.get('innovation_stage') or getattr(self.instance, 'innovation_stage', None)
        if source == 'innovation' and not innovation_stage:
            raise serializers.ValidationError({
                "innovation_stage": "大创类工作量必须选择阶段（立项前/立项后）"
            })
        # 大创工作量：验证 shares
        if source == 'innovation':
            shares = data.get('shares')
            if not shares or len(shares) == 0:
                raise serializers.ValidationError({"shares": "大创类工作量必须指定参与人员及占比"})
            total = sum(s['percentage'] for s in shares)
            if abs(total - 100.0) > 1e-6:
                raise serializers.ValidationError({"shares": "大创类工作量占比总和必须为100"})
            submitter_id = request.user.id
            if submitter_id not in [s['user'].id if isinstance(s['user'], User) else s['user'] for s in shares]:
                raise serializers.ValidationError({"shares": "提交者必须包含在大创类工作量的占比中"})

        # 助教必须填写工资
        assistant_salary_paid = data.get('assistant_salary_paid') or getattr(self.instance, 'assistant_salary_paid',
                                                                                None)
        if source == 'assistant' and assistant_salary_paid is None:
            raise serializers.ValidationError({
                "assistant_salary_paid": "助教类工作量必须填写已发助教工资"
            })

        return data

    def create(self, validated_data):
        """创建工作量时设置提交者和审核者"""
        mentor_reviewer = validated_data.pop('mentor_reviewer_id', None)
        submitter = self.context['request'].user
        shares_data = validated_data.pop('shares', None)
        
        # 如果指定了ID但数据库中已存在相同ID的记录，则移除ID让数据库自动生成
        if 'id' in validated_data and Workload.objects.filter(id=validated_data['id']).exists():
            # 记录警告日志
            logger = logging.getLogger(__name__)
            logger.warning(f"尝试创建ID为 {validated_data['id']} 的工作量但已存在，将移除ID让数据库自动生成")
            
            # 删除已存在的ID，让数据库自动生成
            validated_data.pop('id', None)
        
        if mentor_reviewer:
            validated_data['mentor_reviewer'] = mentor_reviewer
        
        try:
            # 创建工作量记录
            instance = super().create({**validated_data, 'submitter': submitter})
            # 创建大创占比记录
            if shares_data:
                for s in shares_data:
                    WorkloadShare.objects.create(workload=instance, user=s['user'], percentage=s['percentage'])
            return instance
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"创建工作量时出错: {str(e)}")
            raise

    def update(self, instance, validated_data):
        shares_data = validated_data.pop('shares', None)
        """更新工作量时设置审核者"""
        if 'mentor_reviewer_id' in validated_data:
            mentor_reviewer = validated_data.pop('mentor_reviewer_id')
            validated_data['mentor_reviewer'] = mentor_reviewer

        # 如果更新了附件，删除旧文件
        if 'attachments' in validated_data and instance.attachments:
            try:
                old_file = instance.attachments.path
                if os.path.exists(old_file):
                    os.remove(old_file)
            except Exception as e:
                print(f"删除旧文件失败: {e}")

        # 更新工作量记录
        instance = super().update(instance, validated_data)

        # 如果有新附件，确保目录存在
        if instance.attachments:
            directory = os.path.dirname(instance.attachments.path)
            os.makedirs(directory, exist_ok=True)

        # 更新大创占比
        if shares_data is not None:
            # 先删除原来的
            instance.shares.all().delete()
            for s in shares_data:
                WorkloadShare.objects.create(workload=instance, user=s['user'], percentage=s['percentage'])

        return instance

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