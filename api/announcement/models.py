from django.db import models

class Announcement(models.Model):
    """系统公告模型"""
    
    # 公告类型选项
    TYPE_CHOICES = (
        ('notice', '通知'),
        ('announcement', '公告'),
        ('warning', '警告'),
    )
    
    title = models.CharField('标题', max_length=200)
    content = models.TextField('内容')
    type = models.CharField(
        '公告类型',
        max_length=20,
        choices=TYPE_CHOICES,
        default='notice'
    )
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        verbose_name = '系统公告'
        verbose_name_plural = '系统公告'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
