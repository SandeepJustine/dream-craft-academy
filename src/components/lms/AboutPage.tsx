'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Cross,
  Eye,
  Target,
  Heart,
  Globe,
  Shield,
  Sparkles,
  Users,
  BookOpen,
  ArrowRight,
  HandHeart,
  Gem,
  Lightbulb,
} from 'lucide-react'

export function AboutPage() {
  const { navigate } = useAppStore()

  const values = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Accessibility for All',
      description: 'We believe every believer, regardless of background or circumstance, deserves access to transformative Christian education. By removing financial and logistical barriers, we ensure God\'s Word and training are available to all.',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Biblical Integrity',
      description: 'We ground every course, resource, and interaction in the unchanging truth of Scripture. Our teachings prioritize faithfulness to God\'s Word, ensuring learners grow in both knowledge and spiritual maturity.',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Empowered Calling',
      description: 'We are passionate about unlocking the God-given potential in every individual. Through practical training and spiritual mentorship, we equip believers to confidently step into their unique callings.',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community Transformation',
      description: 'We prepare servant-leaders to impact their communities with Christ-like love and action. Our focus extends beyond personal growth to fostering Gospel-centered change in families, churches, and societies.',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: <Gem className="h-6 w-6" />,
      title: 'Excellence in Service',
      description: 'We pursue excellence in all we do, reflecting the character of God. Our programs combine rigorous academic standards with heartfelt devotion, empowering believers to serve with competence and passion.',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      icon: <HandHeart className="h-6 w-6" />,
      title: 'Generosity & Stewardship',
      description: 'We operate on a model of radical generosity, trusting God to provide through the support of His people. We steward resources wisely to ensure sustainable, impactful ministry for generations.',
      color: 'bg-emerald-100 text-emerald-700',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Cross className="h-7 w-7" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            About DreamCraft
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nurturing believers to grow in skill, deepen in faith, and amplify their influence for God&apos;s kingdom.
          </p>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-border/50 shadow-md overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Eye className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Vision Statement</h2>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                To see a world where every follower of Christ is equipped, empowered, and inspired to advance God&apos;s kingdom through transformative service rooted in faith, skill, and unwavering purpose.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-md overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Mission Statement</h2>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                DreamCraft Christian Institute provides free, accessible online Christian education and training, nurturing believers to grow in skill, deepen in faith, and amplify their influence. Through biblically grounded courses and practical support, we empower individuals to serve with excellence and fulfill their God-given calling.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Objectives */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">Core Objectives</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/50 text-center">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mx-auto mb-4">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ensure every believer, regardless of location or financial means, can access high-quality theological and practical training at no cost.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 text-center">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mx-auto mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Holistic Growth</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Foster spiritual maturity, leadership competence, and practical skills through a curriculum that integrates biblical truth with real-world application.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 text-center">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mx-auto mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Community Impact</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Build a global network of servant-leaders equipped to address societal needs, share the Gospel, and inspire Christ-centered change.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 text-center">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mx-auto mb-4">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Sustainable Excellence</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Develop innovative, donation-supported programs that maintain academic rigor, relevance, and alignment with God&apos;s Word for generations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {values.map((value) => (
              <div key={value.title} className="card-hover rounded-2xl bg-white border border-border/50 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${value.color} mb-4`}>
                  {value.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join thousands of believers growing in faith and purpose through DreamCraft&apos;s free courses.
          </p>
          <div className="flex gap-3 justify-center">
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('courses')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Explore Courses
            </Button>
            <Button variant="outline" onClick={() => navigate('apply')}>
              Apply Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
