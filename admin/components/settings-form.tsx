'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SettingsForm() {
  const [emergencyAlerts, setEmergencyAlerts] = useState(true)
  const [autoRoute, setAutoRoute] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Settings saved', {
      description: 'Your network preferences have been updated.',
    })
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Details shown to partner hospitals and patients.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="org-name">Organization name</FieldLabel>
              <Input id="org-name" defaultValue="Medi Route Health Network" />
            </Field>
            <Field>
              <FieldLabel htmlFor="support-email">Support email</FieldLabel>
              <Input id="support-email" type="email" defaultValue="support@mediroute.io" />
            </Field>
            <Field>
              <FieldLabel htmlFor="region">Primary region</FieldLabel>
              <Select defaultValue="north">
                <SelectTrigger id="region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="north">North India</SelectItem>
                    <SelectItem value="south">South India</SelectItem>
                    <SelectItem value="west">West India</SelectItem>
                    <SelectItem value="east">East India</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>Used to prioritize dispatch routing.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control how your team is alerted.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal">
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="emergency-alerts">Emergency alerts</FieldLabel>
                <FieldDescription>Push notifications for critical triage cases.</FieldDescription>
              </div>
              <Switch id="emergency-alerts" checked={emergencyAlerts} onCheckedChange={setEmergencyAlerts} />
            </Field>
            <FieldSeparator />
            <Field orientation="horizontal">
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="auto-route">Automatic routing</FieldLabel>
                <FieldDescription>Route cases to nearest available hospital.</FieldDescription>
              </div>
              <Switch id="auto-route" checked={autoRoute} onCheckedChange={setAutoRoute} />
            </Field>
            <FieldSeparator />
            <Field orientation="horizontal">
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="weekly-digest">Weekly digest</FieldLabel>
                <FieldDescription>Summary of bookings and claims every Monday.</FieldDescription>
              </div>
              <Switch id="weekly-digest" checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  )
}
