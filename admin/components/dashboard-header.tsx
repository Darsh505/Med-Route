'use client'

import { Bell, LogOut, Search, Settings, User } from 'lucide-react'
import { toast } from 'sonner'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const notifications = [
  { title: 'Critical triage raised', desc: 'Cardiac arrest — Fortis Heart Institute', time: '2m' },
  { title: 'Claim approved', desc: 'CLM-50219 · ₹56,000 · HDFC Ergo', time: '18m' },
  { title: 'Hospital onboarding', desc: 'Care Continental submitted documents', time: '1h' },
]

export function DashboardHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <Separator orientation="vertical" className="h-6" />

        <div className="mr-auto flex min-w-0 flex-col">
          <h1 className="truncate text-lg font-semibold leading-tight text-foreground">
            {title}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{description}</p>
        </div>

        <InputGroup className="hidden w-64 lg:flex">
          <InputGroupInput placeholder="Search hospitals, bookings…" />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
                <Bell />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-background" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.title}
                  className="flex flex-col items-start gap-0.5 py-2"
                  onClick={() => toast(n.title, { description: n.desc })}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.desc}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-10 gap-2 px-1.5 sm:px-2" aria-label="Account menu">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    RI
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">Raghav Iyer</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => toast('Opening profile…')}>
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast('Opening settings…')}>
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => toast('Signed out')}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
