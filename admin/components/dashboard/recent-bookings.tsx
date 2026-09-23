import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { bookings, formatINR } from '@/lib/data'

export function RecentBookings() {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>Latest appointments and procedures</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" render={<Link href="/bookings" />}>
            View all
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Patient</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.slice(0, 6).map((b) => (
              <TableRow key={b.id}>
                <TableCell className="pl-6">
                  <div className="font-medium">{b.patient}</div>
                  <div className="text-xs text-muted-foreground">{b.id}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{b.hospital}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{b.type}</TableCell>
                <TableCell className="text-right tabular-nums">{formatINR(b.amount)}</TableCell>
                <TableCell className="pr-6 text-right">
                  <StatusBadge status={b.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
