'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { BookOpen, Clock, Star, Users, ArrowRight } from 'lucide-react'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    category: string
    level: string
    duration: string
    instructor: string
    featured: boolean
    rating: number
    enrolled: number
    modulesCount: number
    lessonsCount: number
    progress?: number
  }
  showProgress?: boolean
}

const categoryColors: Record<string, string> = {
  'Life Coaching': 'bg-amber-100 text-amber-800',
  'Leadership': 'bg-emerald-100 text-emerald-800',
  'Ministry': 'bg-violet-100 text-violet-800',
  'Management': 'bg-sky-100 text-sky-800',
}

export function CourseCard({ course, showProgress = false }: CourseCardProps) {
  const { navigate } = useAppStore()

  return (
    <Card
      className="card-hover cursor-pointer group overflow-hidden border-border/50 shadow-sm"
      onClick={() => navigate('course-detail', { courseId: course.id })}
    >
      {/* Image placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_var(--tw-gradient-stops))] from-amber-200/30 to-emerald-200/20" />
        <BookOpen className="h-12 w-12 text-primary/30 group-hover:text-primary/50 transition-colors" />
        
        {course.featured && (
          <Badge className="absolute top-3 left-3 bg-amber-600 text-white hover:bg-amber-700 text-xs">
            Featured
          </Badge>
        )}
        <Badge className={`absolute top-3 right-3 ${categoryColors[course.category] || 'bg-stone-100 text-stone-800'} text-xs`}>
          {course.category}
        </Badge>
      </div>

      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs font-normal">
            {course.level}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {course.duration}
          </div>
        </div>

        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{course.enrolled} students</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course.lessonsCount} lessons</span>
          </div>
        </div>

        {showProgress && course.progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{course.progress}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full progress-animate transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-primary hover:text-primary hover:bg-primary/5 group/btn"
        >
          {showProgress && course.progress !== undefined && course.progress > 0
            ? 'Continue Learning'
            : 'View Course'}
          <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  )
}
