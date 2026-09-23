'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Users as UsersIcon } from 'lucide-react'

import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { fetchUsers, UserRecord } from '@/lib/api'

function initials(name: string) {
  return name
    .replace(/^(Dr\.)\s*/i, '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchUsers()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <>
      <DashboardHeader
        title="User & Staff Registry"
        description="Patients, medical directors, hospital administrators, and NHA nodal officers"
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Card className="hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <UsersIcon className="size-4 text-cyan-400" />
                Network Users ({users.length})
              </CardTitle>
              <CardDescription>Role-based access permissions and verification</CardDescription>
            </div>
            <button
              onClick={loadUsers}
              title="Refresh users"
              className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground transition-colors"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </CardHeader>

          <CardContent className="px-0 pt-0">
            {loading && users.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                <RefreshCw className="size-4 animate-spin mr-2" />
                Loading user directory...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">City</TableHead>
                      <TableHead className="hidden lg:table-cell">Joined</TableHead>
                      <TableHead className="pr-6 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback className="bg-zinc-800 text-cyan-400 font-medium">
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-white">{u.name}</div>
                              <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              u.role.includes('Director') || u.role.includes('Admin')
                                ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                                : 'bg-zinc-800 text-zinc-300'
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {u.city}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground tabular-nums text-xs">
                          {u.joined}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <StatusBadge status={u.status} />
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
