import { DashboardHeader } from '@/components/dashboard-header'
import { HospitalsDirectory } from '@/components/hospitals-directory'

export default function HospitalsPage() {
  return (
    <>
      <DashboardHeader title="Hospitals" description="Partner network directory and capacity" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <HospitalsDirectory />
      </main>
    </>
  )
}
