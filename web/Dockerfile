FROM node:20.17.0-slim

WORKDIR /app

# 复制项目文件
COPY . .

RUN npm ci \
    && npm run build

# 暴露端口
EXPOSE 3333

# 启动命令
CMD ["npx", "next", "start", "-p", "3333"]