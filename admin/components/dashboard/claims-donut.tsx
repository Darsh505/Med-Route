'use client'

import { Cell, Label, Pie, PieChart } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { claimsMix } from '@/lib/data'

const config = {
  value: { label: 'Claims' },
  Approved: { label: 'Approved', color: 'var(--chart-2)' },
  'Under Review': { label: 'Under Review', color: 'var(--chart-3)' },
  Disbursed: { label: 'Disbursed', color: 'var(--chart-1)' },
  Rejected: { label: 'Rejected', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function ClaimsDonut() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cashless Claims</CardTitle>
        <CardDescription>Status distribution this month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square h-[220px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
            <Pie data={claimsMix} dataKey="value" nameKey="name" innerRadius={58} strokeWidth={4}>
              {claimsMix.map((entry) => (
                <Cell key={entry.name} fill={entry.tone} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">
                          1,284
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 22} className="fill-muted-foreground text-xs">
                          total claims
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {claimsMix.map((c) => (
            <div key={c.name} className="flex items-center gap-2 text-sm">
              <span className="size-2.5 rounded-sm" style={{ background: c.tone }} />
              <span className="text-muted-foreground">{c.name}</span>
              <span className="ml-auto font-medium tabular-nums">{c.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
