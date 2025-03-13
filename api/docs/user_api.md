# 用户管理API文档

## 基本信息

- 基础URL: `/api/user`
- 响应格式: JSON
- 认证方式: Session认证

## 用户角色

系统中的用户分为三种角色：

- 学生（student）：默认角色
- 导师（mentor）
- 老师（teacher）

## API接口

### 1. 用户注册

- **接口URL**: `/api/user/register/`
- **请求方法**: POST
- **权限要求**: 无需认证

#### 请求参数

| 参数名    | 类型   | 必填 | 说明     |
|-----------|--------|------|----------|
| username  | string | 是   | 用户名   |
| password  | string | 是   | 密码     |
| password2 | string | 是   | 确认密码 |
| email     | string | 是   | 邮箱     |

#### 响应示例

```json
{
    "message": "用户注册成功",
    "user": {
        "id": 1,
        "username": "example",
        "email": "example@example.com",
        "role": "student"
    }
}
```

### 2. 用户登录

- **接口URL**: `/api/user/login/`
- **请求方法**: POST
- **权限要求**: 无需认证

#### 请求参数

| 参数名   | 类型   | 必填 | 说明   |
|----------|--------|------|--------|
| username | string | 是   | 用户名 |
| password | string | 是   | 密码   |

#### 响应示例

```json
{
    "message": "登录成功",
    "user": {
        "id": 1,
        "username": "example",
        "email": "example@example.com",
        "role": "student"
    }
}
```

### 3. 获取用户列表

- **接口URL**: `/api/user/list/`
- **请求方法**: GET
- **权限要求**: 需要登录认证

#### 响应示例

```json
[
    {
        "id": 1,
        "username": "user1",
        "email": "user1@example.com",
        "role": "student"
    },
    {
        "id": 2,
        "username": "user2",
        "email": "user2@example.com",
        "role": "teacher"
    }
]
```

## 错误响应

### 通用错误响应格式

```json
{
    "message": "错误信息",
    "errors": {
        "字段名": [
            "具体错误描述"
        ]
    }
}
```

### 常见错误码

- 400 Bad Request: 请求参数错误
- 401 Unauthorized: 未登录或认证失败
- 403 Forbidden: 权限不足
- 404 Not Found: 资源不存在
- 500 Internal Server Error: 服务器内部错误 