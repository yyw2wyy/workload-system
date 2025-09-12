from django.db import models, transaction
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import os

User = get_user_model()

class Project(models.Model):
    """项目模型"""

    # 项目状态选项
    PROJECT_STATUS_CHOICES = (
        ('pre_research', '预研'),
        ('in_research', '在研'),
    )

    # 审核状态选项
    REVIEW_STATUS_CHOICES = (
        ('pending', '待审核'),
        ('approved', '教师已审核'),
        ('rejected', '教师已驳回'),
    )

    # 基本信息
    name = models.CharField('项目名称', max_length=200)
    project_status = models.CharField('项目状态', max_length=20, choices=PROJECT_STATUS_CHOICES)
    start_date = models.DateField('开始日期')

    # 关联用户
    submitter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='submitted_projects',
        verbose_name='提交者'
    )

    teacher_reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='teacher_reviewing_projects',
        verbose_name='教师审核人',
        null=True,
        blank=True
    )

    # 审核信息
    review_status = models.CharField(
        '审核状态',
        max_length=20,
        choices=REVIEW_STATUS_CHOICES,
        default='pending'
    )
    teacher_comment = models.TextField('教师评论', blank=True, null=True)
    teacher_review_time = models.DateTimeField('教师审核时间', null=True, blank=True)

    # 时间戳
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '项目'
        verbose_name_plural = '项目'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name}"

    @transaction.atomic
    def save(self, *args, **kwargs):
        # 如果是新创建的记录，确保ID不使用固定值，而是自动生成
        if self.pk and not Project.objects.filter(pk=self.pk).exists():
            # 如果指定了ID但不存在，清除ID让数据库自动生成
            self.pk = None

        # 如果是新创建的记录
        if not self.pk:
            # 先保存以获取ID
            super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)

class ProjectShare(models.Model):
    """项目共同参与者"""
    project = models.ForeignKey(
        'Project',
        on_delete=models.CASCADE,
        related_name='shares',
        verbose_name='项目参与者'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='project_shares',
        verbose_name='参与用户'
    )

    class Meta:
        verbose_name = '项目参与情况'
        verbose_name_plural = '项目参与情况'
        unique_together = ('project', 'user')  # 同一个项目中不能重复添加同一个用户

    def __str__(self):
        return f"{self.user.username} - ({self.project.name})"