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
- `mentor_rejected`: 导师已驳回
- `teacher_approved`: 教师已审核
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
| mentor_reviewer_id | integer | 条件 | 导师审核人ID（仅学生提交时必填）             |

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
    "mentor_reviewer": {
        "id": 2,
        "username": "mentor1",
        "role": "mentor"
    },
    "teacher_reviewer": null,
    "status": "pending",
    "mentor_comment": null,
    "mentor_review_time": null,
    "teacher_comment": null,
    "teacher_review_time": null,
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

### 6. 获取待审核工作量列表

- **接口URL**: `/api/workload/pending_review/`
- **请求方法**: GET
- **权限要求**: 已登录的导师或教师

#### 响应说明
- 导师：获取指定自己为审核导师的、状态为待审核的学生工作量
- 教师：获取所有待审核的工作量（包括导师提交的待审核工作量和学生提交的导师已审核工作量）

#### 响应示例

```json
[
    {
        "id": 1,
        "name": "项目开发",
        // ... 其他字段与工作量响应格式相同
        "status": "pending"
    }
]
```

### 7. 获取已审核工作量列表（仅导师）

- **接口URL**: `/api/workload/reviewed/`
- **请求方法**: GET
- **权限要求**: 已登录的导师

#### 响应示例

```json
[
    {
        "id": 1,
        "name": "项目开发",
        // ... 其他字段与工作量响应格式相同
        "status": "mentor_approved",
        "mentor_review_time": "2025-03-14T10:00:00Z"
    }
]
```

### 8. 获取所有工作量列表（仅教师）

- **接口URL**: `/api/workload/all_workloads/`
- **请求方法**: GET
- **权限要求**: 已登录的教师

#### 响应示例

```json
[
    {
        "id": 1,
        "name": "项目开发",
        // ... 其他字段与工作量响应格式相同
    }
]
```

### 9. 审核工作量

- **接口URL**: `/api/workload/{id}/review/`
- **请求方法**: POST
- **权限要求**: 已登录的导师或教师

#### 请求参数

| 参数名          | 类型    | 必填 | 说明                                          |
|----------------|---------|------|----------------------------------------------|
| status         | string  | 是   | 审核状态（导师：mentor_approved/mentor_rejected；教师：teacher_approved/teacher_rejected）|
| mentor_comment | string  | 条件 | 导师审核评论（导师审核时必填）                  |
| teacher_comment| string  | 条件 | 教师审核评论（教师审核时必填）                  |

#### 响应示例

```json
{
    "id": 1,
    "name": "项目开发",
    // ... 其他字段与工作量响应格式相同
    "status": "mentor_approved",
    "mentor_comment": "工作完成得很好",
    "mentor_review_time": "2025-03-14T10:00:00Z",
    "teacher_comment": null,
    "teacher_review_time": null
}
```

## 审核规则说明

1. 学生提交规则：
   - 必须指定导师作为审核人
   - 工作量需要先经过导师审核，再由教师审核

2. 导师提交规则：
   - 不需要指定审核人
   - 工作量可以直接由任意教师审核

3. 导师审核规则：
   - 只能审核指定自己为审核导师的学生工作量
   - 只能将状态设置为"导师已审核"或"导师已驳回"
   - 必须填写导师评论
   - 系统会自动记录审核时间

4. 教师审核规则：
   - 可以审核所有导师提交的工作量
   - 对于学生工作量，必须等待导师审核通过后才能审核
   - 只能将状态设置为"教师已审核"或"教师已驳回"
   - 必须填写教师评论
   - 系统会自动记录审核人和审核时间

5. 工作量修改/删除规则：
   - 只能修改/删除状态为"待审核"、"导师已驳回"或"教师已驳回"的工作量
   - 一旦工作量被审核通过，将无法修改或删除

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