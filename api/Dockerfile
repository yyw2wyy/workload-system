FROM python:3.10.16-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    pkg-config \
    build-essential \
    libmagic1 \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# 复制项目文件
COPY . /app/

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 设置环境变量
ENV PYTHONUNBUFFERED 1

# 暴露Django服务端口
EXPOSE 8000

# 设置启动命令
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]