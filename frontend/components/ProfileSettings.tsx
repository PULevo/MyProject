"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updateProfile } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

interface ProfileSettingsProps {
  open: boolean
  onClose: () => void
}

export function ProfileSettings({ open, onClose }: ProfileSettingsProps) {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const fields: { name?: string; current_password?: string; new_password?: string } = {}
      if (name.trim() !== (user?.name ?? "")) fields.name = name.trim()
      if (newPassword) {
        fields.current_password = currentPassword
        fields.new_password = newPassword
      }
      if (Object.keys(fields).length === 0) { onClose(); return }
      await updateProfile(fields)
      toast.success("Profile updated")
      await refreshUser()
      setCurrentPassword("")
      setNewPassword("")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Profile settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <hr className="border-border" />

          <p className="text-xs text-muted font-[family-name:var(--font-syne)] uppercase tracking-widest">
            Change password
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="profile-current-pw">Current password</Label>
            <Input
              id="profile-current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-new-pw">New password</Label>
            <Input
              id="profile-new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
