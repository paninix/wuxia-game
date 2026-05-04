# 前端多阶段构建，最小镜像体积
FROM node:18-alpine AS builder
WORKDIR /app

# 先复制依赖，利用缓存
COPY frontend/package*.json ./
RUN npm ci --no-fund --no-audit

# 复制源码构建
COPY frontend/ ./
RUN npm run build

# 运行阶段用官方Nginx镜像，体积小性能好
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 复制构建好的前端文件
COPY --from=builder /app/dist ./

# 写入Nginx配置，自动反向代理后端接口
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # 接口请求自动转发到后端服务（Docker内部域名，不用改IP）\
    location /api { \
        proxy_pass http://backend:8080/api; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # 前端路由history模式支持，刷新不404 \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
