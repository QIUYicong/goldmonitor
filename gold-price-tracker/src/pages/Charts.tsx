import React, { useEffect, useState, useRef } from 'react'
import { supabase, GoldPrice } from '../lib/supabase'
import * as echarts from 'echarts'

const Charts: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('24h')
  const [selectedSources, setSelectedSources] = useState<string[]>(['LBMA', '周大福', '周生生'])
  const [historicalData, setHistoricalData] = useState<GoldPrice[]>([])
  const chartRef = useRef<HTMLDivElement>(null)

  const timeRanges = [
    { id: '24h', label: '24小时' },
    { id: '7d', label: '7天' },
    { id: '30d', label: '30天' },
    { id: '3m', label: '3个月' },
    { id: '1y', label: '1年' }
  ]

  const availableSources = [
    { type: 'international', name: 'LBMA' },
    { type: 'international', name: 'COMEX' },
    { type: 'international', name: 'SGE' },
    { type: 'jewelry', name: '周大福' },
    { type: 'jewelry', name: '周生生' },
    { type: 'jewelry', name: '老凤祥' },
    { type: 'jewelry', name: '周大生' },
    { type: 'jewelry', name: '中国黄金' }
  ]

  useEffect(() => {
    fetchHistoricalData()
  }, [timeRange, selectedSources])

  useEffect(() => {
    if (historicalData.length > 0 && chartRef.current) {
      renderChart()
    }
  }, [historicalData])

  const fetchHistoricalData = async () => {
    try {
      const hours = getHoursFromTimeRange(timeRange)
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .gte('timestamp', startTime)
        .in('source_name', selectedSources)
        .order('timestamp', { ascending: true })

      if (error) throw error
      setHistoricalData(data || [])
    } catch (error) {
      console.error('Error fetching historical data:', error)
    }
  }

  const getHoursFromTimeRange = (range: string): number => {
    const rangeMap: { [key: string]: number } = {
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
      '3m': 24 * 90,
      '1y': 24 * 365
    }
    return rangeMap[range] || 24
  }

  const renderChart = () => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    // Group data by source
    const groupedData: { [key: string]: GoldPrice[] } = {}
    historicalData.forEach(price => {
      if (!groupedData[price.source_name]) {
        groupedData[price.source_name] = []
      }
      groupedData[price.source_name].push(price)
    })

    // Prepare series data
    const series = Object.keys(groupedData).map(sourceName => {
      const prices = groupedData[sourceName]
      return {
        name: sourceName,
        type: 'line',
        data: prices.map(p => [new Date(p.timestamp).getTime(), p.price]),
        smooth: false,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2
        }
      }
    })

    const option: echarts.EChartsOption = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#CCCCCC',
        borderWidth: 1,
        textStyle: {
          color: '#000000',
          fontSize: 14
        }
      },
      legend: {
        data: Object.keys(groupedData),
        bottom: 0,
        textStyle: {
          fontSize: 14,
          fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'
        }
      },
      xAxis: {
        type: 'time',
        axisLine: {
          lineStyle: {
            color: '#CCCCCC',
            width: 1
          }
        },
        axisLabel: {
          color: '#666666',
          fontSize: 14,
          fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#E5E5E5',
            width: 1
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#CCCCCC',
            width: 1
          }
        },
        axisLabel: {
          color: '#666666',
          fontSize: 14,
          fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
          align: 'right'
        },
        splitLine: {
          lineStyle: {
            color: '#E5E5E5',
            width: 1
          }
        }
      },
      series: series as any
    }

    chart.setOption(option)

    // Resize chart on window resize
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }

  const toggleSource = (sourceName: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceName)
        ? prev.filter(s => s !== sourceName)
        : [...prev, sourceName]
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-lg py-2xl">
      <h1 className="text-headline font-bold mb-xl">价格走势图</h1>

      {/* Time Range Selector */}
      <div className="mb-md">
        <div className="flex gap-sm border-b border-neutral-300">
          {timeRanges.map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`
                px-md py-sm text-body font-normal transition-colors duration-fast
                ${timeRange === range.id
                  ? 'border-b-medium border-primary text-primary'
                  : 'text-neutral-700 hover:text-primary'
                }
              `}
              style={{ marginBottom: '-1px' }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source Selector */}
      <div className="mb-lg">
        <h3 className="text-body font-medium mb-sm">数据源选择</h3>
        <div className="flex flex-wrap gap-sm">
          {availableSources.map(source => (
            <label
              key={source.name}
              className="flex items-center gap-xs cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSources.includes(source.name)}
                onChange={() => toggleSource(source.name)}
                className="w-sm h-sm"
              />
              <span className="text-body">{source.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartRef} style={{ width: '100%', height: '500px' }} className="mb-lg" />

      {/* Export Buttons */}
      <div className="flex gap-sm">
        <button className="px-md py-sm bg-primary text-white font-bold text-small uppercase tracking-wider hover:bg-primary-700 transition-colors duration-fast">
          导出 CSV
        </button>
        <button className="px-md py-sm bg-white text-neutral-900 font-bold text-small uppercase tracking-wider border-medium border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors duration-fast">
          导出图片
        </button>
      </div>
    </div>
  )
}

export default Charts
