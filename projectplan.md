# CLI 化改造计划

> 将前端 Web、后端、客户端统一改造为 CLI 交互模式

---

## 0. 现状分析

### 当前架构

```
┌─────────────────┐     HTTP      ┌──────────────────────────────┐
│  Frontend (Web) │ ──:9002───→   │  Backend (Go)                │
│  React + Antd   │               │  Fiber + SQLite              │
└─────────────────┘               │  /api/*  (业务) ← 单端口9002  │
                                  │  /mapi/* (管理) ← 同端口9002  │
┌─────────────────┐     HTTP      └──────────────────────────────┘
│  Client (Rust)  │ ──:9002───→          ↑
│  CLI + Core     │                      │
└─────────────────┘                      │
```

### 各组件职责

| 组件 | 当前形态 | 提供的功能 |
|------|---------|-----------|
| **Frontend** | React Web 应用 | 管理面板：用户管理、密钥管理、日志查看、系统监控、签名演示 |
| **Backend** | Go HTTP 服务（单端口 9002） | `/api/*` 用户操作 + `/mapi/*` 管理操作 |
| **Client** | Rust CLI（默认连接 `127.0.0.1:9002`） | `register`、`login`、`logout`、`sign`、`decrypt`、`health` |

### 端口现状

当前后端只有一个端口 9002，`/api/*` 和 `/mapi/*` 都走同一端口。

### GitHub Pages 现状

三个仓库各有独立的 GitHub Pages：

| 仓库 | Pages URL | 文档目录 |
|------|-----------|---------|
| **sm2-co-sign**（主仓库） | `https://kintaiW.github.io/sm2-co-sign/` | `docs/index.html`、`docs/architecture.md`、`docs/api-reference.md`、`docs/frontend-design.md`、`docs/screenshots/` |
| **sm2-co-sign-server**（后端子模块） | `https://kintaiW.github.io/sm2-co-sign-server/` | `backend/docs/index.html`、`backend/docs/api.md`、`backend/docs/api.yaml` |
| **sm2-co-sign-client**（客户端子模块） | `https://kintaiW.github.io/sm2-co-sign-client/` | `client/docs/index.html`、`client/docs/TECH_NOTES.md`、`client/docs/_config.yml` |

### 核心约束

协同签名协议要求 D1（客户端）和 D2（服务端）分离存储，**必须保留 client-server 架构**。因此"CLI 化"的含义是：
1. **去掉 Web 前端**，用 CLI 命令替代所有管理功能
2. **后端保持 HTTP 服务**，但拆分为双端口 + 增加 Admin CLI 工具
3. **客户端 CLI 增强**，覆盖所有用户端操作

### 目标架构

```
┌─────────────────────┐     HTTP       ┌──────────────────────────────┐
│  Client CLI (Rust)  │ ──:7094────→   │  Backend (Go)                │
│  用户操作全覆盖       │               │  Fiber + SQLite              │
│  默认连接 :7094      │               │                              │
└─────────────────────┘               │  :7094  /api/*  (业务端口)    │
                                      │  :7093  /mapi/* (管理端口)    │
┌─────────────────────┐     HTTP       └──────────────────────────────┘
│  Admin CLI (Go)     │ ──:7093────→          ↑
│  管理操作全覆盖       │                      │
│  默认连接 :7093      │               ┌──────────────────┐
└─────────────────────┘               │  Server CLI (Go) │
                                      │  服务启停+本地管理  │
                                      └──────────────────┘
```

---

## 1. 变动总览

### 1.1 前端（Frontend）—— 移除

| 变动 | 说明 |
|------|------|
| 移除 `frontend/` 目录 | Web UI 不再需要 |
| 移除 Docker 中的 Nginx + 前端构建阶段 | 容器只包含 Go 后端 |
| 移除 `docker/nginx.conf` | 不再需要反向代理 |
| 移除 `docker/supervisord.conf` | 单进程直接运行 |
| 更新 `docker-compose.yml` | 简化为仅后端服务 |
| 更新 CI/CD 工作流 | 移除前端构建步骤（Node.js setup、npm install、npm run build） |

