#!/bin/bash

# 集成测试脚本

set -e

echo "=== SM2 协同签名集成测试 ==="

# 测试配置
BASE_URL="http://localhost:9002"
APP_ID="test_app"
AUTH_TOKEN="test_token"
USERTAG="test_user"
APPTAG="test_app"
PIN="12345678"
HMAC_KEY="test_hmac_key_123456789012345678901234"

# 测试消息
TEST_MESSAGE="Hello, SM2 Co-Sign!"

# 测试步骤
echo "\n1. 测试初始化流程"
cargo run --example init -- "$BASE_URL" "$APP_ID" "$AUTH_TOKEN" "$USERTAG" "$APPTAG" "$HMAC_KEY"

echo "\n2. 测试密钥生成流程"
cargo run --example gen_key -- "$BASE_URL" "$APP_ID" "$AUTH_TOKEN" "$USERTAG" "$APPTAG" "$PIN"

echo "\n3. 测试签名验签流程"
cargo run --example sign_verify -- "$BASE_URL" "$APP_ID" "$AUTH_TOKEN" "$USERTAG" "$APPTAG" "$TEST_MESSAGE"

echo "\n4. 测试加密解密流程"
cargo run --example encrypt_decrypt -- "$BASE_URL" "$APP_ID" "$AUTH_TOKEN" "$USERTAG" "$APPTAG" "$TEST_MESSAGE"

echo "\n=== 集成测试完成 ==="
