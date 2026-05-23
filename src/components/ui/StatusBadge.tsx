import { cn } from '@/lib/utils'
import type { EvalStatus, PoamStatus } from '@/types'

interface StatusBadgeProps {
  status: EvalStatus | PoamStatus | null
  className?: string
}

const evalConfig: Record<EvalStatus, { label: string; classes: string }> = {
  met: { label: 'MET', classes: 'bg-green-100 text-green-700' },
  not_met: { label: 'NOT MET', classes: 'bg-red-100 text-red-700' },
  not_evaluated: { label: '미평가', classes: 'bg-gray-100 text-gray-500' },
}

const poamConfig: Record<PoamStatus, { label: string; classes: string }> = {
  planned: { label: '계획중', classes: 'bg-blue-100 text-blue-700' },
  in_progress: { label: '진행중', classes: 'bg-amber-100 text-amber-700' },
  completed: { label: '완료', classes: 'bg-green-100 text-green-700' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return <span className="text-xs text-gray-400">—</span>

  const config =
    evalConfig[status as EvalStatus] ?? poamConfig[status as PoamStatus] ?? null
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
