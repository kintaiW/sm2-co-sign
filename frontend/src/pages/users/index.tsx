import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Space, Tag, Popconfirm, message, Drawer, Descriptions, Input, Spin, Switch } from 'antd'
import { DeleteOutlined, EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { userApi } from '@/api/user'
import { UserInfo } from '@/types'
import { formatDateTime, truncateString } from '@/utils'
import styles from './index.module.less'

const UsersPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserInfo[]>([])
  const [searchText, setSearchText] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await userApi.getList()
      setUsers(data)
    } catch (error) {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await userApi.delete(id)
      message.success('删除成功')
      fetchUsers()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const handleStatusChange = async (id: string, status: boolean) => {
    setUpdatingStatus(id)
    try {
      await userApi.updateStatus(id, status ? 1 : 0)
      message.success('状态更新成功')
      fetchUsers()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '状态更新失败')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleView = (record: UserInfo) => {
    setSelectedUser(record)
    setDrawerOpen(true)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.id.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.publicKey.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '公钥',
      dataIndex: 'publicKey',
      key: 'publicKey',
      ellipsis: true,
      render: (text: string) => truncateString(text, 40),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number, record: UserInfo) => (
        <Switch
          checked={status === 1}
          loading={updatingStatus === record.id}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => formatDateTime(text),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: UserInfo) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除此用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.usersPage}>
      <Card
        title="用户管理"
        extra={
          <Space>
            <Input
              placeholder="搜索用户"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Drawer
        title="用户详情"
        placement="right"
        width={500}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="用户ID">{selectedUser.id}</Descriptions.Item>
            <Descriptions.Item label="用户名">{selectedUser.username}</Descriptions.Item>
            <Descriptions.Item label="公钥">
              <div className={styles.publicKey}>{selectedUser.publicKey}</div>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedUser.status === 1 ? 'green' : 'red'}>
                {selectedUser.status === 1 ? '启用' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatDateTime(selectedUser.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default UsersPage
