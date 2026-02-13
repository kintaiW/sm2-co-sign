# SM2 协同签名系统 API 参考文档

## 目录

- [1. 概述](#1-概述)
- [2. 业务 API](#2-业务-api)
- [3. 管理 API](#3-管理-api)
- [4. 错误码](#4-错误码)
- [5. 安全规范](#5-安全规范)

---

## 1. 概述

### 1.1 通信协议

- **协议**: HTTP/1.1
- **编码**: UTF-8
- **数据格式**: JSON
- **加密**: TLS 1.2+ (生产环境)

### 1.2 认证方式

业务 API 使用 Bearer Token 认证：

```http
Authorization: Bearer <token>
```

### 1.3 响应格式

成功响应：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

错误响应：

```json
{
  "code": <错误码>,
  "message": "<错误描述>",
  "data": null
}
```

---

## 2. 业务 API

业务 API 运行在 **端口 9002**

### 2.1 用户注册

**接口**: `POST /api/register`

**描述**: 用户注册并生成协同密钥对

**认证**: 无

**请求体**:

```json
{
  "username": "user001",
  "password": "password123",
  "p1": "base64_encoded_p1"
}
```

**字段说明**:
- `username`: 用户名，唯一标识
- `password`: 用户密码
- `p1`: 客户端临时公钥 P1 = d1×G，Base64 编码

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": "uuid-string",
    "p2": "base64_encoded_p2",
    "pa": "base64_encoded_pa"
  }
}
```

### 2.2 获取登录挑战

**接口**: `POST /api/challenge`

**描述**: 获取登录挑战随机数

**认证**: 无

**请求体**:

```json
{
  "username": "user001"
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "challenge": "base64_encoded_challenge"
  }
}
```

### 2.3 用户登录

**接口**: `POST /api/login`

**描述**: 用户登录获取 Token

**认证**: 无

**请求体**:

```json
{
  "username": "user001",
  "password": "password123",
  "signature": "base64_encoded_signature"
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "jwt_token_string",
    "userId": "uuid-string",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

### 2.4 用户登出

**接口**: `POST /api/logout`

**描述**: 用户登出，失效 Token

**认证**: Bearer Token

**响应示例**:

```json
{
  "code": 0,
  "message": "success"
}
```

### 2.5 初始化密钥生成

**接口**: `POST /api/key/init`

**描述**: 初始化新的密钥生成流程

**认证**: Bearer Token

**请求体**:

```json
{
  "p1": "base64_encoded_p1"
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "p2": "base64_encoded_p2",
    "pa": "base64_encoded_pa"
  }
}
```

### 2.6 确认密钥生成

**接口**: `POST /api/key/confirm`

**描述**: 确认密钥生成完成

**认证**: Bearer Token

**响应示例**:

```json
{
  "code": 0,
  "message": "success"
}
```

### 2.7 协同签名

**接口**: `POST /api/sign`

**描述**: 执行协同签名

**认证**: Bearer Token

**请求体**:

```json
{
  "q1": "base64_encoded_q1",
  "e": "base64_encoded_e"
}
```

**字段说明**:
- `q1`: 临时点 Q1 = k1×G，Base64 编码
- `e`: 消息摘要 SM3(message)，Base64 编码

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "r": "base64_encoded_r",
    "s2": "base64_encoded_s2",
    "s3": "base64_encoded_s3"
  }
}
```

### 2.8 协同解密

**接口**: `POST /api/decrypt`

**描述**: 执行协同解密

**认证**: Bearer Token

**请求体**:

```json
{
  "t1": "base64_encoded_t1"
}
```

**字段说明**:
- `t1`: 客户端计算结果 T1 = d1×C1，Base64 编码

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "t2": "base64_encoded_t2"
  }
}
```

### 2.9 获取用户信息

**接口**: `GET /api/user/info`

**描述**: 获取当前登录用户信息

**认证**: Bearer Token

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "uuid-string",
    "username": "user001",
    "publicKey": "base64_encoded_public_key",
    "status": 1,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 3. 管理 API

管理 API 运行在 **端口 9002**，路径前缀 `/mapi`

### 3.1 用户管理

#### 获取用户列表

**接口**: `GET /mapi/users`

**认证**: Bearer Token (管理员)

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "uuid-string",
      "username": "user001",
      "publicKey": "base64_encoded_public_key",
      "status": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 获取用户详情

**接口**: `GET /mapi/users/{id}`

**认证**: Bearer Token (管理员)

#### 删除用户

**接口**: `DELETE /mapi/users/{id}`

**认证**: Bearer Token (管理员)

#### 更新用户状态

**接口**: `PUT /mapi/users/{id}/status`

**认证**: Bearer Token (管理员)

**请求体**:

```json
{
  "status": 0
}
```

### 3.2 密钥管理

#### 获取密钥列表

**接口**: `GET /mapi/keys`

**认证**: Bearer Token (管理员)

#### 删除密钥

**接口**: `DELETE /mapi/keys/{id}`

**认证**: Bearer Token (管理员)

### 3.3 审计日志

#### 查询审计日志

**接口**: `GET /mapi/logs`

**认证**: Bearer Token (管理员)

**查询参数**:
- `userId`: 用户 ID (可选)
- `action`: 操作类型 (可选)
- `limit`: 返回数量限制 (可选)

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": "uuid-string",
      "action": "sign",
      "details": "Signature generated",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 3.4 系统监控

#### 健康检查

**接口**: `GET /mapi/health`

**认证**: 无

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### 系统统计

**接口**: `GET /mapi/stats`

**认证**: Bearer Token (管理员)

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userCount": 100,
    "keyCount": 150,
    "activeSessions": 10,
    "uptime": 86400
  }
}
```

---

## 4. 错误码

| 错误码 | 描述 | HTTP 状态码 |
|--------|------|-------------|
| 0 | 成功 | 200 |
| 10001 | 用户名已存在 | 400 |
| 10002 | 用户名或密码错误 | 401 |
| 10003 | Token 无效或已过期 | 401 |
| 10004 | 权限不足 | 403 |
| 10005 | 参数错误 | 400 |
| 10006 | 密钥生成失败 | 500 |
| 10007 | 签名失败 | 500 |
| 10008 | 解密失败 | 500 |
| 10009 | 内部服务器错误 | 500 |

### 错误响应示例

```json
{
  "code": 10003,
  "message": "Token 无效或已过期",
  "data": null
}
```

---

## 5. 安全规范

### 5.1 请求头规范

所有请求必须包含以下 HTTP 头：

```http
Content-Type: application/json
Authorization: Bearer <token>
```

### 5.2 敏感数据处理

- 所有二进制数据使用 Base64 编码
- 日志中不记录敏感信息（私钥、Token、密码等）
- 生产环境必须使用 HTTPS

### 5.3 限流策略

| API | 限制 |
|-----|------|
| 业务 API | 1000 req/min per user |
| 管理 API | 100 req/min per admin |
| 登录 API | 10 req/min per IP |

超出限制返回 HTTP 429 Too Many Requests

---

## 附录：API 调用示例

### 示例 1: 完整的注册和签名流程

```bash
# 1. 用户注册
curl -X POST https://server:9002/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user001",
    "password": "password123",
    "p1": "base64_p1_value"
  }'

# 2. 获取登录挑战
curl -X POST https://server:9002/api/challenge \
  -H "Content-Type: application/json" \
  -d '{"username": "user001"}'

# 3. 用户登录
curl -X POST https://server:9002/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user001",
    "password": "password123",
    "signature": "base64_signature"
  }'

# 4. 协同签名
curl -X POST https://server:9002/api/sign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "q1": "base64_q1",
    "e": "base64_e"
  }'
```

### 示例 2: 使用 Rust 客户端

```rust
use sm2_co_sign_client::Sm2CoSignClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Sm2CoSignClient::new("https://localhost:9002");
    
    // 注册
    let (user_id, pa) = client.register("user001", "password123").await?;
    
    // 登录
    let token = client.login("user001", "password123").await?;
    
    // 签名
    let message = b"Hello World";
    let signature = client.sign(&token, message).await?;
    
    println!("Signature: {:?}", signature);
    Ok(())
}
```

---

## 许可证

Apache License 2.0
