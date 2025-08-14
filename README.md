# 工作量系统

工作量系统是一个用于管理和跟踪工作任务的全栈应用，由前端 (Next.js) 和后端 (Django) 组成。该系统支持用户工作量的提交、审核、查询和统计等功能。

## 目录

- [系统架构](#系统架构)
- [后端 (API)](#后端-api)
  - [技术栈](#后端技术栈)
  - [目录结构](#后端目录结构)
  - [主要功能模块](#后端主要功能模块)
  - [开发与运行](#后端开发与运行)
- [前端 (Web)](#前端-web)
  - [技术栈](#前端技术栈)
  - [目录结构](#前端目录结构)
  - [主要页面与功能](#前端主要页面与功能)
  - [开发与运行](#前端开发与运行)
- [环境配置](#环境配置)
- [部署说明](#部署说明)
- [常见问题](#常见问题)

## 系统架构

工作量系统采用前后端分离的架构：

- **前端**：基于 Next.js 框架的 React 应用，提供响应式用户界面
- **后端**：基于 Django 和 Django REST Framework 的 RESTful API
- **数据库**：MySQL 关系型数据库
- **缓存**：Redis 用于会话管理和缓存
- **认证**：基于 JWT (JSON Web Token) 的用户认证

## 基本依赖

后端：python 3.10.16

前端：node v20.17.0

## 后端 (API)

### 后端技术栈

- **框架**：Django 5.0.2, Django REST Framework 3.14.0
- **数据库**：MySQL 8.0+ (通过 mysqlclient 2.2.4)
- **缓存**：Redis (通过 django-redis 5.4.0)
- **认证**：djangorestframework-simplejwt 5.3.1
- **API文档**：drf-yasg 1.21.7
- **Excel处理**：openpyxl 3.1.2
- **WSGI服务器**：Gunicorn 21.2.0

### 后端目录结构

```
api/
├── mysite/                  # 项目配置目录
│   ├── settings.py          # 全局设置
│   ├── urls.py              # 全局URL路由
│   └── ...
├── workload/                # 工作量应用
│   ├── models.py            # 数据模型
│   ├── views.py             # 视图函数
│   ├── serializers.py       # 序列化器
│   ├── urls.py              # 路由配置
│   └── ...
├── user/                    # 用户管理应用
├── announcement/            # 公告管理应用
├── static/                  # 静态文件
├── media/                   # 媒体文件
├── manage.py                # Django管理脚本
├── requirements.txt         # 依赖列表
├── Dockerfile               # Docker构建文件
└── .env.docker             # Docker环境变量
```

### 后端主要功能模块

1. **用户管理 (user)**
   - 用户注册、登录、退出
   - 用户信息管理
   - 权限控制

2. **工作量管理 (workload)**
   - 工作量录入
   - 工作量审核
   - 工作量查询与统计

3. **公告管理 (announcement)**
   - 发布系统公告
   - 公告查看与管理

### 后端开发与运行

**环境准备**

1. 安装Python 3.10+
2. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```
3. 复制 `.env.example` 到 `.env` 并配置环境变量

**数据库设置**

1. 创建MySQL数据库：
   ```sql
   CREATE DATABASE workload_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. 迁移数据库：
   ```bash
   python manage.py migrate
   ```

**启动开发服务器**

```bash
python manage.py runserver 0.0.0.0:8888
```

>  默认为8000端口

**创建超级用户**

```bash
python manage.py createsuperuser
```

## 前端 (Web)

### 前端技术栈

- **框架**：Next.js 15.2.2, React 19.0.0
- **UI组件**：
  - Radix UI 组件库
  - Ant Design 5.24.3
  - Tailwind CSS 4.0+
- **状态管理**：Zustand 5.0.3
- **表单处理**：React Hook Form 7.54.2, Zod 3.24.2
- **HTTP客户端**：Axios 1.8.3
- **查询管理**：TanStack Query 5.67.3
- **日期处理**：date-fns 4.1.0, dayjs 1.11.13

### 前端目录结构

```
web/
├── app/                       # 主应用目录
│   ├── (auth)/                # 认证相关页面
│   ├── (main)/                # 主要功能页面
│   │   ├── announcement/      # 公告相关页面
│   │   ├── profile/           # 用户信息页面
│   │   ├── workload/          # 工作量相关页面
│   │   │   ├── all/           # 所有工作量
│   │   │   ├── submit/        # 提交工作量
│   │   │   ├── review/        # 审核工作量
│   │   │   ├── submitted/     # 已提交工作量
│   │   │   └── ...
│   │   └── ...
│   ├── globals.css            # 全局样式
│   └── layout.tsx             # 全局布局
├── components/                # 组件目录
├── lib/                       # 工具函数和钩子
├── public/                    # 静态资源
├── next.config.ts             # Next.js配置
├── package.json               # 依赖管理
├── tailwind.config.ts         # Tailwind配置
└── tsconfig.json              # TypeScript配置
```

### 前端主要页面与功能

1. **认证页面**
   - 登录
   - 注册（如有）
   - 找回密码（如有）

2. **主页和仪表盘**
   - 系统概览
   - 公告展示
   - 快速导航

3. **工作量管理**
   - 提交工作量
   - 工作量列表
   - 审核工作量
   - 工作量详情

4. **用户信息**
   - 个人资料
   - 密码修改
   - 通知设置

### 前端开发与运行

**环境准备**

1. 安装Node.js 20+
2. 安装依赖：
   ```bash
   npm ci
   ```

**开发环境运行**

```bash
npx next dev -p 3333
```

这将启动开发服务器，地址为 http://localhost:3333

> 默认为3000端口

**生产构建**

```bash
npx next build
npx next start -p 3333
```

## 环境配置

### 后端环境变量 (.env)

主要配置项包括：

- 数据库连接信息
- Redis配置
- Django SECRET_KEY
- 调试模式开关
- 允许的主机列表
- 前端运行端口

示例：
```
# 数据库配置
DB_NAME=workload_db
DB_USER=workload
DB_PASSWORD=123456admin
DB_HOST=localhost
DB_PORT=3306

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=1
REDIS_PASSWORD=123456admin  #如果 Redis 没有设置密码，保持为空
REDIS_URL=redis://127.0.0.1:6379/1

# Django 配置
DJANGO_SECRET_KEY=django-insecure-hp6d_%0)xkjc*2n(xp%05y3@6re$0!*bvpbcu%b376!92frt5&
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# 前端端口配置
FRONTEND_HOSTS=localhost,127.0.0.1,web,0.0.0.0
FRONTEND_PORT=3333
```

### 前端环境变量 (.env.local)

主要配置项包括：

- API基础URL
- 环境标识

示例：
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 部署说明

本项目支持使用Docker进行部署，详细的部署说明请参考 [Docker部署指南](README_docker.md)。

### 基本部署流程

1. 克隆代码仓库
2. 配置环境变量
3. 构建Docker镜像
4. 启动Docker容器
5. 执行数据库迁移
6. 创建超级用户
7. 验证部署

## 常见问题

### API连接问题

如果前端无法连接到后端API，请检查：

1. API服务是否正常运行
2. CORS配置是否正确
3. 前端的API基础URL配置是否正确

### 数据库迁移错误

如遇到数据库迁移错误，可尝试：

1. 检查数据库连接配置
2. 确保数据库用户拥有足够权限
3. 尝试使用 `python manage.py migrate --fake` 跳过冲突的迁移

### 静态文件404

如静态文件无法加载，请检查：

1. 是否执行了 `python manage.py collectstatic`
2. 静态文件目录权限是否正确
3. Web服务器的静态文件配置是否正确

---

如需更多帮助或发现问题，请提交Issue或联系系统管理员。

## 端口

首先本项目不通过环境变量来设置前后端运行端口，而是通过启动命令来确定前后端运行端口，环境变量只是为了前后端的正常通信。
下面以前端在8888端口，后端在3333端口运行为例。

### 源码启动

#### 后端

```
cd api
python manage.py runserver 0.0.0.0:8888
```

后端即在8888端口启动

#### 前端

```
开发环境
npx next dev -p 3333

生产环境
npx next build
npx next start -p 3333
```

前端即在3333端口启动

#### .env配置

修改后端`.env`文件中的`FRONTEND_PORT`值为前端运行端口

```
# 前端端口配置
FRONTEND_HOSTS=localhost,127.0.0.1,web,0.0.0.0
FRONTEND_PORT=3333
```

修改前端`.env.local`文件中的`NEXT_PUBLIC_API_URL`中的端口为后端运行端口

```
# API地址配置
NEXT_PUBLIC_API_URL=http://localhost:8888/api
```

### Docker启动

#### 后端

修改后端Dockerfile中的`EXPOSE`以及`CMD`中的端口，后端即在8888端口运行

```
# 暴露Django服务端口
EXPOSE 8888

# 设置启动命令
CMD ["python", "manage.py", "runserver", "0.0.0.0:8888"]
```

#### 前端

修改前端Dockerfile中的`EXPOSE`以及`CMD`中的端口，前端即在3333端口运行

```
# 暴露端口
EXPOSE 3333

# 启动命令
CMD ["npx", "next", "start", "-p", "3333"]
```

#### docker-compose.yml

修改后端api镜像中的`ports`变量为实际运行端口

```
ports:
  - "8888:8888"
```

修改前端web镜像中的`ports`变量为实际运行端口

```
ports:
  - "3333:3333"
```

#### .env.docker配置

修改后端`.env.docker`文件中的`FRONTEND_PORT`值为前端运行端口

```
# 前端端口配置
FRONTEND_HOSTS=localhost,127.0.0.1,web,0.0.0.0
FRONTEND_PORT=3333
```

修改前端`.env.docker`文件中的`NEXT_PUBLIC_API_URL`中的端口为后端运行端口

```
# API地址配置
NEXT_PUBLIC_API_URL=http://localhost:8888/api
```

