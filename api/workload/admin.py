from django.contrib import admin
from .models import Workload

@admin.register(Workload)
class WorkloadAdmin(admin.ModelAdmin):
    list_display = ['name', 'submitter', 'reviewer', 'source', 'work_type', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'source', 'work_type', 'intensity_type']
    search_fields = ['name', 'content', 'submitter__username', 'reviewer__username']
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
            'fields': ('submitter', 'reviewer')
        }),
        ('审核信息', {
            'fields': ('status', 'mentor_comment', 'teacher_comment')
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
