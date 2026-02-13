import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Space, Input, Spin, message, Select, Tag } from 'antd'
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons'
import { logApi, LogQueryParams } from '@/api/log'
import { AuditLog } from '@/types'
import { formatDateTime } from '@/utils'
import styles from './index.module.less'

const LogsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [searchText, setSearchText] = useState('')
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params: LogQueryParams = { limit: 100 }
      if (actionFilter) {
        params.action = actionFilter
      }
      const data = await logApi.getList(params)
      setLogs(data)
    } catch (error) {
      message.error('获取日志列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['时间', '用户ID', '操作', '详情', 'IP地址'].join(','),
      ...filteredLogs.map((log) =>
        [
          formatDateTime(log.createdAt),
          log.userId || '',
          log.action || '',
          `"${log.detail || ''}"`,
          log.ipAddress || '',
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    message.success('导出成功')
  }

  const filteredLogs = logs.filter(
    (log) =>
      (log.userId || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (log.detail || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (log.ipAddress || '').toLowerCase().includes(searchText.toLowerCase())
  )

  const getActionColor = (action: string): string => {
    const colorMap: Record<string, string> = {
      login: 'green',
      logout: 'orange',
      sign: 'blue',
      key_init: 'purple',
      key_delete: 'red',
      user_delete: 'red',
      user_status: 'gold',
      register: 'cyan',
      decrypt: 'geekblue',
    }
    return colorMap[action] || 'default'
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => formatDateTime(text),
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action || '-'}</Tag>
      ),
    },
    {
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140,
      render: (text: string) => text || '-',
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
    <div className={styles.logsPage}>
      <Card
        title="操作日志"
        extra={
          <Space>
            <Input
              placeholder="搜索日志"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 200 }}
            />
            <Select
              placeholder="操作类型"
              allowClear
              style={{ width: 150 }}
              value={actionFilter}
              onChange={(value) => {
                setActionFilter(value)
                setTimeout(fetchLogs, 0)
              }}
              options={[
                { value: 'login', label: '登录' },
                { value: 'logout', label: '登出' },
                { value: 'sign', label: '签名' },
                { value: 'register', label: '注册' },
                { value: 'key_init', label: '密钥初始化' },
                { value: 'key_delete', label: '密钥删除' },
                { value: 'user_delete', label: '用户删除' },
                { value: 'user_status', label: '状态更新' },
                { value: 'decrypt', label: '解密' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
              刷新
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            defaultPageSize: 20,
          }}
        />
      </Card>

      <div className={styles.footer}>
        <p>
          技术支持：
          <a href="https://github.com/kintaiW" target="_blank" rel="noopener noreferrer">
            kintaiW (黄鑫泰)
          </a>
          - 审计日志服务
        </p>
      </div>
    </div>
  )
}

export default LogsPage
