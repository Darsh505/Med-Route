import { cn } from '@/lib/utils'
import { statusTone, type StatusTone } from '@/lib/data'

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  neutral: 'bg-muted text-muted-foreground ring-border',
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const tone = statusTone[status] ?? 'neutral'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', {
          'bg-emerald-500': tone === 'success',
          'bg-amber-500': tone === 'warning',
          'bg-red-500': tone === 'danger',
          'bg-blue-500': tone === 'info',
          'bg-muted-foreground': tone === 'neutral',
        })}
      />
      {status}
    </span>
  )
}
