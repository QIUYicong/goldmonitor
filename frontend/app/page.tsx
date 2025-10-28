'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import PriceCard from '@/components/PriceCard'
import PriceChart from '@/components/PriceChart'
import RefreshButton from '@/components/RefreshButton'
import TestEmailButton from '@/components/TestEmailButton'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface GoldPrice {
  id: number
  source_type: string
  source_name: string
  product_category: string
  price: number
  price_unit: string
  change_amount: number
  change_percent: number
  currency: string
  timestamp: string
  created_at: string
}

export default function Home() {
  const [prices, setPrices] = useState<GoldPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20)

      if (error) throw error

      setPrices(data || [])
      if (data && data.length > 0) {
        setLastUpdate(new Date(data[0].timestamp).toLocaleString('zh-CN'))
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  const internationalPrices = prices.filter(p => p.source_type === 'international')
  const jewelryPrices = prices.filter(p => p.source_type === 'jewelry')

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-4xl">💰</span>
                金价追踪系统
              </h1>
              <p className="text-gray-600 mt-1">实时监控国际金价和首饰金价</p>
            </div>
            <div className="flex gap-3">
              <TestEmailButton />
              <RefreshButton onRefresh={fetchPrices} loading={loading} />
            </div>
          </div>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-4">
              最后更新: {lastUpdate}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && prices.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          </div>
        ) : (
          <>
            {/* 国际金价 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>🌍</span>
                国际金价
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {internationalPrices.map((price) => (
                  <PriceCard key={price.id} price={price} />
                ))}
              </div>
            </section>

            {/* 价格走势图 */}
            {internationalPrices.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📈</span>
                  价格走势
                </h2>
                <PriceChart prices={prices} />
              </section>
            )}

            {/* 首饰金价 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>💍</span>
                首饰金价
              </h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          品牌
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          品类
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          价格
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          涨跌
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jewelryPrices.map((price) => (
                        <tr key={price.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {price.source_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {price.product_category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {price.price.toFixed(2)} {price.price_unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className={`text-sm font-medium ${
                              price.change_amount >= 0
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}>
                              {price.change_amount >= 0 ? '+' : ''}
                              {price.change_amount.toFixed(2)} ({price.change_percent.toFixed(2)}%)
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </table>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              💰 金价追踪系统 - 24/7自动监控 | 数据来源: gold-api.com
            </p>
            <p className="text-xs mt-2 text-gray-500">
              每小时自动更新 | 每天早上8点发送邮件报告
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
