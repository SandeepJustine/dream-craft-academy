'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  calculateLetterGrade,
  getGradeColor,
  getGradeBgColor,
  getGradeLabel,
  GRADE_SCALE,
} from '@/lib/grading'
import {
  Award,
  Download,
  Share2,
  ArrowLeft,
  GraduationCap,
  Shield,
  BookOpen,
  CheckCircle2,
  Info,
} from 'lucide-react'

interface CertificateData {
  id: string
  userId: string
  courseId: string
  enrollmentId: string
  certificateNumber: string
  finalGrade: number
  letterGrade?: string
  issuedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  course: {
    id: string
    title: string
    category: string
    level: string
    duration: string
    instructor: string
  } | null
}

export function CertificateView() {
  const { selectedCertificateId, navigate, currentUser } = useAppStore()
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedCertificateId) {
      fetchCertificate()
    } else {
      setLoading(false)
      setError('No certificate selected')
    }
  }, [selectedCertificateId])

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/certificates?certificateId=${selectedCertificateId}`)
      if (!res.ok) throw new Error('Certificate not found')
      const data = await res.json()
      setCertificate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certificate')
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

  const getLetterGrade = (): string => {
    if (certificate?.letterGrade) return certificate.letterGrade
    if (certificate?.finalGrade !== undefined) return calculateLetterGrade(certificate.finalGrade)
    return 'N/A'
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14 print:hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-10 w-64 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
          <div className="w-full max-w-3xl">
            <div className="aspect-[1.414] bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14 print:hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Certificate</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center print:hidden">
          <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Certificate Not Found</h2>
          <p className="text-muted-foreground mb-8">{error || 'The requested certificate could not be found.'}</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('certificates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Certificates
          </Button>
        </div>
      </div>
    )
  }

  const letterGrade = getLetterGrade()

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
          }

          /* Move all non-certificate content off-page and collapse its space
             to prevent a second blank page from being generated */
          body * {
            visibility: hidden !important;
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          /* Restore certificate area and all its descendants */
          #certificate-print-area,
          #certificate-print-area * {
            visibility: visible !important;
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Position certificate to fill the entire printed page */
          #certificate-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 99999 !important;
          }

          #certificate-print-area > div {
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            position: static !important;
          }

          /* Certificate fills the entire page edge-to-edge */
          #certificate {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            aspect-ratio: unset !important;
            margin: 0 !important;
            box-shadow: none !important;
            position: relative !important;
          }

          /* Ensure certificate inner content uses relative positioning */
          #certificate * {
            position: relative !important;
          }

          /* Restore absolute positioning for certificate decorative elements */
          #certificate > div {
            position: absolute !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14 print:hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('certificates')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Certificate of Completion
          </h1>
          <p className="text-lg text-muted-foreground">
            View and download your official certificate
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 print:hidden">
          <Button className="bg-primary hover:bg-primary/90" onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => navigate('dashboard')}
          >
            <Award className="h-4 w-4 mr-2" />
            Order Official Certificate
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={() => navigate('certificates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            My Certificates
          </Button>
        </div>

        {/* Certificate Card */}
        <div id="certificate-print-area" className="flex justify-center">
          <div className="w-full max-w-3xl print:max-w-none print:w-screen print:h-screen">
            <div
              id="certificate"
              className="relative bg-white shadow-2xl print:shadow-none print:w-full print:h-full"
              style={{
                aspectRatio: '1.414',
                background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 30%, #fffbeb 100%)',
              }}
            >
              {/* Outer Gold Border */}
              <div
                className="absolute inset-0"
                style={{
                  border: '8px solid',
                  borderImage: 'linear-gradient(135deg, #d97706, #f59e0b, #fbbf24, #f59e0b, #d97706) 1',
                }}
              />

              {/* Inner Decorative Border */}
              <div
                className="absolute inset-3"
                style={{
                  border: '2px solid',
                  borderImage: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b, #d97706, #b45309) 1',
                }}
              />

              {/* Corner Decorations */}
              <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-amber-600" />
              <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-amber-600" />
              <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-amber-600" />
              <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-amber-600" />

              {/* Certificate Content */}
              <div className="absolute inset-6 flex flex-col items-center justify-center text-center px-4 sm:px-12 py-4">
                {/* Logo / Institution Name */}
                <div className="flex items-center gap-2 mb-1">
                  <img src="/main-logo.png" alt="DreamCraft" className="h-8 w-8 rounded-full object-cover" />
                  <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-amber-800 uppercase">
                    DreamCraft
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold tracking-[0.3em] text-amber-900 uppercase mb-1">
                  Christian Institute
                </h2>

                {/* Decorative Line */}
                <div className="flex items-center gap-2 mb-2 w-full max-w-xs">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-amber-500" />
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                </div>

                {/* Title */}
                <h1
                  className="text-lg sm:text-2xl md:text-3xl font-bold mb-1"
                  style={{
                    background: 'linear-gradient(135deg, #92400e, #b45309, #d97706)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Certificate of Completion
                </h1>

                {/* Subtitle */}
                <p className="text-[10px] sm:text-xs text-stone-500 tracking-wider uppercase mb-3">
                  This is to certify that
                </p>

                {/* Student Name */}
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground mb-1"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  {certificate.user?.name || currentUser?.name || 'Student'}
                </h3>

                {/* Decorative underline for name */}
                <div className="flex items-center gap-1 mb-3 w-full max-w-[200px] sm:max-w-[280px]">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                </div>

                {/* Description */}
                <p className="text-[10px] sm:text-xs text-stone-500 tracking-wider mb-1">
                  has successfully completed the course
                </p>

                {/* Course Title */}
                <h4
                  className="text-base sm:text-lg md:text-xl font-semibold text-foreground mb-2"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  {certificate.course?.title || 'Course'}
                </h4>

                {/* Grade with Letter Grade Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-sm sm:text-base font-bold text-amber-700">
                      {certificate.finalGrade}%
                    </span>
                  </div>
                  <Badge className={`${getGradeBgColor(letterGrade)} text-xs sm:text-sm font-bold px-2.5 py-0.5`}>
                    Grade: {letterGrade}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {getGradeLabel(letterGrade)}
                  </Badge>
                </div>

                {/* Decorative Separator */}
                <div className="flex items-center gap-2 mb-3 w-full max-w-[240px] sm:max-w-xs">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                  <BookOpen className="h-3 w-3 text-amber-400" />
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                </div>

                {/* Date and Certificate Number */}
                <div className="flex items-center gap-4 sm:gap-8 mb-4 text-[10px] sm:text-xs text-stone-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>Issued: {formatDate(certificate.issuedAt)}</span>
                  </div>
                  <span className="text-amber-400">|</span>
                  <span className="font-mono text-amber-700">
                    {certificate.certificateNumber}
                  </span>
                </div>

                {/* Signature Line */}
                <div className="flex items-end gap-6 sm:gap-12">
                  <div className="text-center">
                    <div className="w-24 sm:w-32 border-b border-stone-300 mb-1" />
                    <p className="text-[9px] sm:text-[10px] text-stone-500 tracking-wider">
                      Director of Education
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 sm:w-32 border-b border-stone-300 mb-1" />
                    <p className="text-[9px] sm:text-[10px] text-stone-500 tracking-wider">
                      Institute Seal
                    </p>
                  </div>
                </div>

                {/* Small verification text */}
                <p className="text-[8px] sm:text-[9px] text-stone-400 mt-3 tracking-wider">
                  Verify at dreamcraftinstitute.org/verify/{certificate.certificateNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Details Section */}
        <div className="mt-8 max-w-3xl mx-auto print:hidden">
          <Card className="border-border/50 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Certificate Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Certificate Number</p>
                <p className="font-mono text-sm font-semibold text-amber-700">
                  {certificate.certificateNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Final Grade</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {certificate.finalGrade}%
                  </p>
                  <Badge className={`${getGradeBgColor(letterGrade)} text-xs font-bold`}>
                    {letterGrade}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    — {getGradeLabel(letterGrade)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Course</p>
                <p className="text-sm font-semibold text-foreground">
                  {certificate.course?.title}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Instructor</p>
                <p className="text-sm font-semibold text-foreground">
                  {certificate.course?.instructor}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date Issued</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(certificate.issuedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <p className="text-sm font-semibold text-foreground">
                  {certificate.course?.category} · {certificate.course?.level}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Award className="h-4 w-4 text-amber-500" />
              <span>
                This certificate verifies the successful completion of the above course at DreamCraft Christian Institute.
              </span>
            </div>
          </Card>
        </div>

        {/* Grading Scale Legend */}
        <div className="mt-6 max-w-3xl mx-auto print:hidden">
          <Card className="border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">International Grading Scale</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {GRADE_SCALE.map((item) => (
                <div key={item.grade} className="flex items-center justify-between py-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getGradeBgColor(item.grade)} text-xs font-bold px-2 py-0`}>
                      {item.grade}
                    </Badge>
                    <span className="text-muted-foreground">{item.range}</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    item.grade.startsWith('A') ? 'text-emerald-600' :
                    item.grade.startsWith('B') ? 'text-blue-600' :
                    item.grade.startsWith('C') ? 'text-amber-600' :
                    item.grade.startsWith('D') ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
