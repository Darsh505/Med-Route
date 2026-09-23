'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, RefreshCw, Search } from 'lucide-react'

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
import { formatINR } from '@/lib/data'
import { BookingRecord, fetchBookings, updateBookingStatus } from '@/lib/api'

const filters = ['All', 'Confirmed', 'In Consultation', 'Completed', 'Cancelled'] as const

export function BookingsTable() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>('All')
  const [toast, setToast] = useState<string | null>(null)

  const loadBookings = async () => {
    setLoading(true)
    try {
      const data = await fetchBookings()
      setBookings(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleStatusUpdate = async (id: string, newStatus: BookingRecord['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    )
    try {
      await updateBookingStatus(id, newStatus)
      setToast(`Booking ${id} updated to ${newStatus}. Synced with network.`)
      setTimeout(() => setToast(null), 4000)
    } catch {
      setToast(`Failed to update booking ${id}`)
    }
  }

  const rows = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = status === 'All' || b.status === status
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        b.patient.toLowerCase().includes(q) ||
        b.hospital.toLowerCase().includes(q) ||
        b.procedure.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [bookings, query, status])

  return (
    <Card className="hover:border-zinc-700 transition-colors">
      <CardContent className="flex flex-col gap-4 pt-6">
        {toast && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-zinc-950 p-3 text-xs text-emerald-400 shadow-lg">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <InputGroup className="w-full">
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search patient, hospital, procedure, ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <button
              onClick={loadBookings}
              title="Refresh bookings"
              className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <ToggleGroup
            value={status}
            onValueChange={(v) => setStatus(v || 'All')}
            variant="outline"
            size="sm"
            className="flex-wrap"
          >
            {filters.map((f) => (
              <ToggleGroupItem key={f} value={f}>
                {f}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {loading && bookings.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
            <RefreshCw className="size-4 animate-spin mr-2" />
            Loading booking records...
          </div>
        ) : rows.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No bookings found</EmptyTitle>
              <EmptyDescription>Try adjusting your search query or status filter.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead className="hidden md:table-cell">Procedure</TableHead>
                  <TableHead className="hidden lg:table-cell">Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Tariff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="font-medium text-white">{b.patient}</div>
                      <div className="text-xs font-mono text-muted-foreground">{b.id}</div>
                    </TableCell>
                    <TableCell className="text-zinc-300 font-medium">{b.hospital}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {b.procedure}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground tabular-nums text-xs">
                      {b.date} · {b.time}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        {b.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-white">
                      {formatINR(b.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <select
                        value={b.status}
                        onChange={(e) =>
                          handleStatusUpdate(b.id, e.target.value as BookingRecord['status'])
                        }
                        className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1 cursor-pointer focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Consultation">In Consultation</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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
