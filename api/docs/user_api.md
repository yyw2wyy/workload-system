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

| 参数名   | 类型   | 必填 | 说明                                      |
|----------|--------|------|-------------------------------------------|
| username | string | 是   | 用户名                                    |
| password | string | 是   | 密码                                      |
| role     | string | 是   | 用户角色（student/mentor/teacher）        |

#### 响应示例

成功响应：
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

错误响应：
```json
{
    "message": "用户名或密码错误"
}
```

```json
{
    "role": [
        "所选角色与用户角色不匹配"
    ]
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

### 4. 更新用户信息

- **接口URL**: `/api/user/update/`
- **请求方法**: PUT
- **权限要求**: 需要登录认证

#### 请求参数

| 参数名   | 类型   | 必填 | 说明   |
|----------|--------|------|--------|
| username | string | 否   | 用户名 |
| email    | string | 否   | 邮箱   |

#### 响应示例

```json
{
    "message": "个人信息更新成功",
    "user": {
        "id": 1,
        "username": "new_username",
        "email": "new_email@example.com",
        "role": "student"
    }
}
```

#### 错误响应

```json
{
    "username": [
        "该用户名已被使用"
    ],
    "email": [
        "该邮箱已被使用"
    ]
}
```

### 5. 修改密码

- **接口URL**: `/api/user/change-password/`
- **请求方法**: POST
- **权限要求**: 需要登录认证

#### 请求参数

| 参数名           | 类型   | 必填 | 说明                           |
|------------------|--------|------|--------------------------------|
| current_password | string | 是   | 当前密码                       |
| new_password     | string | 是   | 新密码（至少8个字符）         |
| confirm_password | string | 是   | 确认新密码（必须与新密码一致）|

#### 响应示例

```json
{
    "message": "密码修改成功"
}
```

#### 错误响应

```json
{
    "current_password": [
        "当前密码不正确"
    ],
    "new_password": [
        "密码太短。密码长度必须至少为8个字符。",
        "密码太常见。",
        "密码不能全为数字。"
    ],
    "confirm_password": [
        "两次输入的新密码不一致"
    ]
}
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