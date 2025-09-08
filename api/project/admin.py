from django.contrib import admin
from django.utils.html import format_html
from .models import Project

@admin.register(Project)
class WorkloadAdmin(admin.ModelAdmin):
    list_display = ['name', 'submitter', 'teacher_reviewer', 'project_status', 'review_status', 'start_date']
    list_filter = ['project_status', 'review_status']
    search_fields = [
        'name',
        'submitter__username',
        'teacher_reviewer__username'
    ]
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']