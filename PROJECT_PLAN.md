# SM2 协同签名项目实施计划

## 一、项目概述

SM2 协同签名系统是一个基于国密 SM2 椭圆曲线算法的协同签名解决方案。系统采用客户端-服务端分离架构，通过密钥分片技术实现私钥的安全存储和协同签名。

### 核心特性

- **密钥分片**: 私钥分为 D1（客户端）和 D2（服务端）两部分，完整私钥永不出现
- **协同签名**: 客户端与服务端协同完成签名计算
- **协同解密**: 支持 SM2 密文的协同解密
- **多平台支持**: 客户端支持 Windows/Linux 动态库

---

## 二、系统架构

### 2.1 仓库结构

```
sm2-co-sign/                    # 主仓库
├── backend/                    # 服务端 Submodule (Go)
│   ├── cmd/server/            # 入口程序
│   ├── internal/              # 内部模块
│   │   ├── config/           # 配置管理
│   │   ├── crypto/           # SM2 协同算法
│   │   ├── repository/       # 数据访问层
│   │   └── service/          # 业务逻辑层
│   ├── pkg/                   # 公共包
│   ├── docs/                  # API 文档
│   └── data/                  # SQLite 数据库
├── client/                     # 客户端 Submodule (Rust)
│   ├── sm2_co_sign_core/      # 核心协议库
│   ├── sm2_co_sign_cli/       # 命令行工具
│   ├── sm2_co_sign_ffi/       # FFI 接口
│   └── tests/                 # 集成测试
├── frontend/                   # Web 管理界面 (React)
│   ├── src/                   # 源代码
│   │   ├── components/       # UI 组件
│   │   ├── pages/            # 页面
│   │   ├── stores/           # 状态管理
│   │   └── utils/            # 工具函数
│   └── dist/                  # 构建产物
├── docs/                       # 技术文档
│   ├── architecture.md        # 架构文档
│   ├── api-reference.md       # API 参考
│   └── index.html             # GitHub Pages
└── scripts/                    # 测试脚本
```

### 2.2 技术栈

| 组件 | 技术栈 | 版本 |
|------|--------|------|
| **服务端** | Go + Fiber v2 | Go 1.24 |
| **客户端** | Rust + libsm | Rust 2021 |
| **前端** | React + Ant Design | React 18 |
| **数据库** | SQLite | 纯 Go 实现 |
| **密码算法** | gmsm / libsm | SM2/SM3/SM4 |

---

## 三、核心协议流程

### 3.1 密钥生成流程

```
客户端                                服务端
  |                                     |
  |-- 1. 生成 d1 (随机数)               |
  |-- 2. 计算 P1 = d1 * G              |
  |                                     |
  |--- POST /api/register {p1} ------->|
  |                                     |-- 3. 生成 d2 (随机数)
  |                                     |-- 4. 计算 d2Inv = d2^(-1) mod n
  |                                     |-- 5. 计算 P2 = d2Inv * G
  |                                     |-- 6. 计算 Pa = d2Inv * P1 + (n-1) * G
  |                                     |-- 7. 存储 (userId, d2, d2Inv, Pa)
  |<--- {userId, p2, pa} --------------|
  |                                     |
  |-- 8. 计算 d = d1 * d2 - 1           |
  |-- 9. 存储本地 (d1, userId, pa)      |
```

### 3.2 协同签名流程

```
客户端                                服务端
  |                                     |
  |-- 1. 计算消息哈希 E = SM3(M)        |
  |-- 2. 生成随机数 k1                  |
  |-- 3. 计算 Q1 = k1 * G              |
  |                                     |
  |--- POST /api/sign {q1, e} --------->|
  |                                     |-- 4. 生成随机数 k2, k3
  |                                     |-- 5. 计算 Q2 = k2 * G
  |                                     |-- 6. 计算 x1 = k3 * Q1 + Q2
  |                                     |-- 7. 计算 r = (E + x1) mod n
  |                                     |-- 8. 计算 s2 = d2Inv * k3 mod n
  |                                     |-- 9. 计算 s3 = d2Inv * (r + k2) mod n
  |<--- {r, s2, s3} -------------------|
  |                                     |
  |-- 10. 计算 s1 = k1 * s3 - r * d1    |
  |-- 11. 计算 s = s1 * s2 mod n        |
  |-- 12. 最终签名 (r, s)               |
```

