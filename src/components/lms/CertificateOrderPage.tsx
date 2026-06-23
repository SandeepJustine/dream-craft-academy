'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Award,
  GraduationCap,
  Building2,
  Smartphone,
  Phone,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  ShoppingBag,
  Receipt,
  Copy,
  Check,
  Mail,
  Lock,
  AlertCircle,
  Package,
} from 'lucide-react'

// ─── Pricing & Eligibility ──────────────────────────────────────────────────
const CERTIFICATE_PRICE_USD = 25
const DIPLOMA_PRICE_USD = 40
const MWK_PER_USD = 1750 // Exchange rate: $1 ≈ MK 1,750
const CERTIFICATE_COURSE_REQUIREMENT = 7
const DIPLOMA_COURSE_REQUIREMENT = 12

function usdToMwk(usd: number): number {
  return usd * MWK_PER_USD
}

function formatMwk(amount: number): string {
  return `MK ${amount.toLocaleString()}`
}

function formatPriceWithMwk(usd: number): string {
  return `$${usd} (${formatMwk(usdToMwk(usd))})`
}

interface OrderRecord {
  id: string
  orderType: string
  quantity: number
  amount: number
  currency: string
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  paymentReference?: string | null
  recipientName: string
  recipientEmail?: string | null
  recipientPhone?: string | null
  notes?: string | null
  adminNotes?: string | null
  createdAt: string
  certificate?: {
    course: { title: string } | null
  } | null
}

interface EligibilityData {
  completedCourses: number
  canOrderCertificate: boolean
  canOrderDiploma: boolean
  existingOrders: { certificate: number; diploma: number }
}

