interface StatsCardProps {
  title: string
  value: number | string
  icon?: React.ReactNode
  highlight?: boolean
  description?: string
}

export default function StatsCard({
  title,
  value,
  icon,
  highlight = false,
  description,
}: StatsCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
        highlight
          ? 'border-red-200 bg-red-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-gray-500'}`}>
            {title}
          </p>
          <p
            className={`mt-1 text-3xl font-bold ${
              highlight ? 'text-red-700' : 'text-gray-900'
            }`}
          >
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-gray-400">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={`rounded-lg p-2 ${
              highlight ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
