'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Video,
  Headphones,
  File,
  ExternalLink,
  Library as LibraryIcon,
  Loader2,
  BookMarked,
  Newspaper,
} from 'lucide-react'

interface CourseInfo {
  id: string
  title: string
  category: string
}

interface UploaderInfo {
  id: string
  name: string
}

interface LibraryResource {
  id: string
  courseId: string | null
  title: string
  description: string | null
  type: string
  url: string | null
  coverImage: string | null
  author: string | null
  uploadedBy: string
  createdAt: string
  course: CourseInfo | null
  uploader: UploaderInfo
}

type ResourceType = 'all' | 'book' | 'article' | 'video' | 'audio' | 'document'

const RESOURCE_TYPES: { value: ResourceType; label: string; icon: typeof BookOpen }[] = [
  { value: 'all', label: 'All', icon: LibraryIcon },
  { value: 'book', label: 'Books', icon: BookOpen },
  { value: 'article', label: 'Articles', icon: Newspaper },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'audio', label: 'Audio', icon: Headphones },
  { value: 'document', label: 'Documents', icon: FileText },
]

function getTypeIcon(type: string) {
  switch (type) {
    case 'book':
      return BookOpen
    case 'article':
      return Newspaper
    case 'video':
      return Video
    case 'audio':
      return Headphones
    case 'document':
      return FileText
    default:
      return File
  }
}

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case 'book':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'article':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'video':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    case 'audio':
      return 'bg-violet-100 text-violet-800 border-violet-200'
    case 'document':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getTypeIconBg(type: string): string {
  switch (type) {
    case 'book':
      return 'bg-amber-50 text-amber-600'
    case 'article':
      return 'bg-emerald-50 text-emerald-600'
    case 'video':
      return 'bg-rose-50 text-rose-600'
    case 'audio':
      return 'bg-violet-50 text-violet-600'
    case 'document':
      return 'bg-blue-50 text-blue-600'
    default:
      return 'bg-gray-50 text-gray-600'
  }
}

export function LibraryPage() {
  const { currentUser } = useAppStore()
  const [resources, setResources] = useState<LibraryResource[]>([])
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<ResourceType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState('book')
  const [formUrl, setFormUrl] = useState('')
  const [formAuthor, setFormAuthor] = useState('')
  const [formCoverImage, setFormCoverImage] = useState('')
  const [formCourseId, setFormCourseId] = useState('')

  const isInstructor = currentUser?.role === 'instructor' || currentUser?.role === 'admin'

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (activeType !== 'all') params.set('type', activeType)
      const res = await fetch(`/api/library?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch resources')
      const data = await res.json()
      setResources(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }, [activeType])

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses')
      if (res.ok) {
        const data = await res.json()
        setCourses(data.map((c: { id: string; title: string }) => ({ id: c.id, title: c.title })))
      }
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const filteredResources = resources.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      r.title.toLowerCase().includes(q) ||
      (r.author && r.author.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    )
  })

  const handleAddResource = async () => {
    if (!currentUser || !formTitle.trim() || !formType) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          type: formType,
          url: formUrl.trim() || null,
          coverImage: formCoverImage.trim() || null,
          author: formAuthor.trim() || null,
          courseId: formCourseId || null,
          uploadedBy: currentUser.id,
        }),
      })
      if (!res.ok) throw new Error('Failed to create resource')
      const newResource = await res.json()
      setResources((prev) => [newResource, ...prev])
      // Reset form
      setFormTitle('')
      setFormDescription('')
      setFormType('book')
      setFormUrl('')
      setFormAuthor('')
      setFormCoverImage('')
      setFormCourseId('')
      setAddDialogOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCardClick = (resource: LibraryResource) => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <BookOpen className="h-5 w-5 text-amber-700" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Digital Library
            </h1>
          </div>
          <p className="text-lg text-muted-foreground ml-13">
            Explore books, articles, videos, audio, and documents to deepen your faith and knowledge
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Type Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {RESOURCE_TYPES.map((type) => {
              const Icon = type.icon
              const isActive = activeType === type.value
              return (
                <Button
                  key={type.value}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs sm:text-sm ${
                    isActive
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'hover:bg-primary/10'
                  }`}
                  onClick={() => setActiveType(type.value)}
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {type.label}
                </Button>
              )
            })}
          </div>

          {/* Search + Add */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {isInstructor && (
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Library Resource</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Title *
                      </label>
                      <Input
                        placeholder="Resource title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Description
                      </label>
                      <Textarea
                        placeholder="Brief description of this resource..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Type *
                        </label>
                        <Select value={formType} onValueChange={setFormType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="book">Book</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Author
                        </label>
                        <Input
                          placeholder="Author name"
                          value={formAuthor}
                          onChange={(e) => setFormAuthor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        URL
                      </label>
                      <Input
                        placeholder="https://example.com/resource"
                        value={formUrl}
                        onChange={(e) => setFormUrl(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Cover Image URL
                      </label>
                      <Input
                        placeholder="https://example.com/cover.jpg"
                        value={formCoverImage}
                        onChange={(e) => setFormCoverImage(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Associated Course
                      </label>
                      <Select value={formCourseId} onValueChange={setFormCourseId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={handleAddResource}
                        disabled={submitting || !formTitle.trim()}
                      >
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add Resource
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Results Count */}
        {!loading && !error && (
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}
            {searchQuery && ` matching "${searchQuery}"`}
            {activeType !== 'all' && ` in ${RESOURCE_TYPES.find((t) => t.value === activeType)?.label}`}
          </p>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-5 bg-muted rounded w-16" />
                    <div className="h-5 bg-muted rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <LibraryIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Something Went Wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="outline" onClick={fetchResources}>Try Again</Button>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-16">
            <BookMarked className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">No Resources Found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || activeType !== 'all'
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'The library is currently empty. Check back soon for new resources!'}
            </p>
            {(searchQuery || activeType !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setActiveType('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type)
              const hasUrl = !!resource.url
              return (
                <Card
                  key={resource.id}
                  className={`border-border/50 overflow-hidden transition-all hover:shadow-md ${
                    hasUrl ? 'cursor-pointer group' : ''
                  }`}
                  onClick={() => hasUrl && handleCardClick(resource)}
                >
                  {/* Cover / Placeholder */}
                  <div className="relative h-48 overflow-hidden">
                    {resource.coverImage ? (
                      <img
                        src={resource.coverImage}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${getTypeIconBg(
                          resource.type
                        )}`}
                      >
                        <TypeIcon className="h-16 w-16 opacity-40" />
                      </div>
                    )}
                    {/* Type badge overlay */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${getTypeBadgeClass(resource.type)} text-xs font-semibold`}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </Badge>
                    </div>
                    {/* External link indicator */}
                    {hasUrl && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm">
                          <ExternalLink className="h-4 w-4 text-foreground" />
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {resource.description}
                      </p>
                    )}
                    {resource.author && (
                      <p className="text-xs text-muted-foreground mb-3">
                        By {resource.author}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {resource.course && (
                        <Badge variant="outline" className="text-[10px]">
                          <BookOpen className="h-2.5 w-2.5 mr-1" />
                          {resource.course.title}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
