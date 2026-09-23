'use client'

import { useMemo, useState } from 'react'
import { Ambulance, MapPin, Search, Star, Wallet } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { StatusBadge } from '@/components/status-badge'
import { hospitals } from '@/lib/data'

const types = ['All', 'Multispecialty', 'Cardiac', 'Trauma', 'Maternity', 'General'] as const

export function HospitalsDirectory() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<string>('All')

  const rows = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesType = type === 'All' || h.type === type
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q)
      return matchesType && matchesQuery
    })
  }, [query, type])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <InputGroup className="lg:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search hospitals or cities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <ToggleGroup
          value={type}
          onValueChange={(v) => setType(v || 'All')}
          variant="outline"
          size="sm"
          className="flex-wrap"
        >
          {types.map((t) => (
            <ToggleGroupItem key={t} value={t}>
              {t}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {rows.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No hospitals found</EmptyTitle>
            <EmptyDescription>Try a different search or filter.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((h) => {
            const occupancy = Math.round(((h.beds - h.bedsAvailable) / h.beds) * 100)
            return (
              <Card key={h.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{h.name}</CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {h.city}, {h.state}
                      </div>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{h.type}</Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {h.rating}
                    </span>
                    {h.cashless ? (
                      <span className="flex items-center gap-1 text-sm text-emerald-700">
                        <Wallet className="size-3.5" />
                        Cashless
                      </span>
                    ) : null}
                    {h.emergency ? (
                      <span className="flex items-center gap-1 text-sm text-red-600">
                        <Ambulance className="size-3.5" />
                        24x7 ER
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bed occupancy</span>
                      <span className="font-medium tabular-nums">{occupancy}%</span>
                    </div>
                    <Progress value={occupancy} />
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  <span className="tabular-nums">
                    {h.bedsAvailable} of {h.beds} beds available
                  </span>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
