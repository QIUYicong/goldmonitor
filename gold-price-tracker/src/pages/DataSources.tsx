import React, { useEffect, useState } from 'react'
import { supabase, DataSource } from '../lib/supabase'
import DataTable, { Column } from '../components/DataTable'

const DataSources: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(60)

  useEffect(() => {
    fetchDataSources()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDataSources()
      }, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const fetchDataSources = async () => {
    try {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .order('source_name', { ascending: true })

      if (error) throw error
      setSources(data || [])
    } catch (error) {
      console.error('Error fetching data sources:', error)
    }
  }

  const handleRefreshAll = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('fetch-gold-prices')
      if (error) throw error
      
      // Wait a moment then refresh the display
      setTimeout(() => {
        fetchDataSources()
        setLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Error refreshing data:', error)
      setLoading(false)
    }
  }

  const columns: Column[] = [
    { key: 'source_name', label: '数据源名称', align: 'left' },
    {
      key: 'source_type',
      label: '类型',
      align: 'left',
      render: (value: string) => {
        const typeMap: { [key: string]: string } = {
          international: '国际',
          jewelry: '品牌',
          third_party: '第三方'
        }
        return typeMap[value] || value
      }
    },
    {
      key: 'status',
      label: '状态',
      align: 'left',
      render: (value: string) => {
        const statusMap: { [key: string]: { text: string, color: string } } = {
          online: { text: '在线', color: 'text-success' },
          offline: { text: '离线', color: 'text-neutral-500' },
          error: { text: '错误', color: 'text-primary' }
        }
        const status = statusMap[value] || { text: value, color: 'text-neutral-900' }
        return <span className={status.color}>{status.text}</span>
      }
    },
    {
      key: 'last_success_time',
      label: '最后成功时间',
      align: 'right',
      render: (value: string | null) => 
        value ? new Date(value).toLocaleString('zh-CN') : '-'
    },
    {
      key: 'response_time_ms',
      label: '延迟（ms）',
      align: 'right',
      render: (value: number | null) => value !== null ? value : '-'
    },
    {
      key: 'success_count',
      label: '成功次数',
      align: 'right'
    },
    {
      key: 'error_count',
      label: '失败次数',
      align: 'right'
    }
  ]

  // Calculate statistics
  const onlineCount = sources.filter(s => s.status === 'online').length
  const offlineCount = sources.filter(s => s.status === 'offline').length
  const errorCount = sources.filter(s => s.status === 'error').length

  return (
    <div className="max-w-[1200px] mx-auto px-lg py-2xl">
      <h1 className="text-headline font-bold mb-xl">数据源管理</h1>

      {/* Global Refresh Button */}
      <div className="flex items-center gap-md mb-lg">
        <button
          onClick={handleRefreshAll}
          disabled={loading}
          className="px-md py-sm bg-primary text-white font-bold text-small uppercase tracking-wider hover:bg-primary-700 transition-colors duration-fast disabled:bg-neutral-400"
          style={{ height: '48px' }}
        >
          {loading ? '刷新中...' : '刷新所有数据源'}
        </button>

        <div className="flex items-center gap-sm">
          <label className="flex items-center gap-xs cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-sm h-sm"
            />
            <span className="text-body">启用自动刷新</span>
          </label>
          {autoRefresh && (
            <>
              <input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                min="10"
                max="3600"
                className="w-24 px-sm py-xs border border-neutral-300 text-body"
              />
              <span className="text-body">秒</span>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
        <div className="bg-neutral-100 border border-neutral-300 p-md">
          <div className="text-small text-neutral-500 mb-xs">在线数据源</div>
          <div className="text-large-number font-bold text-success">{onlineCount}</div>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 p-md">
          <div className="text-small text-neutral-500 mb-xs">离线数据源</div>
          <div className="text-large-number font-bold text-neutral-500">{offlineCount}</div>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 p-md">
          <div className="text-small text-neutral-500 mb-xs">错误数据源</div>
          <div className="text-large-number font-bold text-primary">{errorCount}</div>
        </div>
      </div>

      {/* Data Sources Table */}
      <div className="mb-lg">
        <h2 className="text-subhead font-medium mb-md">数据源状态</h2>
        <DataTable columns={columns} data={sources} />
      </div>
    </div>
  )
}

export default DataSources