export function CertificateOrderPage() {
  const { currentUser, navigate, selectedCertificateId } = useAppStore()
  const [step, setStep] = useState<'select' | 'payment' | 'details' | 'confirm' | 'success'>('select')
  const [orderType, setOrderType] = useState<'certificate' | 'diploma'>('certificate')
  const [certificateId, setCertificateId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'airtel_money' | 'tnm_mpamba'>('bank')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null)
  const [myOrders, setMyOrders] = useState<OrderRecord[]>([])
  const [showOrders, setShowOrders] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(true)

  // Form fields
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (currentUser) {
      setRecipientName(currentUser.name || '')
      setRecipientEmail(currentUser.email || '')
    }
  }, [currentUser])

  useEffect(() => {
    if (selectedCertificateId) {
      setCertificateId(selectedCertificateId)
    }
    if (currentUser) {
      checkEligibility()
      fetchMyOrders()
    }
  }, [selectedCertificateId, currentUser])

  const checkEligibility = async () => {
    if (!currentUser) return
    setCheckingEligibility(true)
    try {
      // Count completed courses from enrollments
      const res = await fetch(`/api/enroll?userId=${currentUser.id}`)
      if (res.ok) {
        const data = await res.json()
        const completed = (data.enrollments || []).filter((e: { status: string }) => e.status === 'completed').length

        // Count existing orders
        const ordersRes = await fetch(`/api/certificate-orders?userId=${currentUser.id}`)
        let existingOrders = { certificate: 0, diploma: 0 }
        if (ordersRes.ok) {
          const orders = await ordersRes.json()
          const activeOrders = orders.filter((o: OrderRecord) => o.orderStatus !== 'cancelled')
          existingOrders = {
            certificate: activeOrders.filter((o: OrderRecord) => o.orderType === 'certificate').length,
            diploma: activeOrders.filter((o: OrderRecord) => o.orderType === 'diploma').length,
          }
        }

        setEligibility({
          completedCourses: completed,
          canOrderCertificate: completed >= CERTIFICATE_COURSE_REQUIREMENT,
          canOrderDiploma: completed >= DIPLOMA_COURSE_REQUIREMENT,
          existingOrders,
        })
      }
    } catch { /* silent */ }
    finally { setCheckingEligibility(false) }
  }

  const fetchMyOrders = async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/certificate-orders?userId=${currentUser.id}`)
      if (res.ok) {
        const data = await res.json()
        setMyOrders(data)
      }
    } catch { /* silent */ }
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const totalAmount = orderType === 'certificate' ? CERTIFICATE_PRICE_USD : DIPLOMA_PRICE_USD

  const handleSubmitOrder = async () => {
    if (!currentUser) return
    if (!recipientName.trim()) {
      setError('Please enter the recipient name')
      return
    }
    if (!recipientEmail.trim()) {
      setError('Please enter your email address for digital delivery')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/certificate-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          certificateId: certificateId || null,
          orderType,
          quantity: 1,
          amount: totalAmount,
          paymentMethod,
          paymentReference: paymentReference || null,
          recipientName,
          recipientPhone: recipientPhone || null,
          recipientEmail: recipientEmail || null,
          shippingAddress: 'Digital Delivery',
          city: null,
          country: 'Malawi',
          notes: notes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create order')
      }

      const order = await res.json()
      setCreatedOrder(order)
      setStep('success')
      fetchMyOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order')
    } finally {
      setSubmitting(false)
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank': return 'Bank Transfer'
      case 'airtel_money': return 'Airtel Money'
      case 'tnm_mpamba': return 'TNM Mpamba'
      default: return method
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Order Certificate</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Sign In Required</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Please sign in to order your certificate or diploma.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('login')}>Sign In</Button>
            <Button variant="outline" onClick={() => navigate('register')}>Create Free Account</Button>
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
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-1" />Back
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <ShoppingBag className="h-5 w-5 text-amber-700" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Order Certificate / Diploma</h1>
          </div>
          <p className="text-lg text-muted-foreground ml-13">
            Order your official digital certificate or diploma from DreamCraft Christian Institute
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Free Certificate Notice */}
        <Card className="border-emerald-200 bg-emerald-50/50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-800 mb-1">Free Certificate of Completion</h3>
                <p className="text-sm text-emerald-700">
                  Every student receives a <strong>free digital Certificate of Completion</strong> for each course they finish successfully.
                  This page is for ordering an <strong>official digital certificate or diploma</strong> that validates your cumulative studies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Orders Toggle */}
        {myOrders.length > 0 && (
          <div className="mb-6">
            <Button variant="outline" onClick={() => setShowOrders(!showOrders)} className="gap-2">
              <Package className="h-4 w-4" />My Orders ({myOrders.length})
            </Button>
          </div>
        )}

        {/* Existing Orders */}
        {showOrders && myOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">My Orders</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {myOrders.map((order) => (
                <Card key={order.id} className="border-border/50">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {order.orderType === 'diploma' ? (
                            <GraduationCap className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Award className="h-4 w-4 text-amber-600" />
                          )}
                          <span className="font-semibold text-foreground capitalize">{order.orderType}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatDate(order.createdAt)}</span>
                          <span>•</span>
                          <span>${order.amount} ({formatMwk(order.amount * MWK_PER_USD)})</span>
                          <span>•</span>
                          <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                        </div>
                        {order.adminNotes && (
                          <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded">
                            <strong>Admin Note:</strong> {order.adminNotes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getPaymentStatusColor(order.paymentStatus)} text-xs`}>{order.paymentStatus}</Badge>
                        <Badge className={`${getOrderStatusColor(order.orderStatus)} text-xs`}>{order.orderStatus}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Separator className="my-6" />
          </div>
        )}

        {/* Checking eligibility */}
        {checkingEligibility ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Checking your eligibility...</span>
          </div>
        ) : (
          <>
            {/* Step Progress */}
            {step !== 'success' && (
              <div className="mb-8">
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  {[
                    { key: 'select', label: 'Select', icon: Award },
                    { key: 'payment', label: 'Payment', icon: CreditCard },
                    { key: 'details', label: 'Details', icon: Mail },
                    { key: 'confirm', label: 'Confirm', icon: CheckCircle2 },
                  ].map((s, idx) => {
                    const stepOrder = ['select', 'payment', 'details', 'confirm']
                    const currentIdx = stepOrder.indexOf(step)
                    const thisIdx = idx
                    const isActive = step === s.key
                    const isCompleted = currentIdx > thisIdx
                    return (
                      <div key={s.key} className="flex items-center gap-1 sm:gap-2">
                        {idx > 0 && <div className={`h-0.5 w-4 sm:w-8 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />}
                        <div className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                          isActive ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <s.icon className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{s.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step: Select Type */}
            {step === 'select' && eligibility && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Choose Your Document</h2>
                <p className="text-muted-foreground text-center mb-6">
                  You have completed <strong className="text-foreground">{eligibility.completedCourses}</strong> course{eligibility.completedCourses !== 1 ? 's' : ''}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Certificate Card */}
                  <Card className={`transition-all ${
                    eligibility.canOrderCertificate
                      ? 'cursor-pointer hover:shadow-md ' + (orderType === 'certificate' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50')
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                    onClick={() => eligibility.canOrderCertificate && setOrderType('certificate')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 mx-auto mb-4">
                        <Award className="h-7 w-7 text-amber-700" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Certificate</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Official digital certificate validating your cumulative studies
                      </p>
                      <p className="text-2xl font-bold text-primary">{formatPriceWithMwk(CERTIFICATE_PRICE_USD)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Digital delivery via email</p>

                      {eligibility.canOrderCertificate ? (
                        <Badge className="mt-3 bg-emerald-100 text-emerald-800 border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Eligible — {eligibility.completedCourses} courses completed
                        </Badge>
                      ) : (
                        <div className="mt-3">
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Lock className="h-3 w-3 mr-1" />
                            Requires {CERTIFICATE_COURSE_REQUIREMENT} courses
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            Complete {CERTIFICATE_COURSE_REQUIREMENT - eligibility.completedCourses} more course{CERTIFICATE_COURSE_REQUIREMENT - eligibility.completedCourses !== 1 ? 's' : ''} to unlock
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Diploma Card */}
                  <Card className={`transition-all ${
                    eligibility.canOrderDiploma
                      ? 'cursor-pointer hover:shadow-md ' + (orderType === 'diploma' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50')
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                    onClick={() => eligibility.canOrderDiploma && setOrderType('diploma')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 mx-auto mb-4">
                        <GraduationCap className="h-7 w-7 text-emerald-700" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Diploma</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Official digital diploma with comprehensive credential validation
                      </p>
                      <p className="text-2xl font-bold text-primary">{formatPriceWithMwk(DIPLOMA_PRICE_USD)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Digital delivery via email</p>

                      {eligibility.canOrderDiploma ? (
                        <Badge className="mt-3 bg-emerald-100 text-emerald-800 border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Eligible — {eligibility.completedCourses} courses completed
                        </Badge>
                      ) : (
                        <div className="mt-3">
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Lock className="h-3 w-3 mr-1" />
                            Requires {DIPLOMA_COURSE_REQUIREMENT} courses
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            Complete {DIPLOMA_COURSE_REQUIREMENT - eligibility.completedCourses} more course{DIPLOMA_COURSE_REQUIREMENT - eligibility.completedCourses !== 1 ? 's' : ''} to unlock
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Digital Delivery Notice */}
                <div className="mt-6">
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-1">Digital Delivery</h4>
                          <p className="text-sm text-blue-700">
                            This is a <strong>digital certificate/diploma</strong> that will be sent to your email address
                            within <strong>1 week</strong> after your payment is confirmed. No physical shipping required.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* How it works (like Christian Leaders Institute) */}
                <div className="mt-4">
                  <Card className="border-border/50">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-foreground mb-3">How It Works</h4>
                      <div className="space-y-3">
                        {[
                          { step: '1', title: 'Complete Courses', desc: 'Finish the required number of courses to become eligible' },
                          { step: '2', title: 'Place Your Order', desc: 'Select your document type and proceed to checkout' },
                          { step: '3', title: 'Make Payment', desc: 'Pay via Bank Transfer, Airtel Money, or TNM Mpamba' },
                          { step: '4', title: 'Receive by Email', desc: 'Your digital certificate/diploma is emailed within 1 week after payment confirmation' },
                        ].map((item) => (
                          <div key={item.step} className="flex items-start gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                              {item.step}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 text-center">
                  <Button
                    className="bg-primary hover:bg-primary/90 px-8"
                    onClick={() => setStep('payment')}
                    disabled={(orderType === 'certificate' && !eligibility.canOrderCertificate) || (orderType === 'diploma' && !eligibility.canOrderDiploma)}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Payment Method */}
            {step === 'payment' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Choose Payment Method</h2>
                <p className="text-muted-foreground text-center mb-6">Select how you would like to pay {formatPriceWithMwk(totalAmount)}</p>

                <div className="space-y-4">
                  {/* Bank Transfer */}
                  <Card className={`cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'bank' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`}
                    onClick={() => setPaymentMethod('bank')}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 shrink-0">
                          <Building2 className="h-6 w-6 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">Bank Transfer</h3>
                          <p className="text-sm text-muted-foreground">Transfer directly to our bank account</p>
                        </div>
                        {paymentMethod === 'bank' && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Airtel Money */}
                  <Card className={`cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'airtel_money' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`}
                    onClick={() => setPaymentMethod('airtel_money')}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 shrink-0">
                          <Smartphone className="h-6 w-6 text-red-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">Airtel Money</h3>
                          <p className="text-sm text-muted-foreground">Pay using Airtel Money Malawi</p>
                        </div>
                        {paymentMethod === 'airtel_money' && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                      </div>
                    </CardContent>
                  </Card>

                  {/* TNM Mpamba */}
                  <Card className={`cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'tnm_mpamba' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`}
                    onClick={() => setPaymentMethod('tnm_mpamba')}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 shrink-0">
                          <Phone className="h-6 w-6 text-orange-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">TNM Mpamba</h3>
                          <p className="text-sm text-muted-foreground">Pay using TNM Mpamba mobile money</p>
                        </div>
                        {paymentMethod === 'tnm_mpamba' && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Details */}
                <div className="mt-6">
                  <Card className="border-border/50 bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        Payment Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {paymentMethod === 'bank' && (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Transfer the exact amount to the following bank account and enter the transaction reference below.
                          </p>
                          <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
                            {[
                              { label: 'Bank Name', value: 'National Bank of Malawi' },
                              { label: 'Account Name', value: 'DreamCraft Christian Institute' },
                              { label: 'Account Number', value: '731234567890' },
                              { label: 'Branch', value: 'Lilongwe Branch' },
                              { label: 'Sort Code', value: '03-12-34' },
                              { label: 'SWIFT Code', value: 'NBMAMWMX' },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopy(item.value, item.label)}>
                                    {copiedField === item.label ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-800">
                              <strong>Amount to pay:</strong> {formatPriceWithMwk(totalAmount)}
                              <br />
                              <strong>Important:</strong> Use your name and &quot;CERT&quot; as the payment reference.
                            </p>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'airtel_money' && (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Send money via Airtel Money to the number below, then enter the transaction ID.
                          </p>
                          <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
                            {[
                              { label: 'Business Name', value: 'DreamCraft Christian Institute' },
                              { label: 'Airtel Money Number', value: '+265 998 765 432' },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopy(item.value, item.label)}>
                                    {copiedField === item.label ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs text-red-800 font-medium mb-2">How to pay with Airtel Money:</p>
                            <ol className="text-xs text-red-700 space-y-1 list-decimal list-inside">
                              <li>Dial <strong>*301#</strong> on your Airtel phone</li>
                              <li>Select <strong>&quot;Send Money&quot;</strong></li>
                              <li>Enter the business number: <strong>+265 998 765 432</strong></li>
                              <li>Enter amount: <strong>{formatMwk(usdToMwk(totalAmount))}</strong></li>
                              <li>Enter your PIN to confirm</li>
                              <li>Save the transaction ID you receive</li>
                            </ol>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'tnm_mpamba' && (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Send money via TNM Mpamba to the number below, then enter the transaction ID.
                          </p>
                          <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
                            {[
                              { label: 'Business Name', value: 'DreamCraft Christian Institute' },
                              { label: 'TNM Mpamba Number', value: '+265 888 765 432' },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopy(item.value, item.label)}>
                                    {copiedField === item.label ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-xs text-orange-800 font-medium mb-2">How to pay with TNM Mpamba:</p>
                            <ol className="text-xs text-orange-700 space-y-1 list-decimal list-inside">
                              <li>Dial <strong>*351#</strong> on your TNM phone</li>
                              <li>Select <strong>&quot;Send Money&quot;</strong></li>
                              <li>Enter the business number: <strong>+265 888 765 432</strong></li>
                              <li>Enter amount: <strong>{formatMwk(usdToMwk(totalAmount))}</strong></li>
                              <li>Enter your PIN to confirm</li>
                              <li>Save the transaction ID you receive</li>
                            </ol>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
                  <Button className="bg-primary hover:bg-primary/90 px-8" onClick={() => setStep('details')}>Continue</Button>
                </div>
              </div>
            )}

            {/* Step: Details */}
            {step === 'details' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Your Details</h2>
                <p className="text-muted-foreground text-center mb-6">Provide your information for digital delivery</p>

                <Card className="border-border/50">
                  <CardContent className="p-6 space-y-5">
                    {/* Digital Delivery Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                      <Mail className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Your digital {orderType} will be sent to the email address below within <strong>1 week</strong> after payment confirmation.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="recipientName">Full Name *</Label>
                      <Input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Enter your full name as it should appear on the document" className="mt-1.5" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recipientEmail">Email Address *</Label>
                        <Input id="recipientEmail" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="your@email.com" className="mt-1.5" />
                        <p className="text-xs text-muted-foreground mt-1">Digital certificate will be sent here</p>
                      </div>
                      <div>
                        <Label htmlFor="recipientPhone">Phone Number</Label>
                        <Input id="recipientPhone" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="+265 ..." className="mt-1.5" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="paymentReference">
                        <CreditCard className="h-3.5 w-3.5 inline mr-1" />
                        Payment Reference / Transaction ID
                      </Label>
                      <Input id="paymentReference" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder={paymentMethod === 'bank' ? 'Bank transaction reference' : 'Mobile money transaction ID'}
                        className="mt-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the reference from your {getPaymentMethodLabel(paymentMethod)} transaction
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special instructions..." className="mt-1.5" rows={2} />
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-8 flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                  <Button className="bg-primary hover:bg-primary/90 px-8" onClick={() => setStep('confirm')}>Review Order</Button>
                </div>
              </div>
            )}

            {/* Step: Confirm */}
            {step === 'confirm' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Review Your Order</h2>
                <p className="text-muted-foreground text-center mb-6">Please confirm the details before submitting</p>

                <Card className="border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Summary</h3>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          {orderType === 'diploma' ? <GraduationCap className="h-4 w-4 text-amber-600" /> : <Award className="h-4 w-4 text-amber-600" />}
                          <span className="font-medium text-foreground capitalize">Digital {orderType}</span>
                        </div>
                        <span className="font-medium">{formatPriceWithMwk(totalAmount)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between py-2">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-xl font-bold text-primary">{formatPriceWithMwk(totalAmount)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Payment</h3>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">Method</span>
                        <span className="font-medium text-foreground">{getPaymentMethodLabel(paymentMethod)}</span>
                      </div>
                      {paymentReference && (
                        <div className="flex items-center justify-between py-1 text-sm">
                          <span className="text-muted-foreground">Reference</span>
                          <span className="font-mono text-foreground">{paymentReference}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Delivery</h3>
                      <div className="flex items-start gap-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">{recipientEmail}</p>
                          <p className="text-xs text-muted-foreground">Digital {orderType} will be sent within 1 week after payment confirmation</p>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground w-20 shrink-0">Name:</span>
                          <span className="font-medium text-foreground">{recipientName}</span>
                        </div>
                        {recipientPhone && (
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground w-20 shrink-0">Phone:</span>
                            <span className="text-foreground">{recipientPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {notes && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
                          <p className="text-sm text-foreground">{notes}</p>
                        </div>
                      </>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>
                    )}
                  </CardContent>
                </Card>

                <div className="mt-8 flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setStep('details')}>Back</Button>
                  <Button className="bg-primary hover:bg-primary/90 px-8" onClick={handleSubmitOrder} disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4 mr-2" />Submit Order</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Success */}
            {step === 'success' && createdOrder && (
              <div className="max-w-lg mx-auto text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Order Submitted!</h2>
                <p className="text-muted-foreground mb-6">
                  Your digital {createdOrder.orderType} order has been received. Once your payment is confirmed, it will be emailed to you within 1 week.
                </p>

                <Card className="border-border/50 text-left mb-6">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono text-foreground">{createdOrder.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="capitalize font-medium text-foreground">Digital {createdOrder.orderType}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold text-primary">{formatPriceWithMwk(createdOrder.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="text-foreground">{getPaymentMethodLabel(createdOrder.paymentMethod)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment Status</span>
                      <Badge className={`${getPaymentStatusColor(createdOrder.paymentStatus)} text-xs`}>{createdOrder.paymentStatus}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Digital Delivery</p>
                        <p className="text-xs text-muted-foreground">Will be sent to {recipientEmail} within 1 week after payment confirmation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('dashboard')}>
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('certificates')}>
                    My Certificates
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
