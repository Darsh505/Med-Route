'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Building2,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  Settings,
  Siren,
  Stethoscope,
  Users,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const platformNav = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Hospitals', href: '/hospitals', icon: Building2, badge: '482' },
  { title: 'Bookings', href: '/bookings', icon: CalendarCheck },
  { title: 'Cashless Claims', href: '/claims', icon: FileText },
]

const opsNav = [
  { title: 'Emergency Triage', href: '/emergency', icon: Siren, badge: '6' },
  { title: 'Users', href: '/users', icon: Users },
  { title: 'Settings', href: '/settings', icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Stethoscope className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-sidebar-foreground">Medi Route</span>
            <span className="text-xs text-sidebar-foreground/60">Admin Console</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(pathname, item.href)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {opsNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(pathname, item.href)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge ? (
                    <SidebarMenuBadge className="bg-red-500/90 text-white">
                      {item.badge}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-2.5">
          <Avatar className="size-9">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              RI
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              Raghav Iyer
            </span>
            <span className="flex items-center gap-1 truncate text-xs text-sidebar-foreground/60">
              <Activity className="size-3" />
              Platform Admin
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
