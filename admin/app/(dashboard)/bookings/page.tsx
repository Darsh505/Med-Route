import { DashboardHeader } from '@/components/dashboard-header'
import { BookingsTable } from '@/components/bookings-table'

export default function BookingsPage() {
  return (
    <>
      <DashboardHeader title="Bookings" description="All appointments and procedures across the network" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <BookingsTable />
      </main>
    </>
  )
}
