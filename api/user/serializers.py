from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """用户序列化器"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['id']

class UserRegisterSerializer(serializers.ModelSerializer):
    """用户注册序列化器"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email']

    def validate(self, attrs):
        # 验证两次密码是否一致
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "两次密码不一致"})
        return attrs

    def create(self, validated_data):
        # 移除password2字段
        validated_data.pop('password2')
        # 创建用户
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    """用户登录序列化器"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True) 