### 3.3 协同解密流程

```
客户端                                服务端
  |                                     |
  |-- 1. 解析密文 C1||C3||C2            |
  |-- 2. 计算 T1 = d1 * C1             |
  |                                     |
  |--- POST /api/decrypt {t1} --------->|
  |                                     |-- 3. 计算 T2 = d2Inv * T1
  |<--- {t2} ---------------------------|
  |                                     |
  |-- 4. 计算 K = SM3(T2)              |
  |-- 5. 解密明文 M = C2 XOR K         |
```

---

## 四、API 接口

### 4.1 业务接口 (/api/*)

| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/register` | POST | 用户注册（生成密钥对） | 无 |
| `/api/challenge` | POST | 获取登录挑战随机数 | 无 |
| `/api/login` | POST | 用户登录（获取 Token） | 无 |
| `/api/logout` | POST | 用户登出 | Bearer Token |
| `/api/key/init` | POST | 初始化密钥生成 | Bearer Token |
| `/api/key/confirm` | POST | 确认密钥生成 | Bearer Token |
| `/api/sign` | POST | 协同签名 | Bearer Token |
| `/api/decrypt` | POST | 协同解密 | Bearer Token |
| `/api/user/info` | GET | 获取用户信息 | Bearer Token |

### 4.2 管理接口 (/mapi/*)

| 接口 | 方法 | 描述 |
|------|------|------|
| `/mapi/users` | GET | 获取用户列表 |
| `/mapi/users/{id}` | GET | 获取用户详情 |
| `/mapi/users/{id}` | DELETE | 删除用户 |
| `/mapi/users/{id}/status` | PUT | 更新用户状态 |
| `/mapi/keys` | GET | 获取密钥列表 |
| `/mapi/keys/{id}` | DELETE | 删除密钥 |
| `/mapi/logs` | GET | 查询审计日志 |
| `/mapi/health` | GET | 健康检查 |
| `/mapi/stats` | GET | 系统统计 |

---

## 五、项目里程碑

### 里程碑 1: 基础架构 ✅

- [x] 主仓库初始化
- [x] 服务端 submodule 创建
- [x] 客户端 submodule 创建
- [x] 前端项目创建
- [x] .gitmodules 配置

### 里程碑 2: 核心功能实现 ✅

- [x] 服务端 SM2 协同签名实现
- [x] 服务端 SM2 协同解密实现
- [x] 客户端 Rust 核心库实现
- [x] 客户端 FFI 接口实现
- [x] 用户认证系统

### 里程碑 3: Web 管理界面 ✅

- [x] 用户管理页面
- [x] 密钥管理页面
- [x] 审计日志页面
- [x] 系统监控页面

### 里程碑 4: 文档完善 ✅

- [x] 架构文档
- [x] API 文档
- [x] GitHub Pages
- [x] README 更新

---

## 六、安全机制

### 6.1 密钥保护

| 密钥 | 存储位置 | 加密方式 | 长度 |
|------|---------|---------|------|
| D1 | 客户端 | 本地加密存储 | 32字节 |
| D2 | 服务端 | 主密钥加密 | 32字节 |
| D2Inv | 服务端 | 主密钥加密 | 32字节 |
| PA | 双方 | 明文 | 64字节 |

### 6.2 安全特性

- **密钥隔离**: 客户端持有 d1，服务端持有 d2，完整私钥 d = d1 * d2 - 1 不存储
- **传输安全**: 所有敏感数据使用 Base64 编码，生产环境必须使用 HTTPS
- **Token 认证**: 使用 Bearer Token 认证，Token 有过期时间
- **审计日志**: 所有关键操作记录审计日志

---

## 七、部署指南

### 7.1 克隆仓库

```bash
git clone --recursive https://github.com/kintaiW/sm2-co-sign.git
cd sm2-co-sign
```

### 7.2 启动服务端

```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

### 7.3 构建客户端

```bash
cd client
cargo build --release
```

### 7.4 启动前端

```bash
cd frontend
npm install
npm run dev
```

---

## 八、许可证

Apache License 2.0
