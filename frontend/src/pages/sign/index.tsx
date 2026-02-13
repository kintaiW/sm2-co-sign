import React, { useState } from 'react'
import { Card, Form, Input, Button, message, Space, Alert, Divider, Typography } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import { signApi } from '@/api/sign'
import styles from './index.module.less'

const { TextArea } = Input
const { Text } = Typography

const SignPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    r: string
    s2: string
    s3: string
  } | null>(null)

  const onFinish = async (values: { q1: string; e: string }) => {
    setLoading(true)
    try {
      const response = await signApi.sign(values)
      setResult(response)
      message.success('签名成功')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '签名失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    setResult(null)
  }

  return (
    <div className={styles.signPage}>
      <Card title="签名服务" extra={<SafetyCertificateOutlined />}>
        <Alert
          message="签名说明"
          description="请输入客户端生成的 Q1 点（Base64 编码）和消息哈希 E（Base64 编码），服务端将返回签名分量 r、s2、s3。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="q1"
            label="Q1 点（Base64 编码）"
            rules={[{ required: true, message: '请输入 Q1 点' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入客户端生成的 Q1 点（Base64 编码）"
            />
          </Form.Item>

          <Form.Item
            name="e"
            label="消息哈希 E（Base64 编码）"
            rules={[{ required: true, message: '请输入消息哈希' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入消息哈希 E（Base64 编码）"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                执行签名
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {result && (
          <>
            <Divider>签名结果</Divider>
            <div className={styles.resultSection}>
              <div className={styles.resultItem}>
                <Text strong>r（签名分量）</Text>
                <div className={styles.resultValue}>
                  <Text copyable={{ text: result.r }}>{result.r}</Text>
                </div>
              </div>
              <div className={styles.resultItem}>
                <Text strong>s2（签名分量）</Text>
                <div className={styles.resultValue}>
                  <Text copyable={{ text: result.s2 }}>{result.s2}</Text>
                </div>
              </div>
              <div className={styles.resultItem}>
                <Text strong>s3（签名分量）</Text>
                <div className={styles.resultValue}>
                  <Text copyable={{ text: result.s3 }}>{result.s3}</Text>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      <div className={styles.footer}>
        <p>
          技术支持：
          <a href="https://github.com/kintaiW" target="_blank" rel="noopener noreferrer">
            kintaiW (黄鑫泰)
          </a>
          - SM2 协同签名服务
        </p>
      </div>
    </div>
  )
}

export default SignPage
