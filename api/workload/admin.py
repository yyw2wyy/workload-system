from django.contrib import admin
from django.utils.html import format_html
from .models import Workload,WorkloadShare
from django.forms.models import BaseInlineFormSet
from django.core.exceptions import ValidationError
from django import forms
from project.models import Project

class WorkloadShareFormSet(BaseInlineFormSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 排序获取第一个参与者
        if self.instance.pk:  # 只有存在父对象时
            shares = list(self.instance.shares.order_by('id'))
            if shares:
                first_share_id = shares[0].id
                for form in self.forms:
                    if form.instance.pk == first_share_id:
                        # 第一个参与者 user 字段只读
                        form.fields['user'].disabled = True
                        # 第一个参与者不可删除
                        form.can_delete = False

    def clean(self):
        """校验占比总和必须为100"""
        super().clean()
        total_percentage = 0
        for form in self.forms:
            if form.cleaned_data.get('DELETE'):
                continue
            percentage = form.cleaned_data.get('percentage')
            if percentage is not None:
                total_percentage += percentage

        # 如果大创存在参与者，检查总和
        if self.instance.source == 'innovation' and total_percentage != 100:
            raise ValidationError('所有参与者的占比总和必须为100%')

# 自定义表单，限制 project 选择范围
class WorkloadForm(forms.ModelForm):
    class Meta:
        model = Workload
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 只显示教师已审核的项目
        self.fields['project'].queryset = Project.objects.filter(review_status='approved')


class WorkloadShareInline(admin.TabularInline):
    """大创参与者占比管理"""
    model = WorkloadShare
    extra = 0  # 默认不增加额外空行
    fields = ('user', 'percentage')
    formset = WorkloadShareFormSet

    # 删除权限通过 formset 控制
    def has_delete_permission(self, request, obj=None):
        return True  # 表单内会控制第一个参与者不可删除


@admin.register(Workload)
class WorkloadAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'submitter', 'mentor_reviewer', 'teacher_reviewer',
        'source', 'work_type', 'start_date', 'end_date', 'status'
    ]
    list_filter = ['status', 'source', 'work_type', 'intensity_type']
    search_fields = [
        'name', 'content',
        'submitter__username',
        'mentor_reviewer__username',
        'teacher_reviewer__username'
    ]
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at', 'preview_attachments']
    inlines = []

    def get_fieldsets(self, request, obj=None):
        """根据 source 动态调整显示字段"""
        fieldsets = [
            ('基本信息', {
                'fields': ('name', 'content', 'source', 'work_type', 'start_date', 'end_date')
            }),
            ('工作强度', {
                'fields': ('intensity_type', 'intensity_value')
            }),
            ('证明材料', {
                'fields': ('attachments', 'preview_attachments')
            }),
            ('关联用户', {
                'fields': ('submitter', 'mentor_reviewer', 'teacher_reviewer')
            }),
            ('审核信息', {
                'fields': (
                    'status',
                    'mentor_comment', 'mentor_review_time',
                    'teacher_comment', 'teacher_review_time'
                )
            }),
            ('时间信息', {
                'fields': ('created_at', 'updated_at'),
                'classes': ('collapse',)
            }),
    ]

        # 动态插入大创阶段字段
        if obj and obj.source == 'innovation':
            fieldsets[0][1]['fields'] = (
                'name', 'content', 'source', 'innovation_stage',
                'work_type', 'start_date', 'end_date'
            )

        if obj and obj.source == 'innovation':
            fieldsets[0][1]['fields'] = (
                'name', 'content', 'source', 'innovation_stage',
                'work_type', 'start_date', 'end_date'
            )
            # 动态添加inline管理大创参与者
            self.inlines = [WorkloadShareInline]
        else:
            self.inlines = []

        # 如果来源是大创/横向/材料撰写，插入 project 字段
        if obj and obj.source in ['horizontal']:
            base_fields = list(fieldsets[0][1]['fields'])
            if 'project' not in base_fields:
                base_fields.insert(3, 'project')  # 放在 source 后面
            fieldsets[0][1]['fields'] = tuple(base_fields)

        # 动态插入助教工资字段
        if obj and obj.source == 'assistant':
            fieldsets[0][1]['fields'] = (
                'name', 'content', 'source', 'assistant_salary_paid',
                'work_type', 'start_date', 'end_date'
            )

        return fieldsets

    def preview_attachments(self, obj):
        """预览附件"""
        if not obj.attachments:
            return '无附件'

        file_url = obj.attachments.url
        file_name = obj.attachments.name.split('/')[-1]

        # 判断文件类型
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            # 图片预览
            return format_html(
                '<div style="margin: 10px 0;">'
                '<img src="{}" style="max-width: 300px; max-height: 150px; border-radius: 5px; margin-bottom: 10px;"><br>'
                '<a href="{}" class="button" target="_blank" '
                'style="padding: 5px 10px; background: #f8f9fa; border: 1px solid #ddd; '
                'border-radius: 3px; color: #666; text-decoration: none;">'
                '下载原图</a>'
                '</div>',
                file_url, file_url
            )
        else:
            # 其他文件类型显示下载链接
            return format_html(
                '<div style="margin: 10px 0;">'
                '<a href="{}" class="button" target="_blank" '
                'style="padding: 5px 10px; background: #f8f9fa; border: 1px solid #ddd; '
                'border-radius: 3px; color: #666; text-decoration: none;">'
                '下载文件: {}</a>'
                '</div>',
                file_url, file_name
            )

    preview_attachments.short_description = '附件预览'
