import { cn } from '@/lib/utils'

interface WeightBadgeProps {
  weight: number | null
  showIcon?: boolean
  className?: string
}

export function WeightBadge({ weight, showIcon = true, className }: WeightBadgeProps) {
  if (weight === null) return null

  const config = {
    1: { label: '1점', icon: '⚡', classes: 'bg-gray-100 text-gray-700' },
    3: { label: '3점', icon: '⚠️', classes: 'bg-amber-100 text-amber-700' },
    5: { label: '5점', icon: '🔴', classes: 'bg-red-100 text-red-700' },
  }[weight] ?? { label: `${weight}점`, icon: '•', classes: 'bg-gray-100 text-gray-600' }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium',
        config.classes,
        className,
      )}
    >
      {showIcon && <span>{config.icon}</span>}
      가중치 {config.label}
    </span>
  )
}