### 1.2 后端（Backend）—— 改造

| 变动 | 说明 |
|------|------|
| **端口拆分** | 业务 `/api/*` 监听 **7094**，管理 `/mapi/*` 监听 **7093** |
| `config.yaml` 修改 | `server.port` → `server.api_port: 7094` + `server.admin_port: 7093` |
| `ServerConfig` 结构体修改 | 增加 `AdminPort` 字段 |
| `cmd/server/main.go` 修改 | 启动两个 Fiber 实例分别监听两个端口 |
| 新增 `cmd/admin/main.go` | Admin CLI 入口，用于管理操作 |
| 新增 `internal/cli/` 包 | Admin CLI 的命令实现 |

### 1.3 客户端（Client）—— 增强

| 变动 | 说明 |
|------|------|
| 默认 `--server` 地址改为 `http://127.0.0.1:7094` | 适配新的业务端口 |
| `sm2_co_sign_cli` 补充子命令 | `encrypt`、`info`、`verify` |
| 完善输出格式 | 支持 `--json` 输出用于脚本集成 |

### 1.4 GitHub Pages 文档更新

| 仓库 | 需要更新的文件 | 更新内容 |
|------|--------------|---------|
| **sm2-co-sign**（主仓库） | `docs/index.html` | 移除 React/前端相关描述，更新架构图为 CLI 模式，端口 9002→7093/7094 |
| | `docs/architecture.md` | 更新架构图、端口号、移除"Web 管理控制台"描述 |
| | `docs/api-reference.md` | 端口 9002→7094（业务）/ 7093（管理），更新 curl 示例 |
| | `docs/frontend-design.md` | 移除或标记为已归档 |
| | `docs/screenshots/` | 移除前端截图（login.svg、dashboard.svg 等） |
| **sm2-co-sign-server**（后端子模块） | `backend/docs/index.html` | 更新端口号 9002→7093/7094，更新架构图，增加 Admin CLI 说明 |
| | `backend/docs/api.yaml` | 更新 server URL 端口号 |
| | `backend/docs/api.md` | 更新端口号 |
| | `backend/config.yaml` 示例 | 更新端口配置 |
| **sm2-co-sign-client**（客户端子模块） | `client/docs/index.html` | 更新默认 server 地址为 :7094，增加新子命令说明 |
| | `client/docs/TECH_NOTES.md` | 如有端口引用则更新 |

---

## 2. 详细变动清单

### 2.1 端口拆分（Backend，修改）

**config.yaml 修改：**
```yaml
# 修改前
server:
  port: 9002

# 修改后
server:
  api_port: 7094      # 业务接口端口
  admin_port: 7093    # 管理接口端口
  read_timeout: 30s
  write_timeout: 30s
```

**ServerConfig 修改：**
```go
// 修改前
type ServerConfig struct {
    Port         int           `mapstructure:"port"`
    ...
}

// 修改后
type ServerConfig struct {
    ApiPort      int           `mapstructure:"api_port"`
    AdminPort    int           `mapstructure:"admin_port"`
    ...
}
```

**main.go 修改：**
- 创建两个 Fiber App 实例
- 业务路由 `/api/*` 绑定到 `apiApp`，监听 7094
- 管理路由 `/mapi/*` 绑定到 `adminApp`，监听 7093
- 两个 goroutine 并发监听

### 2.2 Admin CLI（Go，新增）

替代前端 Web 的所有管理功能，通过调用 `/mapi/*` API 实现：

