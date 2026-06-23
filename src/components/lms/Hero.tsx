'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight, CheckCircle, Cross } from 'lucide-react'

export function Hero() {
  const { navigate } = useAppStore()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-image.jpg')" }}
      />

      {/* Semi-transparent dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Subtle gradient accents */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-white/20">
            <Cross className="h-4 w-4" />
            100% Free Online Christian Education
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Grow in{' '}
            <span className="text-amber-400">Faith</span>,{' '}
            <span className="text-emerald-400">Skill</span>{' '}
            &{' '}
            <span className="text-amber-300">Purpose</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            DreamCraft Christian Institute provides free, accessible online education that nurtures believers to deepen in faith and amplify their influence for God&apos;s kingdom.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white text-base px-8 h-13 rounded-xl shadow-lg shadow-amber-900/30"
              onClick={() => navigate('courses')}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 h-13 border-white/30 text-white hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm"
              onClick={() => navigate('about')}
            >
              Learn More
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Self-paced learning</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Certificate of completion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
