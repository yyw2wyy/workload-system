# 工作量系统

**工作量系统** 是实验室内部使用的前后端分离全栈应用，用于 **管理、审核、查询和统计** 工作量任务。
 系统支持 **源码部署** 和 **Docker 部署** 两种方式。

------

## 功能概览

- **工作量管理**：提交、审核、查询与统计
- **用户管理**：注册、登录、权限控制
- **公告管理**：发布与查看系统公告
- **多角色支持**：
  - `student`：提交工作量申请
  - `mentor`：审核并修改时长
  - `teacher`：最终确认所有申请

------

## 系统架构

- **前端**：Next.js + React，响应式 UI
- **后端**：Django + Django REST Framework 提供 RESTful API
- **数据库**：MySQL
- **缓存**：Redis（会话管理与缓存）
- **认证**：Session / Cookie 

------

## 技术栈

### 后端

| 类型       | 技术 / 版本                                |
| ---------- | ------------------------------------------ |
| 框架       | Django 5.0.2, Django REST Framework 3.14.0 |
| 运行环境   | python 3.10.16                             |
| 数据库     | MySQL 8.0+ (mysqlclient 2.2.4)             |
| 缓存       | Redis (django-redis 5.4.0)                 |
| API文档    | drf-spectacular 0.28.0                     |
| Excel处理  | openpyxl 3.1.2                             |
| 部署服务器 | Gunicorn 21.2.0                            |

------

### 前端

| 类型       | 技术 / 版本                                    |
| ---------- | ---------------------------------------------- |
| 框架       | Next.js 15.2.2, React 19.0.0                   |
| 运行环境   | node v20.17.0                                  |
| UI组件     | Radix UI、Ant Design 5.24.3、Tailwind CSS 4.0+ |
| 状态管理   | Zustand 5.0.3                                  |
| 表单处理   | React Hook Form 7.54.2, Zod 3.24.2             |
| HTTP客户端 | Axios 1.8.3                                    |
| 数据查询   | TanStack Query 5.67.3                          |
| 日期处理   | date-fns 4.1.0, dayjs 1.11.13                  |

------

## 目录结构

### 整体结构

```
├── api/               # 后端代码
├── docker/            # docker数据卷
├── fix_bug/           # bug文档
├── web/               # 前端代码
├── .gitignore
├── docker-compose.yml # Docker Compose 配置文件
├── README.md          # 项目文档
└── README_docker.md   # 项目文档-docker
```

### 后端

```
api/
├── announcement/     # 公告管理-app
├── db_backups/       # 数据库备份文件
├── docs/             # api文档
├── logs/             # 日志文件（运行产生）
├── media/            # 媒体文件（运行产生）
├── mysite/           # 项目配置
│   ├── settings.py          # 全局设置
│   ├── urls.py              # 全局URL路由
│   └── ...
├── staticfiles/      # 静态文件（运行产生）
├── user/             # 用户管理-app
├── workload/         # 工作量管理-app
│   ├── management/          # 数据库备份脚本
│   ├── migrations/          # 数据库迁移记录
│   ├── models.py            # 数据模型
│   ├── serializers.py       # 序列化器
│   ├── urls.py              # 路由配置
│   ├── views.py             # 视图函数
│   └── ...
├── .env              # 源码环境变量
├── .env.docker       # Docker环境变量
├── .gitignore
├── backup_db.py      # 数据库备份脚本
├── db.sqlite3        # local分支使用的本地sqlite数据库
├── Dockerfile        # Docker构建文件
├── manage.py         # Django管理脚本
└── requirements.txt  # 依赖列表
```

------

### 前端

```
web/
├── app/                # 应用页面
│   ├── (auth)/         # 登录注册
│   ├── (main)/         # 主功能
│   │   ├── announcement/      # 公告页面
│   │   ├── profile/           # 用户信息页面
│   │   ├── workload/          # 工作量相关页面
│   │   │   ├── [id]/          # 已提交工作量页面工作量查看及修改——学生
│   │   │   ├── all/           # 所有工作量——老师
│   │   │   ├── detail/        # 历史审核查看详情——导师&老师
│   │   │   ├── review/        # 审核工作量相关页面——导师&老师
│   │   │   ├── submit/        # 提交工作量
│   │   │   ├── submitted/     # 已提交工作量
│   │   │   └── ...
│   │   └── ...
│   ├── globals.css     # 全局样式
│   └── layout.tsx      # 全局布局
├── components/         # UI组件
│   ├── auth/           # 路由保护
│   ├── layout/         # 侧边栏
│   └── ui/             # 其他组件
├── lib/                # 工具与hooks
│   ├── store/          # 登录状态存储
│   ├── types/          # 类型定义
│   └── validations/    # 表单验证
├── public/             # 静态资源
├── .env.docker         # Docker环境变量
├── .env.local          # 源码环境变量
├── .env.local.example  # 源码环境变量示例
├── .gitignore
├── Dockerfile          # Docker构建文件
├── next.config.ts      # Next.js配置文件
├── package.json        # 依赖管理
├── tailwind.config.ts  # Tailwind配置
└── tsconfig.json       # TypeScript配置
```

