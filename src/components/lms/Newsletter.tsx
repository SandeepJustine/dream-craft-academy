'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setStatus('loading')
      setErrorMessage('')

      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setEmail('')
        setName('')
      } else {
        setStatus('error')
        if (res.status === 409) {
          setErrorMessage('This email is already subscribed!')
        } else {
          setErrorMessage(data.error || 'Something went wrong. Please try again.')
        }
      }
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-amber-50 via-amber-50/60 to-emerald-50 dark:bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-card dark:text-amber-500">
              <Mail className="h-7 w-7" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Updated
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-stone-300 text-lg mb-8 leading-relaxed">
            Subscribe to our newsletter and never miss new courses, events, and faith-building resources. 
            Delivered straight to your inbox.
          </p>

          {/* Success State */}
          {status === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 dark:bg-card dark:border-border">
              <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-emerald-800 dark:text-white mb-2">You&apos;re Subscribed!</h3>
              <p className="text-emerald-700 dark:text-card-foreground text-sm">
                Thank you for subscribing. You&apos;ll receive our latest updates and resources in your inbox.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-border dark:text-card-foreground dark:hover:bg-secondary"
                onClick={() => setStatus('idle')}
              >
                Subscribe another email
              </Button>
            </div>
          ) : (
            /* Form — footer color in dark mode, white in light mode */
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border/50">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Your name (optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 bg-background dark:bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
                      disabled={status === 'loading'}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                      className="h-12 pl-10 bg-background dark:bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
                      required
                      disabled={status === 'loading'}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 text-white h-12 px-8 font-semibold shadow-lg shrink-0 dark:bg-amber-700 dark:hover:bg-amber-600"
                    disabled={status === 'loading' || !email.trim()}
                  >
                    {status === 'loading' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Subscribe
                  </Button>
                </div>

                {/* Error Message */}
                {status === 'error' && errorMessage && (
                  <div className="flex items-center justify-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  We respect your privacy. Unsubscribe at any time. No spam, ever.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
