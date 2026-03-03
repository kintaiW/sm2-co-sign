# =============================================================
# SM2 协同签名服务 - 多阶段构建
# Stage 1: 前端构建 (Node)
# Stage 2: 后端构建 (Go)
# Stage 3: 运行时 (Alpine + Nginx + Supervisord)
# =============================================================

# ---- Stage 1: Frontend Builder ----
FROM node:20-alpine AS frontend-builder

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build


# ---- Stage 2: Backend Builder ----
FROM golang:1.24-alpine AS backend-builder

RUN apk add --no-cache git

WORKDIR /build
COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
# 静态编译，无 CGO 依赖（modernc.org/sqlite 是纯 Go）
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o sm2-co-sign-server \
    ./cmd/server/main.go


# ---- Stage 3: Runtime ----
FROM alpine:3.20

RUN apk add --no-cache \
    nginx \
    supervisor \
    ca-certificates \
    wget \
    && mkdir -p /app/data /app/scripts /var/log/nginx /run/nginx

WORKDIR /app

# 复制后端二进制
COPY --from=backend-builder /build/sm2-co-sign-server /app/sm2-co-sign-server

# 复制后端配置和数据库 schema
COPY backend/config.yaml /app/config.yaml
COPY backend/scripts/schema.sql /app/scripts/schema.sql

# 复制前端静态文件
COPY --from=frontend-builder /build/dist /usr/share/nginx/html

# 复制 Docker 配置
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf

# 暴露端口：80 (Nginx 统一入口)
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
    CMD wget --spider -q http://127.0.0.1:9002/mapi/health || exit 1

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