------

## 功能模块

### 后端

1. **用户管理**
   - 注册、登录、退出
   - 信息管理
   - 权限控制
2. **工作量管理**
   - 录入、审核
   - 查询与统计
3. **公告管理**
   - 发布与查看公告

### 前端

1. 认证页面（登录/注册）
2. 公告页面
3. 工作量页面（提交、审核、列表、详情）
4. 用户资料管理（信息修改、密码更新）

------

## 安装和部署

### 源码部署

#### 后端

> 前提：系统已安装mysql、redis服务。
>
> 本系统使用mysql 8.4.4、redis 5.0.14.1。

1. 创建虚拟环境并安装依赖

   ```
   cd api
   # 安装虚拟环境 
   conda create --n workload python=3.10 
   # 启动环境 
   conda activate workload
   # 安装依赖 
   pip install -r requirements.txt 
   ```

2. 配置mysql数据库

   ```
   # 登录mysql
   mysql -uroot -p
   >yourpassowrd
   # 创建数据库
   CREATE DATABASE workload_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   # 创建用户
   CREATE USER 'workload'@'localhost' IDENTIFIED BY '123456admin';
   # 授予权限
   GRANT ALL PRIVILEGES ON workload_db.* TO 'workload'@'localhost';
   # 刷新权限
   FLUSH PRIVILEGES;
   # 退出
   exit;
   ```

3. 执行数据库迁移

   ```
   # 创建新的迁移
   python manage.py makemigrations
   # 执行数据库迁移
   python manage.py migrate
   ```
   
4. 创建超级用户

   ```
   python manage.py createsuperuser
   ```

5. 在`.env`文件中配置环境变量

   **mysql相关**

   | 变量名      | 示例值      | 说明         |
   | ----------- | ----------- | ------------ |
   | DB_NAME     | workload_db | 数据库名     |
   | DB_USER     | workload    | 数据库用户名 |
   | DB_PASSWORD | 123456admin | 数据库密码   |
   | DB_HOST     | localhost   | 数据库地址   |
   | DB_PORT     | 3306        | 数据库端口   |

   **redis相关**

   | 变量名         | 示例值                   | 说明         |
   | -------------- | ------------------------ | ------------ |
   | REDIS_HOST     | 127.0.0.1                | Redis 地址   |
   | REDIS_PORT     | 6379                     | Redis 端口   |
   | REDIS_DB       | 1                        | Redis 数据库 |
   | REDIS_PASSWORD | 123456admin              | Redis 密码   |
   | REDIS_URL      | redis://127.0.0.1:6379/1 | Redis URL    |

   **其他**

   | 变量名            | 示例值              | 说明         |
   | ----------------- | ------------------- | ------------ |
   | DJANGO_SECRET_KEY | your-secret-key     | Django 密钥  |
   | DJANGO_DEBUG      | True                | 调试模式开关 |
   | FRONTEND_HOSTS    | localhost,127.0.0.1 | 前端域名     |
   | FRONTEND_PORT     | 3333                | 前端运行端口 |

6. 启动开发服务器

   ```
   python manage.py runserver 0.0.0.0:8888
   ```

##### 测试redis是否成功连接

使用`python manage.py shell`进入django shell命令台。

```
from django.core.cache import cache
cache.set('test_key', 'test_value', 30)
print(cache.get('test_key'))  # 应该输出 'test_value'
```

#### 前端

> 前提：系统已安装node服务。
>
> 本系统使用node v20.17.0。

1. 安装依赖

   ```
   cd web
   npm ci
   ```

2. 在`.env`文件中配置后端api地址

   ```
   # API地址配置
   NEXT_PUBLIC_API_URL=http://localhost:8888/api
   ```

3. 启动开发服务器

   ```
   npx next dev -p 3333
   ```

4. 访问前端服务： http://localhost:3333

##### 生成构建

```
npx next build
npx next start -p 3333
```

### Docker部署

