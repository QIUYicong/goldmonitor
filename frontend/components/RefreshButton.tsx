'use client'

import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RefreshButtonProps {
  onRefresh: () => void
  loading: boolean
}

export default function RefreshButton({ onRefresh, loading }: RefreshButtonProps) {
  const [fetching, setFetching] = useState(false)

  const handleFetchNewData = async () => {
    setFetching(true)
    try {
      const response = await supabase.functions.invoke('fetch-gold-prices')
      if (response.error) throw response.error

      // 等待1秒让数据库更新
      setTimeout(() => {
        onRefresh()
        setFetching(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching new data:', error)
      alert('抓取失败，请稍后重试')
      setFetching(false)
    }
  }

  return (
    <button
      onClick={handleFetchNewData}
      disabled={fetching || loading}
      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
        fetching || loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gold-600 text-white hover:bg-gold-700 hover:shadow-lg'
      }`}
    >
      {fetching ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          抓取中...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          抓取最新金价
        </span>
      )}
    </button>
  )
}
