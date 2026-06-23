'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Camera,
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  Globe,
  BookOpen,
  Calendar,
  Shield,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string | null
  email: string
  avatar: string | null
  role: string
  bio: string | null
  phone: string | null
  country: string | null
  enrolledAt: string
  createdAt: string
  _count?: {
    enrollments: number
    certificates: number
  }
}

export function ProfilePage() {
  const { currentUser, setUser, navigate } = useAppStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch full profile
  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/auth?userId=${currentUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
          setName(data.name || '')
          setBio(data.bio || '')
          setPhone(data.phone || '')
          setCountry(data.country || '')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [currentUser])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    setUploading(true)
    setError(null)

    try {
      // Upload the file
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json()
        throw new Error(uploadData.error || 'Upload failed')
      }

      const { url } = await uploadRes.json()

      // Update user avatar
      const updateRes = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          userId: currentUser.id,
          avatar: url,
        }),
      })

      if (!updateRes.ok) {
        throw new Error('Failed to update avatar')
      }

      const { user: updatedUser } = await updateRes.json()

      // Update store
      setUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      })

      // Update local profile
      setProfile((prev) => prev ? { ...prev, avatar: url } : prev)
    } catch (err) {
      console.error('Error uploading photo:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSave = async () => {
    if (!currentUser) return

    setSaving(true)
    setSaveSuccess(false)
    setError(null)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          userId: currentUser.id,
          name: name || undefined,
          bio: bio || undefined,
          phone: phone || undefined,
          country: country || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      const { user: updatedUser } = await res.json()

      // Update store
      setUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      })

      // Update local profile
      setProfile(updatedUser)
      setSaveSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentUser) return

    setPasswordError(null)
    setPasswordSuccess(false)

    if (!currentPassword.trim()) {
      setPasswordError('Please enter your current password')
      return
    }
    if (!newPassword.trim()) {
      setPasswordError('Please enter a new password')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          userId: currentUser.id,
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setPasswordError(data.error || 'Failed to change password')
        return
      }

      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch {
      setPasswordError('Something went wrong. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('login')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  const displayName = profile?.name || currentUser.name || 'Student'
  const displayAvatar = profile?.avatar || currentUser.avatar

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-emerald-50 py-8 sm:py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('dashboard')}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Profile updated successfully!
          </div>
        )}

        {/* Profile Header Card */}
        <Card className="border-border/50 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-amber-100 via-amber-50 to-emerald-100" />
          <CardContent className="p-6 -mt-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={displayAvatar || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  aria-label="Upload profile photo"
                />
              </div>

              {/* Name & Info */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {currentUser.email}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs capitalize">
                    <Shield className="h-3 w-3 mr-1" />
                    {profile?.role || currentUser.role || 'Student'}
                  </Badge>
                </div>
              </div>

              {/* Change Photo Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="shrink-0"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 mr-1.5" />
                )}
                {uploading ? 'Uploading...' : 'Change Photo'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Form */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Profile Details</h3>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="max-w-md"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={currentUser.email}
                  disabled
                  className="max-w-md bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                  className="max-w-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center gap-3">
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setName(profile?.name || '')
                  setBio(profile?.bio || '')
                  setPhone(profile?.phone || '')
                  setCountry(profile?.country || '')
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Section */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Member Since */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-semibold text-foreground">
                    {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-semibold text-foreground capitalize">
                    {profile?.role || currentUser.role || 'Student'}
                  </p>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enrolled Courses</p>
                  <p className="text-sm font-semibold text-foreground">
                    {profile?._count?.enrollments ?? '—'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
            </div>

            {passwordError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20 mb-4">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm border border-emerald-200 flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Password changed successfully!
              </div>
            )}

            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm font-medium flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password-change" className="text-sm font-medium flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password-change"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password-change" className="text-sm font-medium flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password-change"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Re-enter your new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPasswords ? 'Hide' : 'Show'} passwords
                </button>
              </div>

              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleChangePassword}
                disabled={changingPassword || !currentPassword || !newPassword || !confirmNewPassword}
              >
                {changingPassword ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4 mr-1.5" />
                )}
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
