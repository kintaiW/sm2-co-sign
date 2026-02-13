import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Space, Tag, Popconfirm, message, Drawer, Descriptions, Input, Spin } from 'antd'
import { DeleteOutlined, EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { keyApi } from '@/api/key'
import { KeyInfo } from '@/types'
import { formatDateTime, truncateString } from '@/utils'
import styles from './index.module.less'

const KeysPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [keys, setKeys] = useState<KeyInfo[]>([])
  const [searchText, setSearchText] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<KeyInfo | null>(null)

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    setLoading(true)
    try {
      const data = await keyApi.getList()
      setKeys(data)
    } catch (error) {
      message.error('获取密钥列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await keyApi.delete(id)
      message.success('删除成功')
      fetchKeys()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const handleView = (record: KeyInfo) => {
    setSelectedKey(record)
    setDrawerOpen(true)
  }

  const filteredKeys = keys.filter(
    (key) =>
      key.id.toLowerCase().includes(searchText.toLowerCase()) ||
      key.userId.toLowerCase().includes(searchText.toLowerCase()) ||
      key.publicKey.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: '密钥ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 200,
      ellipsis: true,
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
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
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
      render: (_: unknown, record: KeyInfo) => (
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
            title="确定要删除此密钥吗？"
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
    <div className={styles.keysPage}>
      <Card
        title="密钥管理"
        extra={
          <Space>
            <Input
              placeholder="搜索密钥"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={fetchKeys}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredKeys}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Drawer
        title="密钥详情"
        placement="right"
        width={500}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedKey && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="密钥ID">{selectedKey.id}</Descriptions.Item>
            <Descriptions.Item label="用户ID">{selectedKey.userId}</Descriptions.Item>
            <Descriptions.Item label="公钥">
              <div className={styles.publicKey}>{selectedKey.publicKey}</div>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedKey.status === 1 ? 'green' : 'red'}>
                {selectedKey.status === 1 ? '启用' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatDateTime(selectedKey.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default KeysPage
