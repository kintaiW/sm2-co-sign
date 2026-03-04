# SM2 协同签名项目

[![Release](https://img.shields.io/github/v/release/kintaiW/sm2-co-sign)](https://github.com/kintaiW/sm2-co-sign/releases)
[![Docker Image](https://img.shields.io/badge/docker-ghcr.io-blue)](https://github.com/kintaiW/sm2-co-sign/pkgs/container/sm2-co-sign)

基于 SM2 国密算法的协同签名系统，采用客户端-服务端分离架构，实现密钥分片存储和协同签名/解密功能。

## 📦 项目结构

```
sm2-co-sign/
├── backend/          # 服务端 (Go) - Submodule
├── client/           # 客户端 (Rust) - Submodule
├── docs/             # 技术文档
└── scripts/          # 测试脚本
```

## 🔗 子模块

| 模块 | 仓库 | 技术栈 | 描述 |
|------|------|--------|------|
| **backend** | [sm2-co-sign-server](https://github.com/kintaiW/sm2-co-sign-server) | Go 1.24 + Fiber v2 | 协同签名服务端，双端口（业务 7094 / 管理 7093） |
| **client** | [sm2-co-sign-client](https://github.com/kintaiW/sm2-co-sign-client) | Rust 2021 + libsm | 协同签名客户端 CLI + FFI 接口 |

## 🚀 快速开始

### Docker 部署（推荐）

```bash
# 克隆仓库
git clone --recursive https://github.com/kintaiW/sm2-co-sign.git
cd sm2-co-sign

# 一键启动
docker compose up -d

# 查看状态
docker compose ps
```

验证部署：

```bash
# 健康检查（管理端口）
curl http://localhost:7093/mapi/health

# 查看统计信息
curl http://localhost:7093/mapi/stats
```

### 获取 SDK 动态库

**推荐**：直接从 [GitHub Releases](https://github.com/kintaiW/sm2-co-sign/releases) 页面下载预编译的 SDK 压缩包：

| 平台 | 文件 |
|------|------|
| Linux x86_64 | `sm2-co-sign-sdk-linux-x86_64.tar.gz` |
| macOS ARM64  | `sm2-co-sign-sdk-macos-arm64.tar.gz`  |

### 手动部署

#### 克隆仓库（包含子模块）

```bash
git clone --recursive https://github.com/kintaiW/sm2-co-sign.git
# 或
git clone https://github.com/kintaiW/sm2-co-sign.git
cd sm2-co-sign
git submodule update --init --recursive
```

### 启动服务端

```bash
cd backend
go mod tidy
go run cmd/server/main.go
# 业务接口: http://localhost:7094/api/*
# 管理接口: http://localhost:7093/mapi/*
```

### 构建客户端 CLI

```bash
cd client
cargo build --release
# 使用示例
./target/release/sm2-co-sign --server http://localhost:7094 register -u user1 -p pass123
./target/release/sm2-co-sign --server http://localhost:7094 login -u user1 -p pass123
./target/release/sm2-co-sign --server http://localhost:7094 sign -m ./message.txt
```

### 管理工具（Admin CLI）

```bash
cd backend
go build -o bin/sm2-admin ./cmd/admin/main.go
# 使用示例（连接管理端口 7093）
./bin/sm2-admin user list
./bin/sm2-admin key list
./bin/sm2-admin log list --limit 20
./bin/sm2-admin stats
./bin/sm2-admin health
```

## 📡 API 接口

### 业务接口 (/api/*) — 端口 7094

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/register` | POST | 用户注册（生成密钥对） |
| `/api/login` | POST | 用户登录（获取 Token） |
| `/api/sign` | POST | 协同签名 |
| `/api/decrypt` | POST | 协同解密 |

### 管理接口 (/mapi/*) — 端口 7093

| 接口 | 方法 | 描述 |
|------|------|------|
| `/mapi/users` | GET | 获取用户列表 |
| `/mapi/keys` | GET | 获取密钥列表 |
| `/mapi/logs` | GET | 查询审计日志 |
| `/mapi/health` | GET | 健康检查 |

详细 API 文档请参考 [backend/docs/api.md](backend/docs/api.md)

## 🔐 安全架构

```
┌─────────────────────────────────────────────────────────┐
│                    SM2 协同签名架构                       │
├─────────────────────────────────────────────────────────┤
│  客户端 (D1)              服务端 (D2)                    │
│  ┌─────────┐              ┌─────────┐                   │
│  │  d1     │              │  d2     │                   │
│  │ (私钥分量)│              │ (私钥分量)│                   │
│  └────┬────┘              └────┬────┘                   │
│       │                        │                        │
│       ▼                        ▼                        │
│  ┌─────────┐              ┌─────────┐                   │
│  │ P1=d1*G │ ───────────▶ │ P2=d2⁻¹*G│                  │
│  └─────────┘              └─────────┘                   │
│       │                        │                        │
│       └────────┬───────────────┘                        │
│                ▼                                        │
│         ┌─────────────┐                                 │
│         │ Pa = d2⁻¹*P1 │                                │
│         │  + (n-1)*G  │                                 │
│         │  (协同公钥)  │                                 │
│         └─────────────┘                                 │
│                                                         │
│  完整私钥: d = d1 * d2 - 1 (不存储)                      │
└─────────────────────────────────────────────────────────┘
```

## 🐳 Docker 架构

```
┌─────────────────────────────────────────────────────┐
│                Docker Container                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Go Backend                                   │   │
│  │  :7094  /api/*   (业务接口，需 Bearer Token)   │   │
│  │  :7093  /mapi/*  (管理接口)                   │   │
│  │  SQLite 数据库                                │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Volume: /app/data/ (SQLite 持久化)                  │
└─────────────────────────────────────────────────────┘
```

| 端口 | 路由 | 说明 |
|------|------|------|
| 7094 | `/api/*` | 业务接口（注册/登录/签名/解密） |
| 7093 | `/mapi/*` | 管理接口（用户/密钥/日志/监控） |

## 📋 许可证

本项目采用 [Apache License 2.0](LICENSE) 许可证。

## 📚 文档

- [在线文档 (GitHub Pages)](https://kintaiW.github.io/sm2-co-sign/)
- [架构设计](docs/architecture.md)
- [API 参考](docs/api-reference.md)

## 🔗 子模块文档

- [客户端文档 (GitHub Pages)](https://kintaiW.github.io/sm2-co-sign-client/)
- [服务端文档 (GitHub Pages)](https://kintaiW.github.io/sm2-co-sign-server/)
