import { DashboardHeader } from '@/components/dashboard-header'
import { SettingsForm } from '@/components/settings-form'

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader title="Settings" description="Manage your network and notification preferences" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="w-full max-w-2xl">
          <SettingsForm />
        </div>
      </main>
    </>
  )
}
