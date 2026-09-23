'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { bookingsTrend } from '@/lib/data'

const config = {
  opd: { label: 'OPD Visits', color: 'var(--chart-1)' },
  emergency: { label: 'Emergency', color: 'var(--chart-4)' },
  surgery: { label: 'Surgery', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function BookingsChart() {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Booking Volume</CardTitle>
        <CardDescription>Monthly appointments across the network</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
          <AreaChart data={bookingsTrend} margin={{ left: 4, right: 12, top: 8 }}>
            <defs>
              {Object.entries(config).map(([key, { color }]) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.04} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="opd"
              type="monotone"
              stroke="var(--color-opd)"
              fill="url(#fill-opd)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="surgery"
              type="monotone"
              stroke="var(--color-surgery)"
              fill="url(#fill-surgery)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="emergency"
              type="monotone"
              stroke="var(--color-emergency)"
              fill="url(#fill-emergency)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
