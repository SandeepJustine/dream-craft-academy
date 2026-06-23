'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Award,
  BookOpen,
  GraduationCap,
  Trophy,
  Calendar,
  ExternalLink,
  ArrowRight,
  Star,
} from 'lucide-react'

interface CertificateListItem {
  id: string
  userId: string
  courseId: string
  enrollmentId: string
  certificateNumber: string
  finalGrade: number
  issuedAt: string
  course: {
    id: string
    title: string
    category: string
    level: string
    duration: string
    instructor: string
    image: string | null
  } | null
}

export function CertificatesList() {
  const { currentUser, navigate } = useAppStore()
  const [certificates, setCertificates] = useState<CertificateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser) {
      fetchCertificates()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`/api/certificates?userId=${currentUser!.id}`)
      if (!res.ok) throw new Error('Failed to fetch certificates')
      const data = await res.json()
      setCertificates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getGradeLabel = (grade: number) => {
    if (grade >= 90) return 'Distinction'
    if (grade >= 80) return 'Merit'
    if (grade >= 70) return 'Pass'
    return 'Pass'
  }

  const getGradeBadgeClass = (grade: number) => {
    if (grade >= 90) return 'bg-amber-100 text-amber-800 border-amber-200'
    if (grade >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    return 'bg-primary/10 text-primary border-primary/20'
  }

  const handleViewCertificate = (certId: string) => {
    navigate('certificate', { certificateId: certId })
  }

  // Redirect to login page
  const handleSignIn = () => {
    navigate('login')
  }

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              My Certificates
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Sign In Required</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Please sign in to view your earned certificates and achievements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSignIn}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => navigate('register')}>
              Create Free Account
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Award className="h-5 w-5 text-amber-700" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              My Certificates
            </h1>
          </div>
          <p className="text-lg text-muted-foreground ml-13">
            Your earned certificates and achievements from DreamCraft Christian Institute
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 p-6 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-lg mb-4" />
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="h-3 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Something Went Wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="outline" onClick={fetchCertificates}>Try Again</Button>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <Trophy className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">No Certificates Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Complete a course to earn your first certificate from DreamCraft Christian Institute. 
              Keep learning and your achievements will appear here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('courses')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
              <Button variant="outline" onClick={() => navigate('dashboard')}>
                View My Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="flex items-center gap-4 mb-8">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm px-3 py-1">
                <Award className="h-3.5 w-3.5 mr-1.5" />
                {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'} Earned
              </Badge>
              {certificates.some(c => c.finalGrade >= 90) && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-sm px-3 py-1">
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  Distinction Achieved
                </Badge>
              )}
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {certificates.map((cert) => (
                <Card
                  key={cert.id}
                  className="card-hover border-border/50 overflow-hidden group cursor-pointer"
                  onClick={() => handleViewCertificate(cert.id)}
                >
                  {/* Certificate Card Header */}
                  <div className="relative h-28 bg-gradient-to-br from-amber-50 via-amber-100/50 to-emerald-50 flex items-center justify-center overflow-hidden">
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(217,119,6,0.1) 10px, rgba(217,119,6,0.1) 11px)`,
                        }}
                      />
                    </div>
                    <div className="relative flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-sm border border-amber-200/50">
                        <GraduationCap className="h-6 w-6 text-amber-700" />
                      </div>
                    </div>
                    {/* Grade badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className={`${getGradeBadgeClass(cert.finalGrade)} text-xs font-bold`}>
                        {cert.finalGrade}%
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm leading-snug">
                      {cert.course?.title || 'Course'}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-[10px]">
                        {cert.course?.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {cert.course?.level}
                      </Badge>
                    </div>

                    <Separator className="mb-3" />

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>Earned {formatDate(cert.issuedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Award className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="font-mono">{cert.certificateNumber}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-sm group-hover:shadow-md transition-shadow"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewCertificate(cert.id)
                      }}
                    >
                      View Certificate
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm mt-2"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('dashboard')
                      }}
                    >
                      <Award className="h-3.5 w-3.5 mr-1.5" />
                      Order Official Certificate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Explore More */}
            <div className="mt-10 text-center">
              <Button variant="outline" onClick={() => navigate('courses')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Continue Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
