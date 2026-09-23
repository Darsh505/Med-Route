'use client'

import { useEffect, useState } from 'react'
import { Activity, Bed, Building2, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fetchAdminStats, AdminStats } from '@/lib/api'

export function MetricCards() {
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    fetchAdminStats().then(setStats)
  }, [])

  const cards = [
    {
      label: 'Partner Hospitals',
      value: stats ? stats.total_hospitals.toLocaleString() : '1,451',
      trend: 'up' as const,
      delta: '+12%',
      hint: `${stats ? stats.verified_hospitals : 1380} verified facilities`,
      icon: Building2,
    },
    {
      label: 'Available ICU Beds',
      value: stats ? stats.available_icu_beds.toLocaleString() : '3,842',
      trend: 'up' as const,
      delta: `${stats ? stats.occupancy_rate_pct : 78.4}%`,
      hint: `of ${stats ? stats.total_icu_beds.toLocaleString() : '12,450'} total ICU beds`,
      icon: Bed,
    },
    {
      label: 'Cashless Empanelled',
      value: stats ? stats.pmjay_empanelled_count.toLocaleString() : '1,120',
      trend: 'up' as const,
      delta: `${stats ? stats.approval_rate_pct ?? 83 : 83}%`,
      hint: 'AB-PMJAY HBP 2.2 pre-auths',
      icon: Wallet,
    },
    {
      label: 'Active Triage & SOS',
      value: stats ? stats.active_triage_cases.toString() : '5',
      trend: 'down' as const,
      delta: `${stats?.critical_triage_cases ?? 3} Critical`,
      hint: `${stats?.ambulances_active ?? 4} ambulances in transit`,
      icon: Activity,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((m) => {
        const positive = m.trend === 'up'
        const Icon = m.icon
        return (
          <Card key={m.label} className="hover:border-zinc-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{m.label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-mono tabular-nums">{m.value}</CardTitle>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium',
                    positive
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : 'bg-red-950/60 text-red-400 border border-red-800/40',
                  )}
                >
                  {positive ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {m.delta}
                </span>
                <span className="text-muted-foreground truncate">{m.hint}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
