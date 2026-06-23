'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { GraduationCap, ArrowRight, Cross } from 'lucide-react'

export function CTA() {
  const { navigate } = useAppStore()

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-background relative overflow-hidden">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600 text-white">
            <Cross className="h-7 w-7" />
          </div>
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Start Your Journey Today
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Join thousands of believers who are equipping themselves for Kingdom service. 
          Every course is free, every lesson is biblically grounded, and every student is valued.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white text-base px-8 h-12 font-semibold shadow-lg"
            onClick={() => navigate('apply')}
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Apply Now — It&apos;s Free
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-base px-8 h-12 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
            onClick={() => navigate('courses')}
          >
            View Course Catalog
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
