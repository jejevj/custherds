import { cn } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'

interface Props {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: Props) {
  const color = STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700'
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', color, className)}>
      {label}
    </span>
  )
}
