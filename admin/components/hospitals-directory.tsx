'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Ambulance,
  CheckCircle2,
  Edit3,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Star,
  Wallet,
  X,
} from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { StatusBadge } from '@/components/status-badge'
import {
  fetchAdminHospitals,
  HospitalRecord,
  updateHospitalTelemetry,
} from '@/lib/api'

const types = ['All', 'Multispecialty', 'Cardiac', 'Trauma', 'Maternity', 'General'] as const

export function HospitalsDirectory() {
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [type, setType] = useState<string>('All')
  const [notification, setNotification] = useState<string | null>(null)

  // Edit Capacity Modal State
  const [editingHospital, setEditingHospital] = useState<HospitalRecord | null>(null)
  const [editIcu, setEditIcu] = useState<number>(0)
  const [editTotalBeds, setEditTotalBeds] = useState<number>(0)
  const [editPmjay, setEditPmjay] = useState<boolean>(true)
  const [editActive, setEditActive] = useState<boolean>(true)
  const [saving, setSaving] = useState(false)

  // Initial fetch from backend
  const loadHospitals = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminHospitals()
      setHospitals(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHospitals()
  }, [])

  const rows = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesType =
        type === 'All' ||
        h.type.toLowerCase().includes(type.toLowerCase()) ||
        type.toLowerCase().includes(h.type.toLowerCase())
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q)
      return matchesType && matchesQuery
    })
  }, [hospitals, query, type])

  const openEditModal = (h: HospitalRecord) => {
    setEditingHospital(h)
    setEditIcu(h.beds_icu_available)
    setEditTotalBeds(h.beds_total)
    setEditPmjay(h.is_pmjay_empanelled)
    setEditActive(h.is_active)
  }

  const handleQuickIcuAdjust = async (h: HospitalRecord, delta: number) => {
    const newIcu = Math.max(0, h.beds_icu_available + delta)
    if (newIcu === h.beds_icu_available) return

    // Optimistic UI update
    setHospitals((prev) =>
      prev.map((item) => (item.id === h.id ? { ...item, beds_icu_available: newIcu } : item))
    )

    try {
      await updateHospitalTelemetry(h.id, { beds_icu_available: newIcu })
      showToast(`${h.name}: ICU beds updated to ${newIcu}. Synced live across Web & Mobile.`)
    } catch {
      showToast(`Failed to sync changes for ${h.name}`)
    }
  }

  const handleSaveModal = async () => {
    if (!editingHospital) return
    setSaving(true)
    try {
      const updated = await updateHospitalTelemetry(editingHospital.id, {
        beds_icu_available: editIcu,
        beds_total: editTotalBeds,
        is_pmjay_empanelled: editPmjay,
        is_active: editActive,
      })

      setHospitals((prev) =>
        prev.map((h) => (h.id === editingHospital.id ? { ...h, ...updated } : h))
      )
      showToast(
        `${editingHospital.name} capacity updated: ${editIcu} ICU beds available. Reflected on Web & Mobile.`
      )
      setEditingHospital(null)
    } finally {
      setSaving(false)
    }
  }

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr))
    }, 4500)
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="sticky top-2 z-50 flex items-center justify-between gap-3 rounded-lg border border-emerald-500/40 bg-zinc-950 p-3.5 text-xs text-emerald-400 shadow-xl shadow-black/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span className="font-medium">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <InputGroup className="w-full">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search 1,451 hospitals, cities, specialties..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
          <button
            onClick={loadHospitals}
            title="Refresh network data"
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

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

      {/* Directory Content */}
      {loading && hospitals.length === 0 ? (
        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
          <RefreshCw className="size-5 animate-spin mr-2" />
          Loading network telemetry across India...
        </div>
      ) : rows.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No hospitals found</EmptyTitle>
            <EmptyDescription>Try adjusting your search query or specialty filter.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((h) => {
            const total = h.beds_total || 200
            const availIcu = h.beds_icu_available ?? 0
            const occupancy = Math.max(10, Math.min(98, Math.round(((total - (availIcu * 4)) / total) * 100)))

            return (
              <Card key={h.id} className="flex flex-col justify-between hover:border-zinc-700 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{h.name}</CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {h.city}, {h.state}
                      </div>
                    </div>
                    <StatusBadge status={h.is_active ? 'Active' : 'Inactive'} />
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {h.type}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {h.overall_rating}
                    </span>
                    {h.is_pmjay_empanelled ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                        <Wallet className="size-3" />
                        Cashless PMJAY
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">Private Only</span>
                    )}
                    {h.is_trauma_center ? (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <Ambulance className="size-3" />
                        24x7 ER
                      </span>
                    ) : null}
                  </div>

                  {/* Bed Occupancy Gauge */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Network Occupancy</span>
                      <span className="font-mono font-medium">{occupancy}%</span>
                    </div>
                    <Progress value={occupancy} />
                  </div>

                  {/* Live ICU Quick-Stepper */}
                  <div className="rounded-lg border border-border/80 bg-muted/40 p-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider">
                        Available ICU Beds
                      </div>
                      <div className="text-lg font-bold font-mono text-cyan-400">
                        {availIcu}{' '}
                        <span className="text-xs font-normal text-muted-foreground">
                          / {h.beds_icu || 24} ICU
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickIcuAdjust(h, -1)}
                        title="Decrement available ICU beds"
                        className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground hover:text-white transition-colors"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleQuickIcuAdjust(h, 1)}
                        title="Increment available ICU beds"
                        className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground hover:text-white transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{h.beds_total} Total Beds</span>
                  <button
                    onClick={() => openEditModal(h)}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium py-1 px-2 rounded hover:bg-cyan-950/30 transition-colors"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Edit Telemetry</span>
                  </button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Capacity Modal */}
      {editingHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{editingHospital.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {editingHospital.city}, {editingHospital.state} · {editingHospital.type}
                </p>
              </div>
              <button
                onClick={() => setEditingHospital(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              {/* ICU Stepper */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Available ICU Beds</div>
                  <div className="text-xs text-zinc-400">Live critical care capacity</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditIcu((c) => Math.max(0, c - 1))}
                    className="size-8 rounded border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 text-white"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="font-mono text-lg font-bold w-8 text-center text-cyan-400">
                    {editIcu}
                  </span>
                  <button
                    onClick={() => setEditIcu((c) => c + 1)}
                    className="size-8 rounded border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 text-white"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              {/* Total Beds Stepper */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Total Inpatient Beds</div>
                  <div className="text-xs text-zinc-400">Overall institutional capacity</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditTotalBeds((c) => Math.max(10, c - 10))}
                    className="size-8 rounded border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 text-white text-xs font-mono"
                  >
                    -10
                  </button>
                  <span className="font-mono text-lg font-bold w-12 text-center text-white">
                    {editTotalBeds}
                  </span>
                  <button
                    onClick={() => setEditTotalBeds((c) => c + 10)}
                    className="size-8 rounded border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 text-white text-xs font-mono"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* Cashless PMJAY Toggle */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">AB-PMJAY Cashless Empanelment</div>
                  <div className="text-xs text-zinc-400">HBP 2.2 Golden Card acceptance</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditPmjay(!editPmjay)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    editPmjay
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {editPmjay ? 'Active (Cashless)' : 'Inactive (Private)'}
                </button>
              </div>

              {/* Status Toggle */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Operational Network Status</div>
                  <div className="text-xs text-zinc-400">Allow emergency and search discovery</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    editActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {editActive ? 'Operational' : 'Surge Divert (Inactive)'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingHospital(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveModal}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Syncing to Network...' : 'Save & Sync across Web/Mobile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
