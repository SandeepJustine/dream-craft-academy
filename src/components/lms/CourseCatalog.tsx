'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CourseCard } from './CourseCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const categories = ['All', 'Life Coaching', 'Leadership', 'Ministry', 'Management']
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  image: string | null
  instructor: string
  featured: boolean
  rating: number
  enrolled: number
  modulesCount: number
  lessonsCount: number
}

export function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All')

  useEffect(() => {
    fetchCourses()
  }, [selectedCategory, selectedLevel, search])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'All') params.set('category', selectedCategory)
      if (selectedLevel !== 'All') params.set('level', selectedLevel)
      if (search) params.set('search', search)

      const res = await fetch(`/api/courses?${params.toString()}`)
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('All')
    setSelectedLevel('All')
  }

  const hasFilters = search || selectedCategory !== 'All' || selectedLevel !== 'All'

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Course Catalog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our collection of free, biblically grounded courses designed to equip you for Kingdom service.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                className={selectedCategory === cat ? 'bg-primary' : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Badge
                key={level}
                variant={selectedLevel === level ? 'default' : 'outline'}
                className={`cursor-pointer px-3 py-1 text-sm ${
                  selectedLevel === level ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedLevel(level)}
              >
                {level}
              </Badge>
            ))}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          {loading ? 'Loading...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 p-5 animate-pulse">
                <div className="h-40 bg-muted rounded-xl mb-4" />
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <SlidersHorizontal className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
