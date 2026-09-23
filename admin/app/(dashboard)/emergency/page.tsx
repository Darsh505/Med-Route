'use client'

import { useEffect, useState } from 'react'
import { Ambulance, CheckCircle2, Clock, Hospital, RefreshCw, ShieldAlert } from 'lucide-react'

import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OccupancyChart } from '@/components/dashboard/occupancy-chart'
import { StatusBadge } from '@/components/status-badge'
import { fetchTriageCases, TriageCase, updateTriageCase } from '@/lib/api'

export default function EmergencyPage() {
  const [cases, setCases] = useState<TriageCase[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const loadCases = async () => {
    setLoading(true)
    try {
      const data = await fetchTriageCases()
      setCases(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [])

  const handleStatusChange = async (caseId: string, newStatus: TriageCase['status']) => {
    // Optimistic update
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
    )

    try {
      await updateTriageCase(caseId, newStatus)
      setToast(`Case ${caseId} status updated to ${newStatus}. Synced with network.`)
      setTimeout(() => setToast(null), 4000)
    } catch {
      setToast(`Failed to update case ${caseId}`)
    }
  }

  const active = cases.filter((c) => c.status !== 'Resolved').length
  const critical = cases.filter((c) => c.severity === 'Critical' && c.status !== 'Resolved').length
  const ambulances = cases.filter((c) => c.ambulance && c.status !== 'Resolved').length

  const stats = [
    { label: 'Active Emergency Cases', value: active },
    { label: 'Critical Trauma Routing', value: critical },
    { label: 'Ambulances En Route', value: ambulances },
  ]

  return (
    <>
      <DashboardHeader
        title="Emergency Triage & Routing"
        description="Real-time multi-hospital trauma dispatch and capacity telemetry"
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        {toast && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-zinc-950 p-3 text-xs text-emerald-400 shadow-lg">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className="hover:border-zinc-700 transition-colors">
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-2xl font-mono tabular-nums">{s.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                  </span>
                  Active Triage Board
                </CardTitle>
                <CardDescription>Live trauma cases linked to hospital ER telemetry</CardDescription>
              </div>
              <button
                onClick={loadCases}
                title="Refresh triage feed"
                className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground transition-colors"
              >
                <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {cases.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No active emergency cases. System nominal.
                </div>
              ) : (
                cases.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center justify-between hover:border-zinc-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{c.patient}</span>
                        <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                          {c.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-zinc-300">{c.complaint}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-white">
                          <Hospital className="size-3.5 text-cyan-400" />
                          {c.hospital}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5 text-amber-400" />
                          ETA {c.eta}
                        </span>
                        {c.ambulance ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Ambulance className="size-3.5" />
                            GPS Telemetry Active
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <StatusBadge status={c.severity} />
                      <div className="flex items-center gap-1.5 pt-1">
                        {c.status === 'Dispatched' && (
                          <button
                            onClick={() => handleStatusChange(c.id, 'In Transit')}
                            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors"
                          >
                            Mark In Transit
                          </button>
                        )}
                        {(c.status === 'Dispatched' || c.status === 'In Transit') && (
                          <button
                            onClick={() => handleStatusChange(c.id, 'Admitted')}
                            className="px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-colors"
                          >
                            Admit to ICU
                          </button>
                        )}
                        {c.status === 'Admitted' && (
                          <button
                            onClick={() => handleStatusChange(c.id, 'Resolved')}
                            className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-colors"
                          >
                            Resolve Case
                          </button>
                        )}
                        {c.status === 'Resolved' && (
                          <span className="text-xs text-zinc-500">Case Resolved</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <OccupancyChart />
        </div>
      </main>
    </>
  )
}
