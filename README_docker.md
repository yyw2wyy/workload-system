# 工作量系统 Docker 部署指南

本文档提供了使用 Docker 部署工作量系统的详细指南，包括初次部署和后续维护的操作步骤。

## 目录

- [前提条件](#前提条件)
- [项目结构](#项目结构)
- [初次部署](#初次部署)
- [常见问题与解决方案](#常见问题与解决方案)
- [维护与更新](#维护与更新)
- [数据备份与恢复](#数据备份与恢复)
- [生产环境配置建议](#生产环境配置建议)

## 前提条件

在开始部署之前，请确保您的服务器已安装以下软件：

- Docker (推荐 20.10.x 或更高版本)
- Docker Compose (推荐 2.x 或更高版本)
- Git (用于拉取代码)

您可以使用以下命令检查安装版本：

```bash
docker --version
docker-compose --version
git --version
```

## 项目结构

本项目由以下主要组件组成：

- **后端 API 服务**：基于 Django 构建的 RESTful API
- **前端 Web 应用**：基于 Next.js 构建的 Web 应用
- **MySQL 数据库**：存储系统数据
- **Redis**：用于缓存和消息队列

Docker 相关的文件结构：

```
.
├── docker-compose.yml           # Docker Compose 配置文件
├── docker/                      # Docker 数据持久化目录
│   ├── mysql_data/              # MySQL 数据存储
│   ├── redis_data/              # Redis 数据存储
│   ├── api_media/               # 后端媒体文件存储
│   └── api_static/              # 后端静态文件存储
├── api/                         # 后端代码
│   ├── Dockerfile               # 后端 Docker 构建文件
│   ├── .env.docker              # 后端 Docker 环境变量
│   └── ...
└── web/                         # 前端代码
    ├── Dockerfile               # 前端 Docker 构建文件
    └── ...
```

## 初次部署

### 1. 获取代码

```bash
git clone <项目仓库地址> workload-system
cd workload-system
```

### 2. 环境配置

首次部署前，请检查并根据需要修改以下配置文件：

- `api/.env.docker`：后端环境配置
- `docker-compose.yml`：Docker 服务配置

**重要**：在生产环境中，请修改所有默认密码和密钥！

### 3. 启动服务

执行以下命令启动所有服务：

```bash
docker-compose up -d
```

首次启动时，Docker 将：
1. 拉取所需的基础镜像（MySQL, Redis）
2. 构建前端和后端应用镜像
3. 创建并启动所有容器

此过程可能需要几分钟时间，具体取决于您的网络速度和服务器性能。

### 4. 数据库初始化

首次部署时，需要执行数据库迁移并创建初始管理员账户：

```bash
docker-compose exec api python manage.py migrate
docker-compose exec api python manage.py createsuperuser
```

按照提示输入管理员用户名、邮箱和密码。

### 5. 收集静态文件

```bash
docker-compose exec api python manage.py collectstatic --noinput
```

### 6. 验证部署

服务启动后，可通过以下地址访问：

- 前端应用：http://服务器IP:3000
- 后端API：http://服务器IP:8000/api
- 管理后台：http://服务器IP:8000/admin

## 常见问题与解决方案

### 数据库连接失败

如果后端服务无法连接到数据库，请检查：

1. 数据库服务是否正常运行：`docker-compose ps db`
2. 数据库配置是否正确：检查 `api/.env.docker` 中的数据库连接信息
3. 检查数据库日志：`docker-compose logs db`

### 前端无法连接后端

如果前端无法连接后端API，请检查：

1. 后端服务是否正常运行：`docker-compose ps api`
2. 后端API是否可访问：使用`curl http://localhost:8000/api`测试
3. 前端配置中的API地址是否正确

### 容器启动失败

如果容器无法正常启动，请查看容器日志：

```bash
docker-compose logs <服务名>  # 例如: docker-compose logs api
```

## 维护与更新

### 查看服务状态

```bash
docker-compose ps
```

### 启动/停止/重启服务

```bash
# 启动所有服务
docker-compose start

# 停止所有服务
docker-compose stop

# 重启特定服务
docker-compose restart <服务名>  # 例如: docker-compose restart api
```

### 更新应用

当代码有更新时，执行以下步骤更新应用：

1. 拉取最新代码：
   ```bash
   git pull
   ```

2. 重新构建并启动容器：
   ```bash
   docker-compose up -d --build
   ```

3. 如有数据库变更，执行迁移：
   ```bash
   docker-compose exec api python manage.py migrate
   ```

### 查看日志

```bash
# 查看所有服务的日志
docker-compose logs

# 查看特定服务的日志
docker-compose logs <服务名>  # 例如: docker-compose logs api

# 实时查看日志
docker-compose logs -f <服务名>
```

## 数据备份与恢复

### 数据库备份

```bash
# 创建备份目录
mkdir -p backups

# 备份MySQL数据库
docker-compose exec db mysqldump -u root -p<root密码> workload_db > backups/db_backup_$(date +%Y%m%d).sql
```

或者使用项目自带的备份脚本（如果有）：

```bash
docker-compose exec api python backup_db.py
```

### 数据库恢复

```bash
# 从备份文件恢复数据库
docker-compose exec -T db mysql -u root -p<root密码> workload_db < backups/db_backup_filename.sql
```

### 文件备份

定期备份以下目录：

- `docker/mysql_data`：数据库文件
- `docker/redis_data`：Redis数据
- `docker/api_media`：上传的媒体文件

```bash
# 创建备份
tar -czvf backups/data_backup_$(date +%Y%m%d).tar.gz docker/
```

## 生产环境配置建议

在将系统部署到生产环境时，建议进行以下配置调整：

### 安全配置

1. 修改所有默认密码：
   - 数据库密码
   - Redis密码
   - Django SECRET_KEY

2. 在 `api/.env.docker` 中关闭调试模式：
   ```
   DJANGO_DEBUG=False
   ```

3. 配置适当的 ALLOWED_HOSTS：
   ```
   DJANGO_ALLOWED_HOSTS=your-domain.com,www.your-domain.com
   ```

### 性能优化

1. 调整 `docker-compose.yml` 中的资源限制：
   - 为各服务分配适当的CPU和内存限制

2. 启用Gunicorn/uWSGI作为API服务的生产服务器：
   修改 `docker-compose.yml` 中的命令：
   ```yaml
   command: gunicorn mysite.wsgi:application --bind 0.0.0.0:8000 --workers=4
   ```

3. 配置前端静态文件缓存

### 使用反向代理

在生产环境中，建议使用Nginx作为反向代理：

1. 添加Nginx服务到 `docker-compose.yml`：
   ```yaml
   nginx:
     image: nginx:alpine
     restart: always
     ports:
       - "80:80"
       - "443:443"
     volumes:
       - ./docker/nginx/conf:/etc/nginx/conf.d
       - ./docker/nginx/ssl:/etc/nginx/ssl
       - ./docker/api_static:/usr/share/nginx/static
       - ./docker/api_media:/usr/share/nginx/media
     depends_on:
       - api
       - web
   ```

2. 配置Nginx以处理静态文件并代理API和前端请求

### 自动化备份

设置定时任务，定期执行数据库备份：

```bash
# 编辑crontab
crontab -e

# 添加每日备份任务
0 2 * * * cd /path/to/workload-system && docker-compose exec -T db mysqldump -u root -p<root密码> workload_db > backups/db_backup_$(date +\%Y\%m\%d).sql
```

---

如有其他问题或需要进一步的帮助，请联系系统管理员或开发团队。 