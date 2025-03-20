# 系统公告 API 文档

## 基本信息

- 基础URL: `/api/announcement/`
- 响应格式: JSON
- 认证方式: Session认证
- 权限要求: 需要登录认证

## 数据模型

### 公告类型

- `notice`: 通知
- `announcement`: 公告
- `warning`: 警告

## API接口

### 1. 获取公告列表

- **接口URL**: `/api/announcement/`
- **请求方法**: GET
- **权限要求**: 已登录用户

#### 响应说明

返回系统中的所有公告列表，按创建时间倒序排序。

#### 响应示例

```json
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "title": "系统维护通知",
            "content": "系统将于今晚进行维护...",
            "type": "notice",
            "created_at": "2024-03-19T10:00:00Z",
            "updated_at": "2024-03-19T10:00:00Z"
        },
        {
            "id": 2,
            "title": "重要公告",
            "content": "请各位同学注意...",
            "type": "announcement",
            "created_at": "2024-03-19T09:00:00Z",
            "updated_at": "2024-03-19T09:00:00Z"
        }
    ]
}
```

### 2. 获取单个公告详情

- **接口URL**: `/api/announcement/{id}/`
- **请求方法**: GET
- **权限要求**: 已登录用户

#### 参数说明

| 参数名 | 类型   | 必填 | 说明     |
|--------|--------|------|----------|
| id     | integer| 是   | 公告ID   |

#### 响应示例

```json
{
    "id": 1,
    "title": "系统维护通知",
    "content": "系统将于今晚进行维护...",
    "type": "notice",
    "created_at": "2024-03-19T10:00:00Z",
    "updated_at": "2024-03-19T10:00:00Z"
}
```

## 错误响应

### 未登录错误

```json
{
    "detail": "认证凭据未提供。"
}
```

### 其他错误

```json
{
    "detail": "错误信息"
}
```

## 字段说明

### 公告字段

| 字段名      | 类型      | 说明                    |
|------------|-----------|------------------------|
| id         | integer   | 公告ID                  |
| title      | string    | 公告标题                |
| content    | string    | 公告内容                |
| type       | string    | 公告类型                |
| created_at | datetime  | 创建时间                |
| updated_at | datetime  | 更新时间                |

### 公告类型说明

| 类型值       | 说明 |
|-------------|------|
| notice      | 通知 |
| announcement| 公告 |
| warning     | 警告 |

## 注意事项

1. 所有接口都需要用户登录才能访问
2. 公告列表按创建时间倒序排序
3. 时间字段使用 ISO 8601 格式
4. 接口支持分页，默认每页 10 条记录 