# 工作量管理API文档

## 基本信息

- 基础URL: `/api/workload`
- 响应格式: JSON
- 认证方式: Session认证
- 权限要求: 需要登录认证

## 数据模型

### 工作量状态

- `pending`: 待审核
- `mentor_approved`: 导师已审核
- `teacher_approved`: 教师已审核
- `mentor_rejected`: 导师已驳回
- `teacher_rejected`: 教师已驳回

### 工作来源

- `horizontal`: 横向
- `innovation`: 大创
- `hardware`: 硬件小组
- `assessment`: 考核小组

### 工作类型

- `remote`: 远程
- `onsite`: 实地

### 工作强度类型

- `total`: 总计
- `daily`: 每天
- `weekly`: 每周

## API接口

### 1. 提交工作量

- **接口URL**: `/api/workload/`
- **请求方法**: POST
- **权限要求**: 已登录的学生或导师

#### 请求参数

| 参数名          | 类型    | 必填 | 说明                                          |
|----------------|---------|------|----------------------------------------------|
| name           | string  | 是   | 工作量名称                                    |
| content        | string  | 是   | 工作内容                                      |
| source         | string  | 是   | 工作来源（horizontal/innovation/hardware/assessment）|
| work_type      | string  | 是   | 工作类型（remote/onsite）                     |
| start_date     | date    | 是   | 开始日期（YYYY-MM-DD）                        |
| end_date       | date    | 是   | 结束日期（YYYY-MM-DD）                        |
| intensity_type | string  | 是   | 工作强度类型（total/daily/weekly）            |
| intensity_value| float   | 是   | 工作强度值                                    |
| image_path     | string  | 否   | 图片路径                                      |
| file_path      | string  | 否   | 文件路径                                      |
| reviewer_id    | integer | 是   | 审核者ID（学生选择导师，导师选择教师）         |

#### 响应示例

```json
{
    "id": 1,
    "name": "项目开发",
    "content": "开发新功能模块",
    "source": "horizontal",
    "work_type": "remote",
    "start_date": "2025-03-01",
    "end_date": "2025-03-15",
    "intensity_type": "daily",
    "intensity_value": 8.0,
    "image_path": "path/to/image.jpg",
    "file_path": "path/to/file.pdf",
    "submitter": {
        "id": 1,
        "username": "student1",
        "role": "student"
    },
    "reviewer": {
        "id": 2,
        "username": "mentor1",
        "role": "mentor"
    },
    "status": "pending",
    "mentor_comment": null,
    "teacher_comment": null,
    "created_at": "2025-03-13T06:00:00Z",
    "updated_at": "2025-03-13T06:00:00Z"
}
```

### 2. 获取工作量列表

- **接口URL**: `/api/workload/`
- **请求方法**: GET
- **权限要求**: 已登录的学生或导师

#### 响应示例

```json
[
    {
        "id": 1,
        "name": "项目开发",
        // ... 其他字段与单个工作量响应相同
    },
    {
        "id": 2,
        "name": "项目测试",
        // ... 其他字段与单个工作量响应相同
    }
]
```

### 3. 获取单个工作量详情

- **接口URL**: `/api/workload/{id}/`
- **请求方法**: GET
- **权限要求**: 已登录的学生或导师（只能查看自己提交的工作量）

#### 响应格式
与提交工作量的响应格式相同

### 4. 修改工作量

- **接口URL**: `/api/workload/{id}/`
- **请求方法**: PUT/PATCH
- **权限要求**: 已登录的学生或导师（只能修改自己提交的且状态为未审核或审核未通过的工作量）

#### 请求参数
与提交工作量的请求参数相同，但所有字段都是可选的（PATCH方法）

#### 响应格式
与提交工作量的响应格式相同

### 5. 删除工作量

- **接口URL**: `/api/workload/{id}/`
- **请求方法**: DELETE
- **权限要求**: 已登录的学生或导师（只能删除自己提交的且状态为未审核或审核未通过的工作量）

#### 响应
- 成功：HTTP状态码 204 No Content
- 失败：HTTP状态码 403 Forbidden（如果尝试删除已审核的工作量）

## 错误响应

### 通用错误响应格式

```json
{
    "detail": "错误信息"
}
```

### 表单验证错误响应格式

```json
{
    "field_name": [
        "错误描述"
    ]
}
```

### 常见错误码

- 400 Bad Request: 请求参数错误
- 401 Unauthorized: 未登录
- 403 Forbidden: 权限不足或操作不允许
- 404 Not Found: 资源不存在
- 500 Internal Server Error: 服务器内部错误

## 特殊说明

1. 工作量提交规则：
   - 学生只能选择导师作为审核者
   - 导师只能选择教师作为审核者
   - 结束日期不能早于开始日期

2. 工作量修改/删除规则：
   - 只能修改/删除状态为"待审核"、"导师已驳回"或"教师已驳回"的工作量
   - 一旦工作量被审核通过，将无法修改或删除 