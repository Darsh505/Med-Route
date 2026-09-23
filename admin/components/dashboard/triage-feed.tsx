import Link from 'next/link'
import { Ambulance, ArrowUpRight, Clock } from 'lucide-react'

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { triageCases } from '@/lib/data'

export function TriageFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-red-500" />
          </span>
          Live Emergency Triage
        </CardTitle>
        <CardDescription>Active cases being routed now</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" render={<Link href="/emergency" />}>
            Open
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {triageCases.slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.patient}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.complaint}</div>
                </div>
                <StatusBadge status={c.severity} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="truncate">{c.hospital}</span>
                <span className="ml-auto flex items-center gap-1">
                  <Clock className="size-3" />
                  {c.eta}
                </span>
                {c.ambulance ? (
                  <span className="flex items-center gap-1 text-foreground">
                    <Ambulance className="size-3.5" />
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
