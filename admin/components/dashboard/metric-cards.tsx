import { TrendingDown, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { metrics } from '@/lib/data'

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => {
        const positive = m.trend === 'up'
        return (
          <Card key={m.label}>
            <CardHeader>
              <CardDescription>{m.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{m.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium',
                    positive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-emerald-50 text-emerald-700',
                  )}
                >
                  {positive ? (
                    <TrendingUp className="size-3.5" />
                  ) : (
                    <TrendingDown className="size-3.5" />
                  )}
                  {m.delta}
                </span>
                <span className="text-muted-foreground">{m.hint}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
