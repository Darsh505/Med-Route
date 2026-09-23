'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCw, Wallet } from 'lucide-react'

import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { formatINR } from '@/lib/data'
import { ClaimRecord, fetchClaims, updateClaimStatus } from '@/lib/api'

export default function ClaimsPage() {
  const [claims, setClaims] = useState<ClaimRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const loadClaims = async () => {
    setLoading(true)
    try {
      const data = await fetchClaims()
      setClaims(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClaims()
  }, [])

  const handleStatusChange = async (claimId: string, newStatus: ClaimRecord['status']) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c))
    )
    try {
      await updateClaimStatus(claimId, newStatus)
      setToast(`Claim ${claimId} marked as ${newStatus}. Synced with network.`)
      setTimeout(() => setToast(null), 4000)
    } catch {
      setToast(`Failed to update claim ${claimId}`)
    }
  }

  const total = claims.reduce((s, c) => s + c.amount, 0)
  const disbursed = claims
    .filter((c) => c.status === 'Disbursed')
    .reduce((s, c) => s + c.amount, 0)
  const review = claims.filter((c) => c.status === 'Under Review').length
  const approvalRate = claims.length
    ? Math.round(
        (claims.filter((c) => c.status === 'Approved' || c.status === 'Disbursed').length /
          claims.length) *
          100
      )
    : 85

  const cards = [
    { label: 'Total Claims Pipeline', value: formatINR(total) },
    { label: 'Disbursed Settlements', value: formatINR(disbursed) },
    { label: 'Under Review', value: `${review} claims` },
    { label: 'Approval Rate', value: `${approvalRate}%` },
  ]

  return (
    <>
      <DashboardHeader
        title="Cashless Claims & Settlements"
        description="Ayushman Bharat (AB-PMJAY HBP 2.2) and private insurer pre-authorization ledger"
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        {toast && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-zinc-950 p-3 text-xs text-emerald-400 shadow-lg">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label} className="hover:border-zinc-700 transition-colors">
              <CardHeader>
                <CardDescription>{c.label}</CardDescription>
                <CardTitle className="text-2xl font-mono tabular-nums">{c.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="size-4 text-emerald-400" />
                Claims Pipeline Ledger
              </CardTitle>
              <CardDescription>Direct pre-authorization settlement dispatch</CardDescription>
            </div>
            <button
              onClick={loadClaims}
              title="Refresh claims"
              className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground transition-colors"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </CardHeader>

          <CardContent className="px-0 pt-0">
            {loading && claims.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                <RefreshCw className="size-4 animate-spin mr-2" />
                Loading claims records...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Claim ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead className="hidden md:table-cell">Hospital</TableHead>
                      <TableHead>Insurer</TableHead>
                      <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                      <TableHead className="text-right">Claim Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6 text-right">Settlement Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="pl-6 font-mono font-medium text-white">{c.id}</TableCell>
                        <TableCell className="font-medium">{c.patient}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {c.hospital}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-mono ${
                              c.insurer.includes('PMJAY')
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {c.insurer}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground tabular-nums text-xs">
                          {c.submitted}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-white">
                          {formatINR(c.amount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === 'Under Review' && (
                              <button
                                onClick={() => handleStatusChange(c.id, 'Approved')}
                                className="px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {c.status === 'Approved' && (
                              <button
                                onClick={() => handleStatusChange(c.id, 'Disbursed')}
                                className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-colors"
                              >
                                Disburse
                              </button>
                            )}
                            {c.status === 'Under Review' && (
                              <button
                                onClick={() => handleStatusChange(c.id, 'Rejected')}
                                className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs transition-colors"
                              >
                                Reject
                              </button>
                            )}
                            {c.status === 'Disbursed' && (
                              <span className="text-xs text-emerald-500 font-medium">Settled</span>
                            )}
                            {c.status === 'Rejected' && (
                              <span className="text-xs text-red-400">Claim Closed</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
