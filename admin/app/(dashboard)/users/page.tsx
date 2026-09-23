import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { users } from '@/lib/data'

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
  return (
    <>
      <DashboardHeader title="Users" description="Patients, hospital staff, and platform team" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Card>
          <CardContent className="px-0">
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
                    <TableRow key={u.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback>{initials(u.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium">{u.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{u.role}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {u.city}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground tabular-nums">
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
          </CardContent>
        </Card>
      </main>
    </>
  )
}
