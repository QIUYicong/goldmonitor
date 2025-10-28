import React, { useEffect, useState } from 'react'
import { supabase, GoldPrice } from '../lib/supabase'
import DataCard from '../components/DataCard'
import DataTable, { Column } from '../components/DataTable'
import * as echarts from 'echarts'

const Dashboard: React.FC = () => {
  const [internationalPrices, setInternationalPrices] = useState<GoldPrice[]>([])
  const [jewelryPrices, setJewelryPrices] = useState<GoldPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    fetchGoldPrices()
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchGoldPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchGoldPrices = async () => {
    try {
      // Fetch latest prices
      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) throw error

      // Separate international and jewelry prices
      const international = data?.filter(p => p.source_type === 'international') || []
      const jewelry = data?.filter(p => p.source_type === 'jewelry') || []

      // Get latest price for each source
      const latestInternational = getLatestPrices(international)
      const latestJewelry = getLatestPrices(jewelry)

      setInternationalPrices(latestInternational)
      setJewelryPrices(latestJewelry)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching gold prices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLatestPrices = (prices: GoldPrice[]) => {
    const priceMap = new Map<string, GoldPrice>()
    prices.forEach(price => {
      const key = `${price.source_name}-${price.product_category}`
      if (!priceMap.has(key) || new Date(price.timestamp) > new Date(priceMap.get(key)!.timestamp)) {
        priceMap.set(key, price)
      }
    })
    return Array.from(priceMap.values())
  }

  const jewelryColumns: Column[] = [
    { key: 'source_name', label: '品牌', align: 'left' },
    { key: 'product_category', label: '品类', align: 'left' },
    {
      key: 'price',
      label: '价格（元/克）',
      align: 'right',
      render: (value: number) => value.toFixed(2)
    },
    {
      key: 'change',
      label: '涨跌',
      align: 'right',
      render: (_: any, row: GoldPrice) => {
        const change = row.change_amount || 0
        const percent = row.change_percent || 0
        const isPositive = change >= 0
        return (
          <span className={isPositive ? 'text-success' : 'text-decline'}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percent.toFixed(2)}%)
          </span>
        )
      }
    },
    {
      key: 'timestamp',
      label: '更新时间',
      align: 'right',
      render: (value: string) => new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-headline">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-lg py-2xl">
      {/* Page Title */}
      <div className="mb-xl">
        <h1 className="text-headline font-bold mb-xs">实时金价监控</h1>
        <div className="text-small text-neutral-500">
          最后更新: {lastUpdate.toLocaleString('zh-CN')}
          <button
            onClick={fetchGoldPrices}
            className="ml-md text-primary hover:text-primary-700 transition-colors duration-fast"
          >
            刷新
          </button>
        </div>
      </div>

      {/* International Gold Prices */}
      <section className="mb-2xl">
        <h2 className="text-subhead font-medium mb-md">国际金价</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {internationalPrices.map((price, index) => (
            <DataCard
              key={index}
              title={`${price.source_name} ${price.product_category || ''}`}
              value={price.price}
              unit={price.price_unit}
              change={price.change_amount || undefined}
              changePercent={price.change_percent || undefined}
              timestamp={price.timestamp}
            />
          ))}
        </div>
      </section>

      {/* Jewelry Gold Prices Table */}
      <section className="mb-2xl">
        <h2 className="text-subhead font-medium mb-md">首饰金价</h2>
        <DataTable columns={jewelryColumns} data={jewelryPrices} />
      </section>
    </div>
  )
}

export default Dashboard