```
sm2-admin [全局选项] <子命令> [参数]

全局选项:
  --server, -s <URL>    后端管理地址（默认 http://localhost:7093）

子命���:
  user list             列出所有用户（对应前端"用户管理"页面）
  user get <id>         查看用户详情
  user delete <id>      删除用户
  user status <id> <0|1>  启用/禁用用户

  key list              列出所有密钥（对应前端"密钥管理"页面）
  key delete <id>       删除密钥

  log list [--action <type>] [--limit <n>]   查看审计日志（对应前端"日志"页面）
  log export [--output <file>]               导出日志为 CSV

  stats                 查看系统统计（对应前端"仪表盘"）
  health                健康检查
```

需要的新代码：
- `backend/cmd/admin/main.go` — CLI 入口（使用 `cobra`）
- `backend/internal/cli/admin.go` — Admin 命令实现
- `backend/internal/cli/formatter.go` — 表格/JSON 输出格式化

### 2.3 Server CLI 增强（Go，修改）

当前 `cmd/server/main.go` 只接受一个 config 文件路径参数。增强为：

```
sm2-co-sign-server [命令] [选项]

命令:
  serve [--config <path>]     启动 HTTP 服务（默认行为，保持向后兼容）
  init-db [--config <path>]   仅初始化数据库
  version                     显示版本信息
```

### 2.4 Client CLI 增强（Rust，修改）

**默认地址修改：**
```rust
// 修改前
#[arg(short, long, default_value = "http://127.0.0.1:9002")]
server: String,

// 修改后
#[arg(short, long, default_value = "http://127.0.0.1:7094")]
server: String,
```

**补充子命令：**
- `encrypt` — 标准 SM2 加密
- `info` — 查看当前登录用户信息
- `verify` — SM2 验签
- 全局 `--json` 输出选项

### 2.5 Docker 改造

**简化前（当前）：**
```
Stage 1: frontend-builder (Node 20)
Stage 2: backend-builder (Go 1.24)
Stage 3: runtime (Alpine + Nginx + supervisord)
  - EXPOSE 80
  - 健康检查: :9002/mapi/health
```

**简化后：**
```
Stage 1: backend-builder (Go 1.24)
  - 同时构建 server 和 admin 两个二进制
Stage 2: runtime (Alpine)
  - 复制 server + admin 二进制
  - EXPOSE 7093 7094
  - 健康检查: :7093/mapi/health
  - CMD ["./sm2-co-sign-server", "serve"]
```

**docker-compose.yml 修改：**
```yaml
ports:
  - "7093:7093"    # 管理端口
  - "7094:7094"    # 业务端口
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:7093/mapi/health"]
```

### 2.6 CI/CD 工作流更新

**`.github/workflows/release.yml` 修改：**
- 移除 "Setup Node.js" 和 "Build Frontend" 步骤
- 新增 Admin CLI 二进制构建和上传步骤
- Release 产物清单：
  - `sm2-co-sign-server` — 服务端二进制
  - `sm2-admin` — 管理 CLI 二进制
  - `libsm2_co_sign_ffi.so` — Rust FFI 动态库
  - `sm2-co-sign-ffi.h` — FFI 头文件
  - Docker 镜像推送到 GHCR

### 2.7 端口引用全量替换清单

需要将 `9002` 替换为 `7093`/`7094` 的所有位置：

