from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()

class Workload(models.Model):
    """工作量模型"""
    
    # 工作来源选项
    SOURCE_CHOICES = (
        ('horizontal', '横向'),
        ('innovation', '大创'),
        ('hardware', '硬件小组'),
        ('assessment', '考核小组'),
    )
    
    # 工作类型选项
    TYPE_CHOICES = (
        ('remote', '远程'),
        ('onsite', '实地'),
    )
    
    # 工作强度类型选项
    INTENSITY_TYPE_CHOICES = (
        ('total', '总计'),
        ('daily', '每天'),
        ('weekly', '每周'),
    )
    
    # 审核状态选项
    STATUS_CHOICES = (
        ('pending', '待审核'),
        ('mentor_approved', '导师已审核'),
        ('mentor_rejected', '导师已驳回'),
        ('teacher_approved', '教师已审核'),
        ('teacher_rejected', '教师已驳回'),
    )
    
    # 基本信息
    name = models.CharField('工作量名称', max_length=200)
    content = models.TextField('工作内容')
    source = models.CharField('工作来源', max_length=20, choices=SOURCE_CHOICES)
    work_type = models.CharField('工作类型', max_length=20, choices=TYPE_CHOICES)
    start_date = models.DateField('开始日期')
    end_date = models.DateField('结束日期')
    
    # 工作强度
    intensity_type = models.CharField('工作强度类型', max_length=20, choices=INTENSITY_TYPE_CHOICES)
    intensity_value = models.FloatField('工作强度值', validators=[MinValueValidator(0.0)])
    
    # 证明材料
    image_path = models.CharField('图片路径', max_length=500, blank=True, null=True)
    file_path = models.CharField('文件路径', max_length=500, blank=True, null=True)
    
    # 关联用户
    submitter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='submitted_workloads',
        verbose_name='提交者'
    )
    mentor_reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='mentor_reviewing_workloads',
        verbose_name='导师审核人',
        null=True,
        blank=True
    )
    teacher_reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='teacher_reviewing_workloads',
        verbose_name='教师审核人',
        null=True,
        blank=True
    )
    
    # 审核信息
    status = models.CharField(
        '审核状态',
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    mentor_comment = models.TextField('导师评论', blank=True, null=True)
    teacher_comment = models.TextField('教师评论', blank=True, null=True)
    mentor_review_time = models.DateTimeField('导师审核时间', null=True, blank=True)
    teacher_review_time = models.DateTimeField('教师审核时间', null=True, blank=True)
    
    # 时间戳
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        verbose_name = '工作量'
        verbose_name_plural = '工作量'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.submitter.username}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # 验证结束日期不早于开始日期
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError('结束日期不能早于开始日期')
        
        # 验证审核者角色
        if self.submitter.role == 'student':
            if not self.mentor_reviewer:
                raise ValidationError('学生提交的工作量必须指定导师审核人')
            if self.mentor_reviewer and self.mentor_reviewer.role != 'mentor':
                raise ValidationError('导师审核人必须是导师角色')
        
        if self.teacher_reviewer and self.teacher_reviewer.role != 'teacher':
            raise ValidationError('教师审核人必须是教师角色')
