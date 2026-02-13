# API参考文档

## 目录

- [1. 概述](#1-概述)
- [2. 管理API](#2-管理api)
- [3. 协同签名API](#3-协同签名api)
- [4. 错误码](#4-错误码)
- [5. 安全规范](#5-安全规范)

---

## 1. 概述

### 1.1 通信协议

- **协议**: HTTP/1.1 / HTTP/2
- **编码**: UTF-8
- **数据格式**: JSON
- **加密**: TLS 1.2+

### 1.2 认证方式

所有API请求需要包含以下认证头：

```http
appId: <应用标识符>
authToken: <认证令牌>
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

## 2. 管理API

管理API运行在 **Port 6001**

### 2.1 终端管理

#### 2.1.1 查询终端列表

**接口**: `GET /cosign/terminal/list`

**请求参数**:

```json
{
  "page": 1,
  "page_size": 20,
  "status": 1
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "terminals": [
      {
        "usertag": "user001",
        "apptag": "app001",
        "status": 1,
        "create_time": "2024-01-01 00:00:00",
        "last_access": "2024-01-01 12:00:00"
      }
    ]
  }
}
```

#### 2.1.2 查询单个终端

**接口**: `GET /cosign/terminal/{usertag}`

**路径参数**:
- `usertag`: 用户标识符

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "usertag": "user001",
    "apptag": "app001",
    "status": 1,
    "keys_count": 5,
    "create_time": "2024-01-01 00:00:00",
    "last_access": "2024-01-01 12:00:00"
  }
}
```

#### 2.1.3 删除终端

**接口**: `DELETE /cosign/terminal/{usertag}`

**路径参数**:
- `usertag`: 用户标识符

**响应示例**:

```json
{
  "code": 0,
  "message": "Terminal deleted successfully",
  "data": null
}
```

### 2.2 密钥管理

#### 2.2.1 查询密钥列表

**接口**: `GET /cosign/key/list`

**请求参数**:

```json
{
  "usertag": "user001",
  "apptag": "app001",
  "page": 1,
  "page_size": 20
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 10,
    "keys": [
      {
        "key_id": "key001",
        "public_key": "04123456789abcdef...",
        "algorithm": "SM2",
        "create_time": "2024-01-01 00:00:00",
        "status": 1
      }
    ]
  }
}
```

#### 2.2.2 查询密钥详情

**接口**: `GET /cosign/key/{key_id}`

**路径参数**:
- `key_id`: 密钥标识符

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "key_id": "key001",
    "public_key": "04123456789abcdef...",
    "algorithm": "SM2",
    "create_time": "2024-01-01 00:00:00",
    "last_used": "2024-01-01 12:00:00",
    "sign_count": 100,
    "status": 1
  }
}
```

#### 2.2.3 删除密钥

**接口**: `DELETE /cosign/key/{key_id}`

**路径参数**:
- `key_id`: 密钥标识符

**响应示例**:

```json
{
  "code": 0,
  "message": "Key deleted successfully",
  "data": null
}
```

### 2.3 证书管理

#### 2.3.1 上传证书

**接口**: `POST /cert/upload`

**请求参数**:

```json
{
  "cert": "-----BEGIN CERTIFICATE-----\nMIIC...",
  "cert_type": "SM2",
  "description": "Test certificate"
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "Certificate uploaded successfully",
  "data": {
    "cert_id": "cert001",
    "subject": "CN=test.example.com",
    "issuer": "CN=CA",
    "valid_from": "2024-01-01",
    "valid_to": "2025-01-01"
  }
}
```

#### 2.3.2 查询证书列表

**接口**: `GET /cert/list`

**请求参数**:

```json
{
  "page": 1,
  "page_size": 20
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 5,
    "certs": [
      {
        "cert_id": "cert001",
        "subject": "CN=test.example.com",
        "valid_to": "2025-01-01",
        "status": 1
      }
    ]
  }
}
```

### 2.4 系统操作

#### 2.4.1 健康检查

**接口**: `GET /cosign/system/health`

**响应示例**:

```json
{
  "code": 0,
  "message": "healthy",
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "uptime": 86400,
    "database": "connected",
    "crypto": "ok"
  }
}
```

#### 2.4.2 获取系统信息

**接口**: `GET /cosign/system/info`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "version": "1.0.0",
    "build_time": "2024-01-01 00:00:00",
    "git_commit": "abc123",
    "algorithms": ["SM2", "SM3", "SM4", "Kyber", "Dilithium"]
  }
}
```

---

## 3. 协同签名API

