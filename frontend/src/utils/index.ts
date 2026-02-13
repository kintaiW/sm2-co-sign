export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const formatUptime = (uptime: string): string => {
  if (!uptime) return '-'
  return uptime
}

export const getStatusText = (status: number): string => {
  return status === 1 ? '启用' : '禁用'
}

export const getStatusColor = (status: number): string => {
  return status === 1 ? 'green' : 'red'
}

export const truncateString = (str: string, maxLength: number = 20): string => {
  if (!str) return '-'
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
