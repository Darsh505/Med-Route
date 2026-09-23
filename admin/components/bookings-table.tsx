'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { StatusBadge } from '@/components/status-badge'
import { bookings, formatINR } from '@/lib/data'

const filters = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'] as const

export function BookingsTable() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>('All')

  const rows = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = status === 'All' || b.status === status
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        b.patient.toLowerCase().includes(q) ||
        b.hospital.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [query, status])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="sm:max-w-xs">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search patient, hospital, ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
          <ToggleGroup
            value={status}
            onValueChange={(v) => setStatus(v || 'All')}
            variant="outline"
            size="sm"
          >
            {filters.map((f) => (
              <ToggleGroupItem key={f} value={f}>
                {f}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {rows.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No bookings found</EmptyTitle>
              <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-medium">{b.patient}</div>
                      <div className="text-xs text-muted-foreground">{b.id}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{b.hospital}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {b.department}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground tabular-nums">
                      {b.date}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{b.type}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatINR(b.amount)}</TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={b.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
