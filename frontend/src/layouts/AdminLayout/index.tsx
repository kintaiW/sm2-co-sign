import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Button, theme } from 'antd'
import {
  DashboardOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import { useUserStore, useAppStore } from '@/stores'
import styles from './AdminLayout.module.less'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/keys',
    icon: <KeyOutlined />,
    label: '密钥管理',
  },
  {
    key: '/sign',
    icon: <SafetyCertificateOutlined />,
    label: '签名服务',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/logs',
    icon: <FileTextOutlined />,
    label: '操作日志',
  },
]

const AdminLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()
  const { username, logout } = useUserStore()
  const { collapsed, setCollapsed } = useAppStore()
  const [selectedKey, setSelectedKey] = useState(location.pathname)

  const handleMenuClick = (key: string) => {
    setSelectedKey(key)
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className={styles.layout}>
      <Sider trigger={null} collapsible collapsed={collapsed} className={styles.sider}>
        <div className={styles.logo}>
          <KeyOutlined className={styles.logoIcon} />
          {!collapsed && <span className={styles.logoText}>SM2 协同签名</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
        <div className={styles.footer}>
          <a 
            href="https://github.com/kintaiW" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.githubLink}
          >
            <GithubOutlined />
            {!collapsed && <span>kintaiW</span>}
          </a>
        </div>
      </Sider>
      <Layout>
        <Header className={styles.header} style={{ background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={styles.trigger}
          />
          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className={styles.userInfo}>
                <Avatar icon={<UserOutlined />} size="small" />
                <span className={styles.username}>{username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className={styles.content}
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
