# 后端构建镜像（基于Node 18 Alpine，体积小速度快）
FROM node:18-alpine AS builder
WORKDIR /app

# 先复制依赖文件，利用Docker缓存，不用每次都重新装依赖
COPY backend/package*.json ./
RUN npm ci --omit=dev --no-fund --no-audit

# 复制源码并构建
COPY backend/ ./
RUN npm run build

# 运行阶段，更小的镜像
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./
COPY backend/package.json ./
COPY backend/.env ./

EXPOSE 8080
CMD ["node", "index.js"]
