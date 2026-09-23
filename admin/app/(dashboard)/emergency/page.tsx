import { Ambulance, Clock, Hospital } from 'lucide-react'

import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OccupancyChart } from '@/components/dashboard/occupancy-chart'
import { StatusBadge } from '@/components/status-badge'
import { triageCases } from '@/lib/data'

export default function EmergencyPage() {
  const active = triageCases.length
  const critical = triageCases.filter((c) => c.severity === 'Critical').length
  const ambulances = triageCases.filter((c) => c.ambulance).length

  const stats = [
    { label: 'Active Cases', value: active },
    { label: 'Critical', value: critical },
    { label: 'Ambulances Dispatched', value: ambulances },
  ]

  return (
    <>
      <DashboardHeader title="Emergency Triage" description="Real-time routing of critical cases" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{s.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                </span>
                Active Triage Board
              </CardTitle>
              <CardDescription>Cases currently being routed to hospitals</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {triageCases.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.patient}</span>
                      <span className="text-xs text-muted-foreground">{c.id}</span>
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{c.complaint}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Hospital className="size-3.5" />
                        {c.hospital}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        ETA {c.eta}
                      </span>
                      {c.ambulance ? (
                        <span className="flex items-center gap-1 text-foreground">
                          <Ambulance className="size-3.5" />
                          Ambulance en route
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <StatusBadge status={c.severity} />
                </div>
              ))}
            </CardContent>
          </Card>

          <OccupancyChart />
        </div>
      </main>
    </>
  )
}
