type StatsCardProps = {
  label: string
  value: string | number
  change: number
  icon: string
  color: "blue" | "purple" | "green" | "orange"
}

export default function StatsCard({ label, value, change, icon }: StatsCardProps) {
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <div 
      className="card relative overflow-hidden"
      style={{ padding: 'var(--space-6)', border: '1px solid var(--color-surface-raised)' }}
    >
      
      {/* Background Icon */}
      <div 
        className="absolute top-4 right-4 text-6xl opacity-10 pointer-events-none"
      >
        {icon}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div 
          style={{ 
            color: 'var(--color-text-inverse)', 
            fontSize: 'var(--font-size-xs)', 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            marginBottom: 'var(--space-2)'
          }}
        >
          {label}
        </div>
        
        <div className="flex items-end justify-between">
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900 }}>{value}</div>

          {change !== 0 && (
            <div 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 900,
                color: isPositive ? '#10b981' : isNegative ? 'var(--color-action-danger)' : 'var(--color-text-inverse)'
              }}
            >
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
