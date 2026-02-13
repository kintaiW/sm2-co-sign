import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useUserStore } from '@/stores'
import styles from './index.module.less'

interface LoginForm {
  username: string
  password: string
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setToken, setUserInfo } = useUserStore()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const response = await authApi.login(values)
      setToken(response.token)
      setUserInfo(response.userId, values.username, 'user')
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.backgroundOverlay} />
      </div>
      <Card className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>SM2 协同签名服务</h1>
          <p className={styles.subtitle}>管理后台</p>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.footer}>
          <p className={styles.copyright}>
            技术支持：
            <a 
              href="https://github.com/kintaiW" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              kintaiW
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
