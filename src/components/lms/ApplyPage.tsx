'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  GraduationCap,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  BookOpen,
  Heart,
  ArrowRight,
} from 'lucide-react'

export function ApplyPage() {
  const { navigate } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    testimony: '',
    courseInterest: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      
      if (res.ok) {
        const data = await res.json()
        useAppStore.getState().setUser(data.user)
        setSubmitted(true)
        toast.success('Application submitted successfully!')
      } else {
        toast.error('Failed to submit application')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Application Received!
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Thank you for applying to DreamCraft Christian Institute. We&apos;re excited to have you join our community of learners.
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-muted-foreground">
              Your application is being reviewed. In the meantime, you can start exploring our courses.
            </p>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('courses')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <GraduationCap className="h-7 w-7" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Apply Now
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Begin your journey of faith and learning. Admission is free — all we need is your commitment to grow.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="Enter first name"
                          className="pl-9"
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="+265 ..."
                          className="pl-9"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="country"
                        placeholder="Your country"
                        className="pl-9"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseInterest">Course of Interest</Label>
                    <Select
                      value={form.courseInterest}
                      onValueChange={(value) => setForm({ ...form, courseInterest: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="christian-leadership">Introduction to Christian Leadership</SelectItem>
                        <SelectItem value="biblical-foundations">Biblical Foundations</SelectItem>
                        <SelectItem value="management">Introduction to Management</SelectItem>
                        <SelectItem value="discipleship">Christian Discipleship</SelectItem>
                        <SelectItem value="gospel-ministry">Gospel-Centered Ministry</SelectItem>
                        <SelectItem value="spiritual-growth">Spiritual Growth & Formation</SelectItem>
                        <SelectItem value="church-history">Church History & Theology</SelectItem>
                        <SelectItem value="counseling">Christian Counseling Basics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testimony">Your Christian Testimony (Optional)</Label>
                    <Textarea
                      id="testimony"
                      placeholder="Share briefly how you came to know Christ and why you want to study with us..."
                      rows={4}
                      value={form.testimony}
                      onChange={(e) => setForm({ ...form, testimony: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 h-11"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <GraduationCap className="h-4 w-4 mr-2" />
                    )}
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-gradient-to-br from-amber-50 to-emerald-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Admission Criteria</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    A personal faith in Jesus Christ as Lord and Savior
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    A desire to grow in biblical knowledge and practical skills
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    Commitment to completing enrolled courses
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    Willingness to serve in your community
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    No tuition fees — education is 100% free
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">What You Get</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    Access to all courses
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary shrink-0" />
                    24/7 student support
                  </li>
                  <li className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                    Certificates of completion
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary shrink-0" />
                    Global community access
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