协同签名API运行在 **Port 9001/9002**

### 3.1 初始化与认证

#### 3.1.1 获取挑战随机数

**接口**: `POST /cosign/challenge`

**请求体**:

```json
{
  "usertag": "user001",
  "apptag": "app001"
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "challenge": "base64_encoded_challenge",
    "rhos": "base64_encoded_rhos"
  }
}
```

**字段说明**:
- `challenge`: 32字节随机数，用于挑战响应
- `rhos`: 32字节服务端随机数，用于后续计算

#### 3.1.2 终端初始化

**接口**: `POST /cosign/init`

**请求体**:

```json
{
  "usertag": "user001",
  "apptag": "app001",
  "hmac": "base64_encoded_hmac"
}
```

**字段说明**:
- `hmac`: HMAC(challenge, hmac_key)，32字节

**响应示例**:

```json
{
  "code": 0,
  "message": "Terminal initialized successfully",
  "data": {
    "token": "base64_encoded_token",
    "uid": "base64_encoded_uid"
  }
}
```

**字段说明**:
- `token`: 访问令牌，32字节，有效期30分钟
- `uid`: 唯一标识符，16字节

#### 3.1.3 获取访问权限

**接口**: `POST /cosign/access`

**请求体**:

```json
{
  "token": "base64_encoded_token",
  "pa": "base64_encoded_public_key",
  "hmac": "base64_encoded_hmac",
  "pa_len": 64,
  "srctoken": "base64_encoded_source_token"
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "Access granted",
  "data": {
    "token": "base64_encoded_new_token",
    "uid": "base64_encoded_uid",
    "tokentmk": "base64_encoded_tokentmk",
    "tokentmk_len": 32
  }
}
```

### 3.2 密钥生成

#### 3.2.1 生成协同密钥

**接口**: `POST /cosign/genkey`

**请求体**:

```json
{
  "token": "base64_encoded_token",
  "p1": "base64_encoded_temp_public_key",
  "hmac": "base64_encoded_hmac"
}
```

**字段说明**:
- `token`: 访问令牌
- `p1`: 客户端临时公钥 P1 = D1×G，65字节
- `hmac`: HMAC(pri, TMK)，用于验证私钥加密

**响应示例**:

```json
{
  "code": 0,
  "message": "Key generated successfully",
  "data": {
    "p2": "base64_encoded_p2",
    "hmac_len": 32
  }
}
```

**字段说明**:
- `p2`: 服务端临时公钥 P2 = D2×G，64字节压缩格式

### 3.3 协同签名

#### 3.3.1 执行协同签名

**接口**: `POST /cosign/sign`

**请求体**:

```json
{
  "token": "base64_encoded_token",
  "e": "base64_encoded_message_hash",
  "q1": "base64_encoded_temp_point"
}
```

**字段说明**:
- `token`: 访问令牌
- `e`: 消息摘要 SM3(message)，32字节
- `q1`: 临时点 Q1 = k×G，65字节

**响应示例**:

```json
{
  "code": 0,
  "message": "Signature generated successfully",
  "data": {
    "r": "base64_encoded_r",
    "s2": "base64_encoded_s2",
    "s3": "base64_encoded_s3"
  }
}
```

**字段说明**:
- `r`: 签名分量r，32字节
- `s2`: 签名分量s2，32字节，服务端计算
- `s3`: 签名分量s3，32字节，服务端计算

**客户端后续计算**:
```
s = k⁻¹ × (e + d1 × r) mod n
完整签名 = (r, s)
```

### 3.4 协同解密

#### 3.4.1 执行协同解密

**接口**: `POST /cosign/decrypt`

**请求体**:

```json
{
  "token": "base64_encoded_token",
  "t1": "base64_encoded_t1",
  "c_byte_len": 128
}
```

**字段说明**:
- `token`: 访问令牌
- `t1`: 客户端计算结果 T1 = d1×C1，65字节
- `c_byte_len`: 密文总长度

**响应示例**:

```json
{
  "code": 0,
  "message": "Decryption completed",
  "data": {
    "t2": "base64_encoded_t2",
    "tag": 1
  }
}
```

**字段说明**:
- `t2`: 服务端计算结果 T2 = d2⁻¹×T1，65字节
- `tag`: 标记位，用于后续处理

**客户端后续计算**:
```
x = KDF(T1 || T2 || C1)
M = SM4-Decrypt(x, C2)
验证: SM3-HMAC(x || M) ?= C3
```

### 3.5 随机数生成

#### 3.5.1 生成随机数

