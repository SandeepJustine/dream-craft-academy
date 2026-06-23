'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Heart,
  Globe,
  Award,
  Users,
  Cross,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Biblically Grounded',
    description: 'Every course is rooted in Scripture, ensuring you grow in both knowledge and spiritual maturity.',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: '100% Free',
    description: 'We believe every believer deserves access to transformative Christian education, regardless of financial means.',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Learn Anywhere',
    description: 'Access courses anytime, from any device. Study at your own pace with 24/7 platform availability.',
    color: 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: 'Certificates',
    description: 'Earn certificates of completion for each course to recognize your achievements and dedication.',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community',
    description: 'Join a global network of believers learning together, supporting one another in faith and growth.',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    icon: <Cross className="h-6 w-6" />,
    title: 'Kingdom Impact',
    description: 'Equipped with practical skills and deepened faith, serve your community and advance God\'s kingdom.',
    color: 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  },
]

export function Features() {
  const { navigate } = useAppStore()

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why DreamCraft?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We provide accessible, biblically grounded education that empowers believers to serve with excellence and fulfill their God-given calling.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-hover rounded-2xl bg-card border border-border/50 p-6 group"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('courses')}
          >
            Browse All Courses
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
