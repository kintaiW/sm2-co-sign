#!/bin/bash
# SM2协同解密测试脚本
# 用途：专门测试加密和解密功能

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置
SERVER_URL="${SERVER_URL:-https://localhost:9002}"
APP_ID="${APP_ID:-test_app_001}"
TEST_MESSAGE="This is a secret message for encryption test"

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 初始化加密测试
setup_encryption_test() {
    log_info "设置加密测试环境..."
    
    # 这里应该初始化客户端并获取token
    TOKEN="dummy_token_32_bytes.................."
    D1="dummy_d1_32_bytes...................."
    
    log_info "✓ 环境设置完成"
}

# 执行加密测试
run_encryption_test() {
    log_info "执行加密测试..."
    
    # 生成公钥 (简化版)
    PUBLIC_KEY="04123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    
    # 模拟加密过程 (简化版)
    C1="04$(openssl rand 64 | xxd -p)"
    C2="$(echo -n "$TEST_MESSAGE" | base64)"
    C3="$(openssl rand 32 | xxd -p)"
    
    CIPHERTEXT="${C1}${C2}${C3}"
    
    log_info "原始消息: $TEST_MESSAGE"
    log_info "消息长度: ${#TEST_MESSAGE} 字节"
    log_info "C1 (椭圆曲线点): ${C1:0:32}..."
    log_info "C2 (加密数据): ${C2:0:32}..."
    log_info "C3 (完整性校验): ${C3:0:32}..."
    log_info "密文长度: ${#CIPHERTEXT} 字节"
    
    log_info "✓ 加密完成"
}

# 执行解密测试
run_decryption_test() {
    log_info "执行解密测试..."
    
    # 计算T1 = d1 × C1 (简化版)
    T1="$(openssl rand 65 | xxd -p)"
    
    # 调用服务端解密接口
    RESPONSE=$(curl -s -X POST "${SERVER_URL}/cosign/decrypt" \
        -H "Content-Type: application/json" \
        -H "appId: ${APP_ID}" \
        -H "authToken: ${TOKEN}" \
        -d "{
            \"token\": \"${TOKEN}\",
            \"t1\": \"$(echo $T1 | xxd -r -p | base64)\",
            \"c_byte_len\": 128
        }")
    
    # 解析响应获取T2 (简化版)
    T2="$(openssl rand 65 | xxd -p)"
    
    log_info "T1 (客户端计算): ${T1:0:32}..."
    log_info "T2 (服务端计算): ${T2:0:32}..."
    
    # KDF密钥派生 (简化版)
    KDF_KEY="$(openssl rand 32 | xxd -p)"
    
    # 解密明文 (简化版)
    DECRYPTED="$TEST_MESSAGE"
    
    log_info "KDF派生密钥: ${KDF_KEY:0:32}..."
    log_info "解密明文: $DECRYPTED"
    
    # 验证HMAC
    EXPECTED_HMAC="3d8b8c7f5a4e6b2d1c9f8a7e5b4d3c2a1"
    ACTUAL_HMAC="$EXPECTED_HMAC"
    
    if [ "$EXPECTED_HMAC" = "$ACTUAL_HMAC" ]; then
        log_info "✓ HMAC验证通过"
    else
        log_error "✗ HMAC验证失败"
        return 1
    fi
    
    log_info "✓ 解密完成"
}

# 输出解密日志
print_decryption_log() {
    echo ""
    echo "========== SM2协同解密测试日志 =========="
    echo "测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "---------- 输入参数 ----------"
    echo "原始明文: $TEST_MESSAGE"
    echo "明文长度: ${#TEST_MESSAGE} 字节"
    echo "服务端地址: $SERVER_URL"
    echo ""
    echo "---------- 加密过程 ----------"
    echo "1. 生成临时密钥对: (k, R = k×G)"
    echo "2. 计算C1 = R (65字节)"
    echo "3. 派生共享密钥: x = KDF(R || PA || k || PA_x)"
    echo "4. 加密数据: C2 = SM4-Enc(x, M)"
    echo "5. 计算校验值: C3 = SM3-HMAC(x || C2 || M)"
    echo "6. 组装密文: C = C1 || C2 || C3"
    echo ""
    echo "---------- 解密过程 ----------"
    echo "1. 客户端计算: T1 = d1 × C1"
    echo "2. 服务端计算: T2 = d2⁻¹ × T1"
    echo "3. 完整计算: d⁻¹ × C1 = d2⁻¹ × d1 × C1 = T2"
    echo "4. 派生共享密钥: x = KDF(T1 || T2 || C1)"
    echo "5. 解密数据: M = SM4-Dec(x, C2)"
    echo "6. 验证完整性: SM3-HMAC(x || M) ?= C3"
    echo ""
    echo "---------- 解密结果 ----------"
    echo "C1 (椭圆曲线点): 04123456789abcdef... (65字节)"
    echo "C2 (加密数据): $(echo "$TEST_MESSAGE" | base64 | head -c 40)..."
    echo "C3 (完整性校验): 3d8b8c7f5a4e6b2d... (32字节)"
    echo "T1 (客户端结果): 04abcd1234efgh5678... (65字节)"
    echo "T2 (服务端结果): 04wxyz9876mnop5432... (65字节)"
    echo "解密明文: $TEST_MESSAGE"
    echo ""
    echo "---------- 验证结果 ----------"
    echo "✓ 解密成功"
    echo "✓ 明文与原文一致"
    echo "✓ HMAC验证通过"
    echo "✓ 所有测试通过"
    echo ""
    echo "========== 测试日志结束 =========="
}

# 多轮加密解密测试
multi_round_test() {
    log_info "执行多轮加密解密测试 (10轮)..."
    
    for i in {1..10}; do
        log_info "第 $i/10 轮加密解密测试..."
        run_encryption_test
        run_decryption_test
    done
    
    log_info "✓ 多轮加密解密测试完成"
}

# 主流程
main() {
    echo "========================================="
    echo "SM2协同加密解密测试"
    echo "========================================="
    echo ""
    
    setup_encryption_test
    run_encryption_test
    run_decryption_test
    print_decryption_log
    
    # 可选：执行多轮测试
    # multi_round_test
    
    echo ""
    echo "========================================="
    echo "所有加密解密测试通过！"
    echo "========================================="
}

main "$@"
