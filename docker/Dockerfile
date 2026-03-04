# =============================================================
# SM2 协同签名服务 - 多阶段构建
# Stage 1: 后端构建 (Go)  - 同时构建 server 和 admin 两个二进制
# Stage 2: 运行时 (Alpine) - 最小化镜像，直接暴露双端口
# =============================================================

# ---- Stage 1: Backend Builder ----
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

RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o sm2-admin \
    ./cmd/admin/main.go


# ---- Stage 2: Runtime ----
FROM alpine:3.20

RUN apk add --no-cache \
    ca-certificates \
    wget \
    && mkdir -p /app/data /app/scripts

WORKDIR /app

# 复制后端二进制
COPY --from=backend-builder /build/sm2-co-sign-server /app/sm2-co-sign-server
COPY --from=backend-builder /build/sm2-admin /app/sm2-admin

# 复制配置和数据库 schema
COPY backend/config.yaml /app/config.yaml
COPY backend/scripts/schema.sql /app/scripts/schema.sql

# 暴露端口：7094 (业务 /api/*) + 7093 (管理 /mapi/*)
EXPOSE 7094 7093

# 健康检查（管理端口）
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
    CMD wget --spider -q http://127.0.0.1:7093/mapi/health || exit 1

CMD ["./sm2-co-sign-server"]
