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
  Building2,
  Smartphone,
  Phone,
  CheckCircle2,
  Heart,
  CreditCard,
  Loader2,
  Copy,
  Check,
  Mail,
  ArrowLeft,
  Receipt,
  Globe,
  Gift,
  HandHeart,
  Sparkles,
  Church,
} from 'lucide-react'

// ─── Constants ──────────────────────────────────────────────────────────────
const MWK_PER_USD = 1750 // Exchange rate: $1 ≈ MK 1,750

const PRESET_AMOUNTS = [
  { usd: 10, label: '$10', icon: Heart },
  { usd: 25, label: '$25', icon: Gift },
  { usd: 50, label: '$50', icon: HandHeart },
  { usd: 100, label: '$100', icon: Sparkles },
  { usd: 250, label: '$250', icon: Church },
]

function usdToMwk(usd: number): number {
  return usd * MWK_PER_USD
}

function formatMwk(amount: number): string {
  return `MK ${amount.toLocaleString()}`
}

function formatPriceWithMwk(usd: number): string {
  return `$${usd.toFixed(2)} (${formatMwk(usdToMwk(usd))})`
}

type Step = 'amount' | 'payment' | 'details' | 'confirm' | 'success'
type PaymentMethod = 'bank' | 'airtel_money' | 'tnm_mpamba'

interface DonationResult {
  id: string
  donorName: string
  donorEmail: string
  amountUsd: number
  amountMwk: number
  paymentMethod: string
  paymentStatus: string
  createdAt: string
}

