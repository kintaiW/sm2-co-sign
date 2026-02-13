import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Spin, message } from 'antd'
import {
  KeyOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { monitorApi, SystemStatsResponse } from '@/api/monitor'
import { logApi } from '@/api/log'
import { AuditLog } from '@/types'
import { formatDateTime } from '@/utils'
import styles from './index.module.less'

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SystemStatsResponse | null>(null)
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsData, logsData] = await Promise.all([
        monitorApi.getStats(),
        logApi.getList({ limit: 10 }),
      ])
      setStats(statsData)
      setLogs(logsData)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getSignTrendOption = () => {
    return {
      title: {
        text: '签名趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '签名次数',
          type: 'line',
          smooth: true,
          data: [120, 200, 150, 80, 70, 110, 130],
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
              ],
            },
          },
          lineStyle: {
            color: '#1890ff',
          },
          itemStyle: {
            color: '#1890ff',
          },
        },
      ],
    }
  }

  const getKeyStatusOption = () => {
    return {
      title: {
        text: '密钥状态',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '密钥状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: stats?.keys || 0, name: '启用', itemStyle: { color: '#52c41a' } },
            { value: 0, name: '禁用', itemStyle: { color: '#ff4d4f' } },
          ],
        },
      ],
    }
  }

  const logColumns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => formatDateTime(text),
    },
    {
      title: '用户',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 120,
    },
    {
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140,
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
    <div className={styles.dashboard}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="密钥总数"
              value={stats?.keys || 0}
              prefix={<KeyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日签名"
              value={0}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats?.sessions || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="服务状态"
              value="运行中"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.chartsRow}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getSignTrendOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getKeyStatusOption()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Card title="最近操作记录" className={styles.logsCard}>
        <Table
          columns={logColumns}
          dataSource={logs}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <div className={styles.footer}>
        <p>
          技术支持：
          <a href="https://github.com/kintaiW" target="_blank" rel="noopener noreferrer">
            kintaiW (黄鑫泰)
          </a>
          - 专注国密算法、隐私计算、数据安全合规领域
        </p>
      </div>
    </div>
  )
}

export default DashboardPage
