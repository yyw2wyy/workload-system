from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms.models import BaseInlineFormSet
from .models import Project, ProjectShare

class ProjectShareInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()
        # 过滤掉被删除的表单
        active_forms = [form for form in self.forms if not form.cleaned_data.get('DELETE', False)]
        if len(active_forms) < 1:
            raise ValidationError("项目至少需要保留一位参与人。")


class ProjectShareInline(admin.TabularInline):
    model = ProjectShare
    extra = 1  # 默认额外空行数
    formset = ProjectShareInlineFormSet


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

    inlines = [ProjectShareInline]