> 前提：系统已安装 [Docker](https://docs.docker.com/get-docker/)服务。

1. 创建docker目录用于持久化数据

   ```
   mkdir -p docker/mysql_data docker/redis_data docker/api_media docker/api_static
   ```

2. 修改`docker-compose.yml`中`db`容器的`user`值

   - 如果在windows下运行，注释掉这一行。

   - 如果在liunx下运行

   ```
   # liunx下需设置MySQL的运行用户，不设置的话默认以root用户运行，会导致因为权限不足无法删除mysql_data文件夹，
   user: "1047:1047"
   ```

   **如何确定当前用户的 UID/GID？**
    在终端运行：

   ```
   id -u  # 获取当前用户 UID
   id -g  # 获取当前用户 GID
   ```

   然后把 `1047:1047` 替换成实际值。

3. 构建并启动服务

   ```
   docker compose up -d
   ```

4. 执行数据库迁移并创建管理员用户

   ```
   docker compose exec api bash
   # 创建新的迁移
   python manage.py makemigrations
   # 执行数据库迁移
   python manage.py migrate
   # 创建管理员用户
   python manage.py createsuperuser
   用户名：admin
   邮箱：admin@example.com
   Password：
   
   exit
   ```
   
5. 收集静态文件（好像不需要）

   ```
   docker compose exec api bash
   python manage.py collectstatic --noinput
   ```

6. 访问应用

   - 前端应用：http://localhost:3333

   - 后端API：http://localhost:8888/api

   - 管理后台：http://localhost:88888/admin

   - 使用Navicat连接数据库

     ```
     端口：13306
     用户名：workload
     密码：123456admin
     ```

------

## 维护与更新

> 本系统主要在windows下进行开发，在liunx下使用docker部署。所以主要以docker的角度展开

### 维护

- 启动服务：`docker compose up -d` or `docker compose start`
- 停止服务：`docker compose down` or `docker compose stop`

- 查看运行状态：`docker compose ps`
- 实时查看所有日志（去掉`-f`即非实时）：`docker compose logs -f`
- 实时单独查看某个容器的日志：`docker compose logs -f api`
- 进入某个容器的命令行：`docker compose exec api bash`

### 更新

流程：在windows环境下使用源码部署方式进行开发测试&rarr;在windows环境下使用docker部署测试&rarr;在liunx环境下使用docker部署上线。

下面主要讲liunx平台下的更新。

1. 拉取最新代码：

   ```bash
   git pull
   ```

2. 重新构建并启动容器：

   > 服务器的网不太行，下面两种方式都多试几次

   ```bash
   docker-compose up -d --build
   或重新完整构建
   docker compose build --no-cache
   docker compose up -d
   ```

3. 如有数据库变更，执行迁移：

   对于多人同时开发或多端开发（windows下开发，liunx下部署），每个人修改了数据model后，生成的迁移文件`0006_xxx.py`一定要第一时间上传git，且其他人或其他设备第一时间git pull得到最新代码，然后运行`python manage.py migrate`执行数据库迁移，注意一定不要再运行`python manage.py makemigrations`生成新的迁移文件，以免产生重复。

   即谁修改了数据库，谁执行`python manage.py makemigrations`生成数据库迁移文件并上传git。其他人只需要更新代码拿到新的数据库迁移文件，然后直接`python manage.py migrate`执行即可

   ```
   docker-compose exec api bash
   # 使用自定义的迁移命令应用数据库迁移
   python manage.py migrate_with_backup
   or 
   # 应用数据库迁移
   python manage.py migrate
   ```

### 数据库备份与恢复

备份文件将保存在 `api/db_backups/` 目录下。

每次备份后，文件记得上传git。

- 备份：`python backup_db.py backup`
- 迁移时自动进行备份：`python manage.py migrate_with_backup`
- 恢复：`python backup_db.py restore db_backups/你的备份文件.sql`
- 查看备份列表：`python backup_db.py list`

### 数据持久化

所有数据通过宿主机的docker目录进行持久化：

- MySQL数据： `./docker/mysql_data`
- Redis数据： `./docker/redis_data`
- 媒体文件： `./docker/api_media`
- 静态文件： `./docker/api_static`

---

## 后台管理平台

项目使用django自带的`admin`后台管理平台。

- 启动后端服务
- 访问`localhost:8888/admin`即可

---

## Swagger接口文档

项目使用`drf-spectacular`来生成接口文档。

接口文档限制只有管理员可以查看。

- 启动后端服务

- 登录管理平台`localhost:8888/admin`

- 在同一个浏览器内访问

  ```
  # swagger文档
  localhost:8888/doc/swagger
  # redoc文档
  localhost:8888/doc/redoc
  # 下载原始json schema
  localhost:8888/doc/schema
  ```

---

## 运行端口

首先本项目不通过环境变量来设置前后端运行端口，而是通过启动命令来确定前后端运行端口，环境变量只是为了前后端的正常通信。
下面以后端在8888端口，前端在3333端口运行为例。

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

---

## 警告

1. 拉取最新的代码后的第一件事运行数据库迁移`python manager.py migrate`。
2. 不要修改任何已有的数据库迁移文件`0006_xxx.py`
3. 修改数据model后产生的新数据库迁移文件，第一时间上传git

## 常见问题

- **前端无法连接后端**：API服务是否正常运行、前端的API基础URL配置是否正确、是否存在端口冲突

------

## 更新记录

### 2025-08-14

- 支持自定义前后端运行端口
