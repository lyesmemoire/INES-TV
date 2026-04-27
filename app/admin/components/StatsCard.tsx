type StatsCardProps = {
  label: string
  value: string | number
  change: number
  icon: string
  color: "blue" | "purple" | "green" | "orange"
}

const colorMap = {
  blue: "from-blue-600/20 to-blue-600/5 border-blue-600/30",
  purple: "from-purple-600/20 to-purple-600/5 border-purple-600/30",
  green: "from-green-600/20 to-green-600/5 border-green-600/30",
  orange: "from-orange-600/20 to-orange-600/5 border-orange-600/30",
}

export default function StatsCard({ label, value, change, icon, color }: StatsCardProps) {
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-6 relative overflow-hidden`}>
      
      {/* Background Icon */}
      <div className="absolute top-4 right-4 text-6xl opacity-10">
        {icon}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-gray-400 text-sm font-medium mb-2">{label}</div>
        
        <div className="flex items-end justify-between">
          <div className="text-4xl font-bold">{value}</div>

          {change !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-gray-400"
            }`}>
              {isPositive && "↑"}
              {isNegative && "↓"}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
