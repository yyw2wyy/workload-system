from rest_framework import serializers
from .models import Announcement

class AnnouncementSerializer(serializers.ModelSerializer):
    """公告序列化器"""
    
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'type', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at'] 