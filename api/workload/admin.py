from django.contrib import admin
from .models import Workload

@admin.register(Workload)
class WorkloadAdmin(admin.ModelAdmin):
    list_display = ['name', 'submitter', 'mentor_reviewer', 'teacher_reviewer', 'source', 'work_type', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'source', 'work_type', 'intensity_type']
    search_fields = [
        'name', 'content', 
        'submitter__username', 
        'mentor_reviewer__username',
        'teacher_reviewer__username'
    ]
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'content', 'source', 'work_type', 'start_date', 'end_date')
        }),
        ('工作强度', {
            'fields': ('intensity_type', 'intensity_value')
        }),
        ('证明材料', {
            'fields': ('image_path', 'file_path')
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
    )
