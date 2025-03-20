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

### 1. 获取工作量列表

- **接口URL**: `/api/workload/`
- **请求方法**: GET
- **权限要求**: 已登录用户

#### 查询参数

| 参数名    | 类型    | 必填 | 说明                                          |
|----------|---------|------|----------------------------------------------|
| submitted| boolean | 否   | 是否只获取自己提交的工作量，默认为false         |

#### 响应说明
根据用户角色和查询参数返回不同的工作量列表：

1. 当 `submitted=true` 时：
   - 返回用户自己提交的所有工作量

2. 当 `submitted=false` 或未指定时：
   - 学生：只能看到自己提交的工作量
   - 导师：可以看到自己提交的工作量和需要自己审核的学生工作量
   - 教师：可以看到自己提交的工作量、导师已审核的工作量、导师提交的待审核工作量和自己已审核的工作量

#### 响应示例

```json
[
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
        "attachments": "workload_files/student1/1/example.pdf",
        "attachments_url": "http://example.com/media/workload_files/student1/1/example.pdf",
        "original_filename": "example.pdf",
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
]
```

### 2. 提交工作量

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
| attachments    | file    | 否   | 附件文件（最大10MB）                          |
| mentor_reviewer_id | integer | 条件 | 导师审核人ID（仅学生提交时必填）             |

### 3. 获取单个工作量详情

- **接口URL**: `/api/workload/{id}/`
- **请求方法**: GET
- **权限要求**: 已登录用户（需要有查看权限）

#### 访问权限说明
- 学生：只能查看自己提交的工作量
- 导师：可以查看自己提交的工作量和指定自己为审核人的工作量
- 教师：可以查看所有工作量（包括自己提交的、已审核的和待审核的）

### 4. 修改工作量

- **接口URL**: `/api/workload/{id}/`
- **请求方法**: PUT/PATCH
- **权限要求**: 已登录用户（需要有修改权限）

#### 修改权限说明
- 只能修改自己提交的工作量
- 只能修改状态为"待审核"、"导师已驳回"或"教师已驳回"的工作量
- 一旦工作量被审核通过，将无法修改

### 5. 删除工作量

- **接口URL**: `/api/workload/{id}/`
- **请求方法**: DELETE
- **权限要求**: 已登录用户（需要有删除权限）

#### 删除权限说明
- 只能删除自己提交的工作量
- 只能删除状态为"待审核"、"导师已驳回"或"教师已驳回"的工作量
- 一旦工作量被审核通过，将无法删除

### 6. 获取待审核工作量列表

- **接口URL**: `/api/workload/pending_review/`
- **请求方法**: GET
- **权限要求**: 已登录的导师或教师

#### 响应说明
- 导师：获取指定自己为审核导师的、状态为待审核或被导师驳回的学生工作量
- 教师：获取所有待教师审核的工作量（包括导师已审核的学生工作量、导师提交的待审核工作量和被教师驳回的工作量）

### 7. 获取已审核工作量列表

- **接口URL**: `/api/workload/reviewed/`
- **请求方法**: GET
- **权限要求**: 已登录的导师或教师

#### 响应说明
- 导师：返回自己已审核的学生工作量（不包括待审核的工作量）
- 教师：返回自己已审核的所有工作量（不包括待审核的工作量）

### 8. 获取所有工作量列表

- **接口URL**: `/api/workload/all_workloads/`
- **请求方法**: GET
- **权限要求**: 已登录的教师

#### 响应说明
- 只有教师可以访问此接口
- 返回系统中的所有工作量记录，不区分状态和提交者

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

### 10. 导出工作量

- **接口URL**: `/api/workload/export/`
- **请求方法**: POST
- **权限要求**: 已登录的教师

#### 请求参数

| 参数名          | 类型    | 必填 | 说明                                          |
|----------------|---------|------|----------------------------------------------|
| workload_ids   | array   | 是   | 要导出的工作量ID列表                           |

#### 响应说明

- 成功时返回 Excel 文件
- 文件名格式：`workload_export_YYYYMMDD_HHMMSS.xlsx`
- Excel 文件包含以下字段：
  1. 提交人
  2. 工作量名称
  3. 工作量内容
  4. 工作来源
  5. 工作类型
  6. 开始日期
  7. 结束日期
  8. 工作强度类型
  9. 工作强度值
  10. 状态
  11. 导师评语
  12. 导师审核时间
  13. 教师评语
  14. 教师审核时间
  15. 创建时间

#### 错误响应

```json
{
    "detail": "错误信息"
}
```

常见错误：
- 403 Forbidden: "只有教师可以导出工作量"
- 400 Bad Request: "请选择要导出的工作量"
- 404 Not Found: "未找到指定的工作量"

## 文件处理说明

1. 文件上传规则：
   - 支持的文件大小：最大 10MB
   - 文件存储路径：`workload_files/{username}/{workload_id}/{filename}`
   - 保留原始文件名，支持中文文件名
   - 返回字段：
     - `attachments`: 文件在服务器上的相对路径
     - `attachments_url`: 文件的完整访问URL
     - `original_filename`: 原始文件名

2. 文件删除规则：
   - 删除工作量时自动删除关联的文件
   - 更新附件时自动删除旧文件

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
   - 系统会自动记录审核时间

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