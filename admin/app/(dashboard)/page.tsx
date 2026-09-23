import { DashboardHeader } from '@/components/dashboard-header'
import { MetricCards } from '@/components/dashboard/metric-cards'
import { BookingsChart } from '@/components/dashboard/bookings-chart'
import { ClaimsDonut } from '@/components/dashboard/claims-donut'
import { RecentBookings } from '@/components/dashboard/recent-bookings'
import { TriageFeed } from '@/components/dashboard/triage-feed'

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader
        title="Overview"
        description="Network health across 482 partner hospitals"
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <MetricCards />
        <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-3">
          <BookingsChart />
          <ClaimsDonut />
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-3">
          <RecentBookings />
          <TriageFeed />
        </div>
      </main>
    </>
  )
}
