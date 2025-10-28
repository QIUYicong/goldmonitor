interface PriceCardProps {
  price: {
    source_name: string
    product_category: string
    price: number
    price_unit: string
    change_amount: number
    change_percent: number
  }
}

export default function PriceCard({ price }: PriceCardProps) {
  const isPositive = price.change_amount >= 0

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {price.source_name}
          </h3>
          <p className="text-sm text-gray-600">{price.product_category}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isPositive
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {isPositive ? '↑' : '↓'}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-3xl font-bold text-gray-900">
          {price.price.toFixed(2)}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {price.price_unit}
        </div>
      </div>

      <div className={`flex items-center gap-2 text-sm font-medium ${
        isPositive ? 'text-red-600' : 'text-green-600'
      }`}>
        <span>
          {isPositive ? '+' : ''}{price.change_amount.toFixed(2)}
        </span>
        <span>
          ({isPositive ? '+' : ''}{price.change_percent.toFixed(2)}%)
        </span>
      </div>
    </div>
  )
}
