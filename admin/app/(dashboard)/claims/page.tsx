import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { claims, formatINR } from '@/lib/data'

function summarize() {
  const total = claims.reduce((s, c) => s + c.amount, 0)
  const disbursed = claims.filter((c) => c.status === 'Disbursed').reduce((s, c) => s + c.amount, 0)
  const review = claims.filter((c) => c.status === 'Under Review').length
  const approvalRate = Math.round(
    (claims.filter((c) => c.status === 'Approved' || c.status === 'Disbursed').length / claims.length) * 100,
  )
  return { total, disbursed, review, approvalRate }
}

export default function ClaimsPage() {
  const s = summarize()
  const cards = [
    { label: 'Total Claimed', value: formatINR(s.total) },
    { label: 'Disbursed', value: formatINR(s.disbursed) },
    { label: 'Under Review', value: `${s.review} claims` },
    { label: 'Approval Rate', value: `${s.approvalRate}%` },
  ]

  return (
    <>
      <DashboardHeader title="Claims" description="Cashless insurance claims and settlements" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label}>
              <CardHeader>
                <CardDescription>{c.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{c.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Claim</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Hospital</TableHead>
                    <TableHead>Insurer</TableHead>
                    <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="pr-6 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="pl-6 font-medium">{c.id}</TableCell>
                      <TableCell>{c.patient}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {c.hospital}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.insurer}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground tabular-nums">
                        {c.submitted}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatINR(c.amount)}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <StatusBadge status={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
