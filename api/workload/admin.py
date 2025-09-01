from django.contrib import admin
from django.utils.html import format_html
from .models import Workload

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
