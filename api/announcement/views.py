from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Announcement
from .serializers import AnnouncementSerializer

# Create your views here.

class AnnouncementViewSet(viewsets.ReadOnlyModelViewSet):
    """公告视图集"""
    
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]  # 需要登录才能访问
    
    def get_queryset(self):
        """获取公告列表"""
        queryset = super().get_queryset()
        # 支持通过 ?source=horizontal 过滤
        source = self.request.query_params.get('source')
        if source:
            queryset = queryset.filter(source=source)
        # 按创建时间倒序排序
        return queryset.order_by('-created_at')