| 文件 | 当前值 | 目标值 |
|------|-------|--------|
| `backend/config.yaml` | `port: 9002` | `api_port: 7094` + `admin_port: 7093` |
| `backend/internal/config/config.go` | `Port int` | `ApiPort int` + `AdminPort int` |
| `backend/cmd/server/main.go` | 单端口监听 | 双端口监听 |
| `backend/docs/index.html` | 多处 9002 | 7093/7094 |
| `backend/docs/api.yaml` | 9002 | 7093/7094 |
| `backend/docs/api.md` | 9002 | 7093/7094 |
| `client/sm2_co_sign_cli/src/main.rs` | `default_value = "http://127.0.0.1:9002"` | `"http://127.0.0.1:7094"` |
| `client/docs/index.html` | 9002 | 7094 |
| `client/docs/TECH_NOTES.md` | 9002（如有） | 7094 |
| `docs/index.html` | 9002 | 7093/7094 |
| `docs/architecture.md` | `业务端口: 9002` | `业务端口: 7094` + `管��端口: 7093` |
| `docs/api-reference.md` | `端口 9002` + curl 示例 | 7093/7094 |
| `docker/Dockerfile` | 9002 | 7093/7094 |
| `docker-compose.yml` | 9002 | 7093/7094 |
| `docker/nginx.conf` | `proxy_pass :9002` | 移除（不再需要 Nginx） |
| `scripts/test_integration.sh` | `localhost:9002` | `localhost:7094`（业务）/ `localhost:7093`（管理） |
| `scripts/test_encryption.sh` | `localhost:9002` | `localhost:7094` |
| `scripts/test_signature.sh` | `localhost:9002` | `localhost:7094` |
| `README.md` | 9002 + 80 端口表格 | 7093/7094 端口表格 |
| `CLAUDE.md` | `port 9002` | `port 7094 (业务) / 7093 (管理)` |

### 2.8 GitHub Pages 文档详细变更

#### 主仓库 `docs/`

**`docs/index.html`：**
- 移除 header 中的 React badge `<img ... React-18 ...>`
- 技术栈移除 `<span class="tech-badge">React 18</span>`
- 特性卡片中 "Web 管理控制台" 改为 "CLI 管理工具"
- 架构图中 "Web 管理控制台" 改为 "Admin CLI 管理工具"
- API 端口从 9002 改为 7094/7093
- 快速开始移除 "启动前端" 部分，增加 Admin CLI 使用说明
- 移除前端截图引用

**`docs/architecture.md`：**
- 整体架构图中 "Web 管理控制台" → "Admin CLI"
- 技术栈表格移除 "前端 React" 行，增加 "管理工具 Go CLI"
- 端口 `业务端口: 9002` → `业务端口: 7094` + `管理端口: 7093`
- 部署架构图移除 Nginx，改为双端口直连

**`docs/api-reference.md`：**
- "业务 API 运行在端口 9002" → "业务 API 运行在端口 7094"
- "管理 API 运行在端口 9002" → "管理 API 运行在端口 7093"
- 所有 curl 示例中 `server:9002` → `server:7094`（业务）或 `server:7093`（管理）

**`docs/frontend-design.md`：** 移除或重命名为 `docs/frontend-design-archived.md`

**`docs/screenshots/`：** 移除 login.svg、dashboard.svg、users.svg、sign.svg

#### 后端子模块 `backend/docs/`

**`backend/docs/index.html`：**
- 配置示例中 `port: 9002` → `api_port: 7094` + `admin_port: 7093`
- 健康检查示例 `localhost:9002` → `localhost:7093`
- 路由配置中标注两个端口分属
- 增加 Admin CLI 说明段落

**`backend/docs/api.yaml`：**
- OpenAPI server URL 端口更新

**`backend/docs/api.md`：**
- 所有端口引用更新

#### 客户端子模块 `client/docs/`

**`client/docs/index.html`：**
- 默认 server 地址从 9002 更新为 7094
- 如有 CLI 使用说明，补充新增的子命令

---

## 3. 实施 TODO

### 阶段一：后端端口拆分
- [x] 修改 `backend/internal/config/config.go`：`Port` → `ApiPort` + `AdminPort`
- [x] 修改 `backend/config.yaml`：`port: 9002` → `api_port: 7094` + `admin_port: 7093`
- [x] 修改 `backend/cmd/server/main.go`：双 Fiber 实例，双端口监听
- [x] 验证双端口启动正常

### 阶段二：Admin CLI（核心替代前端）
- [x] 在 `backend/` 中引入 `cobra` CLI 框架依赖
- [x] 创建 `backend/cmd/admin/main.go` 入口
- [x] 实现 `user list` / `user get` / `user delete` / `user status` 子命令
- [x] 实现 `key list` / `key delete` 子命令
- [x] 实现 `log list` / `log export` 子命令
- [x] 实现 `stats` / `health` 子命令
- [x] 添加 `--server` 全局选项（默认 `http://localhost:7093`）和表格输出格式化
- [x] 更新 `Makefile`，添加 `build-admin` 目标