**接口**: `POST /cosign/random`

**请求体**:

```json
{
  "token": "base64_encoded_token",
  "len": 32
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "random": "base64_encoded_random",
    "len": 32
  }
}
```

---

## 4. 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|-----------|
| 0 | 成功 | 200 |
| 1 | 参数错误 | 400 |
| 2 | 认证失败 | 401 |
| 3 | 权限不足 | 403 |
| 4 | 资源不存在 | 404 |
| 5 | 操作冲突 | 409 |
| 10 | 数据库错误 | 500 |
| 11 | 密码学错误 | 500 |
| 12 | Token过期 | 401 |
| 13 | 签名验证失败 | 400 |
| 20 | 服务端错误 | 500 |

### 错误响应示例

```json
{
  "code": 12,
  "message": "Token has expired",
  "data": null
}
```

---

## 5. 安全规范

### 5.1 请求头规范

所有请求必须包含以下HTTP头：

```http
Content-Type: application/json
appId: <应用标识符>
authToken: <认证令牌>
X-Request-ID: <请求唯一标识>
X-Timestamp: <当前时间戳，秒>
```

### 5.2 签名验证

对于敏感操作，需要使用应用密钥对请求体进行签名：

```
signature = HMAC-SHA256(app_secret, request_body)
X-Signature: base64(signature)
```

### 5.3 时间戳验证

请求时间戳与服务器时间差不能超过 **5分钟**，否则拒绝请求。

### 5.4 重放攻击防护

- 使用 `X-Request-ID` 防止重放攻击
- 服务器缓存已处理的请求ID，有效期5分钟
- 检测到重复请求直接返回错误

### 5.5 敏感数据处理

- 所有敏感字段使用Base64编码
- 日志中不记录敏感信息（私钥、Token、密码等）
- 使用安全的HTTP客户端，验证TLS证书

### 5.6 限流策略

| API | 限制 |
|-----|------|
| 管理API | 100 req/min per IP |
| 协同签名API | 1000 req/min per token |
| 密钥生成 | 10 req/min per token |

超出限制返回 HTTP 429 Too Many Requests

---

## 附录：API调用示例

### 示例1: 完整的密钥生成流程

```bash
# 1. 获取挑战随机数
curl -X POST https://server:9002/cosign/challenge \
  -H "Content-Type: application/json" \
  -H "appId: app001" \
  -H "authToken: token123" \
  -d '{
    "usertag": "user001",
    "apptag": "app001"
  }'

# 2. 初始化终端
curl -X POST https://server:9002/cosign/init \
  -H "Content-Type: application/json" \
  -H "appId: app001" \
  -H "authToken: token123" \
  -d '{
    "usertag": "user001",
    "apptag": "app001",
    "hmac": "base64_hmac_value"
  }'

# 3. 生成密钥
curl -X POST https://server:9002/cosign/genkey \
  -H "Content-Type: application/json" \
  -H "appId: app001" \
  -H "authToken: token123" \
  -d '{
    "token": "base64_token",
    "p1": "base64_p1",
    "hmac": "base64_hmac"
  }'
```

### 示例2: 完整的签名流程

```bash
# 1. 计算消息摘要
e=$(echo -n "Hello World" | sm3sum | xxd -r -p | base64)

# 2. 生成随机数k
k=$(openssl rand 32 | base64)

# 3. 计算Q1 = k*G
q1=$(sm2_scalar_mult $k | base64)

# 4. 调用服务端签名
curl -X POST https://server:9002/cosign/sign \
  -H "Content-Type: application/json" \
  -H "appId: app001" \
  -H "authToken: token123" \
  -d "{
    \"token\": \"$(echo $token)\",
    \"e\": \"$(echo $e)\",
    \"q1\": \"$(echo $q1)\"
  }"

# 5. 客户端计算s
s=$(sm2_compute_s $k $d1 $r $s2 $s3 $e)

# 6. 组装签名
signature=$(echo "$r$s" | xxd -r -p)
```

### 示例3: 使用Rust客户端

```rust
use sm2_co_sign_client::Sm2CoSignClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut client = Sm2CoSignClient::new(
        "https://localhost:9002".to_string(),
        "app001".to_string(),
        "auth_token".to_string(),
    );
    
    // 初始化
    client.init("user001", "app001", &hmac_key).await?;
    
    // 生成密钥
    let (pri, tokenpri, pa) = client.generate_key("12345678", "app001").await?;
    
    // 签名
    let signature = client.sign(&token, &d1, message).await?;
    
    Ok(())
}
```