export function DonationPage() {
  const { currentUser, navigate } = useAppStore()
  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState<number>(25)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isCustom, setIsCustom] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [donation, setDonation] = useState<DonationResult | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Form fields
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [message, setMessage] = useState('')

  // Pre-fill if logged in
  useEffect(() => {
    if (currentUser) {
      setDonorName(currentUser.name || '')
      setDonorEmail(currentUser.email || '')
    }
  }, [currentUser])

  const activeAmount = isCustom ? (parseFloat(customAmount) || 0) : amount
  const activeAmountMwk = usdToMwk(activeAmount)

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank': return 'Bank Transfer'
      case 'airtel_money': return 'Airtel Money'
      case 'tnm_mpamba': return 'TNM Mpamba'
      default: return method
    }
  }

  const handleSubmitDonation = async () => {
    if (!donorName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!donorEmail.trim()) {
      setError('Please enter your email address')
      return
    }
    if (activeAmount <= 0) {
      setError('Please enter a valid donation amount')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          donorPhone: donorPhone.trim() || null,
          amountUsd: activeAmount,
          paymentMethod,
          paymentReference: paymentReference.trim() || null,
          message: message.trim() || null,
          userId: currentUser?.id || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit donation')
      }

      const result = await res.json()
      setDonation(result)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit donation')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  // ─── Success Step ─────────────────────────────────────────────────────────
  if (step === 'success' && donation) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-6 animate-pulse">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Donation Submitted!</h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Thank you for your generous contribution to DreamCraft Christian Institute. God bless you abundantly!
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          {/* Confirmation Card */}
          <Card className="border-emerald-200 bg-emerald-50/30 mb-6">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">Donation Amount</p>
                <p className="text-4xl font-bold text-primary">${donation.amountUsd.toFixed(2)}</p>
                <p className="text-lg text-muted-foreground">({formatMwk(donation.amountMwk)})</p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donor</span>
                  <span className="font-medium text-foreground">{donation.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{donation.donorEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium text-foreground">{getPaymentMethodLabel(donation.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                    {donation.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{formatDate(donation.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Confirmation Notice */}
          <Card className="border-blue-200 bg-blue-50/50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Confirmation Email Sent</h3>
                  <p className="text-sm text-blue-700">
                    A confirmation email has been sent to <strong>{donation.donorEmail}</strong>.
                    The admin has also been notified about your donation. Once your payment is verified,
                    you will receive another confirmation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-border/50 mb-8">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3">What Happens Next?</h3>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Complete Payment', desc: 'Make your payment using the details provided during checkout' },
                  { step: '2', title: 'Admin Verification', desc: 'Our team will verify your payment within 1-2 business days' },
                  { step: '3', title: 'Confirmation', desc: 'You\'ll receive an email once your donation is confirmed' },
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

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('home')}>
              Back to Home
            </Button>
            <Button variant="outline" onClick={() => {
              setStep('amount')
              setDonation(null)
              setError(null)
              setPaymentReference('')
              setMessage('')
            }}>
              Make Another Donation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('home')}>
              <ArrowLeft className="h-4 w-4 mr-1" />Back
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Support Our Mission</h1>
              <p className="text-lg text-muted-foreground">
                Your generosity helps us provide free Christian education worldwide
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mission Statement */}
        <Card className="border-primary/20 bg-primary/5 mb-8">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Church className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Why Your Donation Matters</h3>
                <p className="text-sm text-muted-foreground">
                  DreamCraft Christian Institute provides <strong>free theological education</strong> to students around the world.
                  Your donation helps us maintain our platform, develop new courses, and reach more students with the Gospel.
                  Every contribution, no matter the size, makes an eternal difference.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[
              { key: 'amount', label: 'Amount', icon: Heart },
              { key: 'payment', label: 'Payment', icon: CreditCard },
              { key: 'details', label: 'Details', icon: Mail },
              { key: 'confirm', label: 'Confirm', icon: CheckCircle2 },
            ].map((s, idx) => {
              const stepOrder = ['amount', 'payment', 'details', 'confirm']
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

        {/* Step: Amount Selection */}
        {step === 'amount' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Choose Your Donation Amount</h2>
            <p className="text-muted-foreground text-center mb-6">Select an amount or enter a custom figure</p>

            {/* Preset Amounts */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {PRESET_AMOUNTS.map((preset) => {
                const Icon = preset.icon
                const isSelected = !isCustom && amount === preset.usd
                return (
                  <Card
                    key={preset.usd}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                    onClick={() => {
                      setIsCustom(false)
                      setAmount(preset.usd)
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className={`h-5 w-5 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`text-lg font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{preset.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatMwk(usdToMwk(preset.usd))}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Custom Amount */}
            <Card className={`transition-all ${isCustom ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border/50'}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className={`h-5 w-5 ${isCustom ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Label className={`text-sm font-medium cursor-pointer ${isCustom ? 'text-primary' : 'text-foreground'}`}>
                    Custom Amount
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={customAmount}
                      onChange={(e) => {
                        setIsCustom(true)
                        setCustomAmount(e.target.value)
                      }}
                      onClick={() => setIsCustom(true)}
                      placeholder="Enter amount"
                      className="pl-7"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ <span className="font-medium text-foreground">{isCustom && customAmount ? formatMwk(usdToMwk(parseFloat(customAmount) || 0)) : '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Amount Display */}
            {activeAmount > 0 && (
              <div className="mt-6 text-center">
                <Card className="border-primary/30 bg-primary/5 inline-block">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Your Donation</p>
                    <p className="text-3xl font-bold text-primary">${activeAmount.toFixed(2)}</p>
                    <p className="text-base text-muted-foreground">({formatMwk(activeAmountMwk)})</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="mt-8 text-center">
              <Button
                className="bg-primary hover:bg-primary/90 px-8"
                onClick={() => setStep('payment')}
                disabled={activeAmount <= 0}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step: Payment Method */}
        {step === 'payment' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Choose Payment Method</h2>
            <p className="text-muted-foreground text-center mb-6">
              Select how you would like to donate <strong className="text-foreground">{formatPriceWithMwk(activeAmount)}</strong>
            </p>

            <div className="space-y-4">
              {/* Bank Transfer */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'bank' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`}
                onClick={() => setPaymentMethod('bank')}
              >
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
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'airtel_money' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`}
                onClick={() => setPaymentMethod('airtel_money')}
              >
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
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'tnm_mpamba' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`}
                onClick={() => setPaymentMethod('tnm_mpamba')}
              >
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

            {/* Payment Instructions */}
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
                        Transfer the exact amount to the following bank account and enter the transaction reference in the next step.
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
                          <strong>Amount to pay:</strong> {formatPriceWithMwk(activeAmount)}
                          <br />
                          <strong>Important:</strong> Use your name and &quot;DONATION&quot; as the payment reference.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'airtel_money' && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Send money via Airtel Money to the number below, then enter the transaction ID in the next step.
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
                          <li>Enter amount: <strong>{formatMwk(activeAmountMwk)}</strong></li>
                          <li>Enter your PIN to confirm</li>
                          <li>Save the transaction ID you receive</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'tnm_mpamba' && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Send money via TNM Mpamba to the number below, then enter the transaction ID in the next step.
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
                          <li>Enter amount: <strong>{formatMwk(activeAmountMwk)}</strong></li>
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
              <Button variant="outline" onClick={() => setStep('amount')}>Back</Button>
              <Button className="bg-primary hover:bg-primary/90 px-8" onClick={() => setStep('details')}>Continue</Button>
            </div>
          </div>
        )}

        {/* Step: Donor Details */}
        {step === 'details' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Your Details</h2>
            <p className="text-muted-foreground text-center mb-6">Provide your information for the donation receipt</p>

            <Card className="border-border/50">
              <CardContent className="p-6 space-y-5">
                {/* Email Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                  <Mail className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    A confirmation email will be sent to the email address below. The admin will also be notified about your donation.
                  </p>
                </div>

                <div>
                  <Label htmlFor="donorName">Full Name *</Label>
                  <Input
                    id="donorName"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="donorEmail">Email Address *</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Receipt will be sent here</p>
                  </div>
                  <div>
                    <Label htmlFor="donorPhone">Phone Number</Label>
                    <Input
                      id="donorPhone"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="+265 ..."
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="paymentReference">
                    <CreditCard className="h-3.5 w-3.5 inline mr-1" />
                    Payment Reference / Transaction ID
                  </Label>
                  <Input
                    id="paymentReference"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder={paymentMethod === 'bank' ? 'Bank transaction reference' : 'Mobile money transaction ID'}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the reference from your {getPaymentMethodLabel(paymentMethod)} transaction
                  </p>
                </div>

                <div>
                  <Label htmlFor="message">
                    <Heart className="h-3.5 w-3.5 inline mr-1" />
                    Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave an encouraging message or prayer..."
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
              <Button className="bg-primary hover:bg-primary/90 px-8" onClick={() => setStep('confirm')}>Review Donation</Button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Confirm Your Donation</h2>
            <p className="text-muted-foreground text-center mb-6">Review the details below and submit your donation</p>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                {/* Amount */}
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Donation Amount</p>
                  <p className="text-4xl font-bold text-primary">${activeAmount.toFixed(2)}</p>
                  <p className="text-lg text-muted-foreground">({formatMwk(activeAmountMwk)})</p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Donor Name</span>
                    <span className="font-medium text-foreground">{donorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{donorEmail}</span>
                  </div>
                  {donorPhone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium text-foreground">{donorPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium text-foreground">{getPaymentMethodLabel(paymentMethod)}</span>
                  </div>
                  {paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Reference</span>
                      <span className="font-medium text-foreground font-mono text-xs">{paymentReference}</span>
                    </div>
                  )}
                  {message && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Message</span>
                      <span className="font-medium text-foreground max-w-[200px] text-right truncate">{message}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Payment Reminder */}
                <div className={`rounded-lg p-3 ${
                  paymentMethod === 'bank' ? 'bg-blue-50 border border-blue-200' :
                  paymentMethod === 'airtel_money' ? 'bg-red-50 border border-red-200' :
                  'bg-orange-50 border border-orange-200'
                }`}>
                  <p className={`text-xs font-medium mb-1 ${
                    paymentMethod === 'bank' ? 'text-blue-800' :
                    paymentMethod === 'airtel_money' ? 'text-red-800' :
                    'text-orange-800'
                  }`}>
                    Payment Reminder
                  </p>
                  <p className={`text-xs ${
                    paymentMethod === 'bank' ? 'text-blue-700' :
                    paymentMethod === 'airtel_money' ? 'text-red-700' :
                    'text-orange-700'
                  }`}>
                    {paymentMethod === 'bank' && `Please transfer ${formatPriceWithMwk(activeAmount)} to National Bank of Malawi, Account: DreamCraft Christian Institute, Acc#: 731234567890`}
                    {paymentMethod === 'airtel_money' && `Please send ${formatMwk(activeAmountMwk)} via Airtel Money to +265 998 765 432`}
                    {paymentMethod === 'tnm_mpamba' && `Please send ${formatMwk(activeAmountMwk)} via TNM Mpamba to +265 888 765 432`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="mt-8 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setStep('details')}>Back</Button>
              <Button
                className="bg-primary hover:bg-primary/90 px-8"
                onClick={handleSubmitDonation}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Submit Donation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
