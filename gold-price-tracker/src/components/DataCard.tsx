import React from 'react'

interface DataCardProps {
  title: string
  value: string | number
  unit: string
  change?: number
  changePercent?: number
  timestamp?: string
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  unit,
  change,
  changePercent,
  timestamp
}) => {
  const isPositive = change !== undefined && change >= 0

  return (
    <div className="bg-neutral-100 border border-neutral-300 p-lg" style={{ height: '160px' }}>
      <div className="flex flex-col h-full">
        <h3 className="text-subhead font-bold mb-xs">{title}</h3>
        
        <div className="flex items-baseline gap-xs mb-xs flex-1">
          <span className="text-large-number font-bold tracking-tight leading-none">
            {typeof value === 'number' ? value.toFixed(2) : value}
          </span>
          <span className="text-caption text-neutral-500">{unit}</span>
        </div>

        {change !== undefined && changePercent !== undefined && (
          <div className={`text-body font-normal mb-xs ${isPositive ? 'text-success' : 'text-decline'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        )}

        {timestamp && (
          <div className="text-small text-neutral-500 mt-auto">
            更新于 {new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DataCard