### 阶段三：Server CLI 增强
- [x] 保持现有 main.go 向后兼容（无需 cobra 化，当前实现已满足需求）

### 阶段四：Client CLI 增强
- [x] 修改默认 `--server` 地址为 `http://127.0.0.1:7094`

### 阶段五：Docker 和 CI/CD 简化
- [x] 简化 `docker/Dockerfile`，移除 Node.js 阶段和 Nginx，双阶段构建（Go builder + Alpine runtime）
- [x] 更新 `docker-compose.yml`，暴露 7093 + 7094 端口
- [x] 更新 `.github/workflows/release.yml`，更新 Release Notes 中的端口和部署说明

### 阶段六：端口引用全量替换 + 移除前端
- [x] 替换 `scripts/test_*.sh` 中的 9002
- [x] 重写 `README.md`（移除前端截图、更新端口、更新 Docker 架构图、增加 Admin CLI 使用说明）
- [x] 更新 `CLAUDE.md` 中的端口说明，移除前端章节，增加 Admin CLI 章节
- [x] 移除 `frontend/` 目录

### 阶段七：GitHub Pages 文档同步更新
- [x] 更新 `docs/index.html`（移除 React badge/技术栈，更新架构图，端口 7093/7094）
- [x] 更新 `docs/architecture.md`（架构图、端口、技术栈表格，移除 Nginx 层）
- [x] 更新 `docs/api-reference.md`（端口号和 curl 示例）
- [x] 更新 `backend/docs/index.html`（端口号、双端口配置示例、路由注释）
- [x] 更新 `backend/docs/api.yaml`（server URL 拆分为两条）
- [x] 更新 `backend/docs/api.md`（端口说明）
- [x] 更新 `client/docs/index.html`（默认 server 地址 7094）
- [x] 更新 `client/docs/TECH_NOTES.md`（端口引用）

---

## 4. 影响评估

| 方面 | 影响 |
|------|------|
| **文件变动量** | 新增 ~5 个 Go 文件，修改 ~20 个文件（含文档），移除 ~25 个前端文件 |
| **依赖变化** | 后端新增 `cobra`（CLI 框架）+ `tablewriter`（表格输出） |
| **API 变化** | 无，HTTP API 保持不变，只是端口拆分 |
| **协议变化** | 无，SM2 协同签名协议不受影响 |
| **向后兼容** | 端口从 9002 变为 7093/7094，**不向后兼容**（需更新所有客户端配置） |
| **Docker 镜像** | 体积减小约 50%，结构简化 |
| **GitHub Pages** | 三个仓库的文档页面均需同步更新 |

---

## 5. 子模块提交顺序

由于 backend/ 和 client/ 是子模块，修改必须按以下顺序提交：

```
1. backend/ 子模块 → 提交端口拆分 + Admin CLI → push
2. client/ 子模块 → 提交默认端口修改 + 新子命令 → push
3. 主仓库 → 更新子模块引用 + 移除 frontend/ + 更新 docs/ + 更新 Docker/CI → push
```

---

## 6. 风险和注意事项

1. **前端移除需确认**：移除前端后，所有管理操作只能通过 CLI 完成
2. **端口变更影响大**：9002→7093/7094 是破坏性变更，现有部署需要更新配置
3. **Admin CLI 认证**：当前 `/mapi/*` 无认证中间件，CLI 化后建议考虑添加
4. **子模块工作流**：必须严格按顺序提交（backend → client → 主仓库）
5. **日志导出**：前端的 CSV 导出是客户端 JS 实现的，CLI 版本需要重新实现
6. **GitHub Pages**：三个仓库的文档页面需要同步更新，避免文档和代码不一致
