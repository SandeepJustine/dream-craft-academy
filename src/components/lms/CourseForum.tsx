'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  MessageSquare,
  Pin,
  Shield,
  Plus,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  MessagesSquare,
} from 'lucide-react'

interface ForumInfo {
  id: string
  title: string
  description: string | null
  courseId: string
}

interface PostUser {
  id: string
  name: string | null
  avatar: string | null
  role: string
}

interface Post {
  id: string
  forumId: string
  userId: string
  parentId: string | null
  title: string | null
  content: string
  isPinned: boolean
  isModerated: boolean
  createdAt: string
  updatedAt: string
  user: PostUser
  replies?: Post[]
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(name: string | null): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string | null): string {
  const colors = [
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700',
    'bg-sky-100 text-sky-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
    'bg-pink-100 text-pink-700',
  ]
  const idx = (name || 'U').charCodeAt(0) % colors.length
  return colors[idx]
}

export function CourseForum() {
  const { currentUser, selectedForumCourseId, navigate } = useAppStore()
  const [forum, setForum] = useState<ForumInfo | null>(null)
  const [threads, setThreads] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())
  const [newThreadOpen, setNewThreadOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [submittingReply, setSubmittingReply] = useState<string | null>(null)

  const isInstructor = currentUser?.role === 'instructor' || currentUser?.role === 'admin'

  const fetchForum = useCallback(async () => {
    if (!selectedForumCourseId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/forums?courseId=${selectedForumCourseId}`)
      if (res.status === 404) {
        // Forum doesn't exist yet, auto-create it
        if (currentUser && isInstructor) {
          const courseRes = await fetch(`/api/courses/${selectedForumCourseId}`)
          if (courseRes.ok) {
            const course = await courseRes.json()
            const createRes = await fetch('/api/forums', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'create',
                courseId: selectedForumCourseId,
                title: `${course.title} Discussion Forum`,
                description: `Discuss topics related to ${course.title}`,
                userId: currentUser.id,
              }),
            })
            if (createRes.ok) {
              const newForum = await createRes.json()
              setForum({ id: newForum.id, title: newForum.title, description: newForum.description, courseId: newForum.courseId })
              setThreads([])
              setLoading(false)
              return
            }
          }
        }
        // If not instructor or creation failed, show empty forum state
        setForum({ id: '', title: 'Course Forum', description: 'Discussion forum for this course', courseId: selectedForumCourseId })
        setThreads([])
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error('Failed to fetch forum')
      const data = await res.json()
      setForum({ id: data.id, title: data.title, description: data.description, courseId: data.courseId })
      setThreads(data.posts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forum')
    } finally {
      setLoading(false)
    }
  }, [selectedForumCourseId, currentUser, isInstructor])

  useEffect(() => {
    fetchForum()
  }, [fetchForum])

  const toggleThread = (threadId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev)
      if (next.has(threadId)) {
        next.delete(threadId)
      } else {
        next.add(threadId)
      }
      return next
    })
  }

  const handleNewThread = async () => {
    if (!forum || !currentUser || !newContent.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'post',
          forumId: forum.id,
          userId: currentUser.id,
          title: newTitle.trim() || null,
          content: newContent.trim(),
        }),
      })
      if (!res.ok) throw new Error('Failed to create thread')
      const newPost = await res.json()
      setThreads((prev) => [{ ...newPost, replies: [] }, ...prev])
      setNewTitle('')
      setNewContent('')
      setNewThreadOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (threadId: string) => {
    if (!forum || !currentUser || !replyContent[threadId]?.trim()) return
    try {
      setSubmittingReply(threadId)
      const res = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'post',
          forumId: forum.id,
          userId: currentUser.id,
          parentId: threadId,
          content: replyContent[threadId].trim(),
        }),
      })
      if (!res.ok) throw new Error('Failed to post reply')
      const newReply = await res.json()
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, replies: [...(t.replies || []), newReply] }
            : t
        )
      )
      setReplyContent((prev) => ({ ...prev, [threadId]: '' }))
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingReply(null)
    }
  }

  const handlePin = async (postId: string, _pin: boolean) => {
    if (!currentUser) return
    try {
      const res = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin', postId, userId: currentUser.id }),
      })
      if (!res.ok) throw new Error('Failed to update pin status')
      const data = await res.json()
      setThreads((prev) =>
        prev.map((t) => (t.id === postId ? { ...t, isPinned: data.isPinned } : t))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleModerate = async (postId: string) => {
    if (!currentUser) return
    try {
      const res = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'moderate', postId, userId: currentUser.id }),
      })
      if (!res.ok) throw new Error('Failed to moderate post')
      const data = await res.json()
      const isModerated = data.isModerated
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === postId) return { ...t, isModerated }
          if (t.replies) {
            return {
              ...t,
              replies: t.replies.map((r) =>
                r.id === postId ? { ...r, isModerated } : r
              ),
            }
          }
          return t
        })
      )
    } catch (err) {
      console.error(err)
    }
  }

  if (!selectedForumCourseId) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <MessagesSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-3">No Course Selected</h2>
          <p className="text-muted-foreground mb-6">Please select a course to view its forum.</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('courses')}>
            Browse Courses
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-10 w-64 mb-3" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 p-5 animate-pulse">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <MessagesSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Something Went Wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button variant="outline" onClick={fetchForum}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('course-detail', { courseId: selectedForumCourseId })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <MessagesSquare className="h-5 w-5 text-amber-700" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {forum?.title || 'Course Forum'}
            </h1>
          </div>
          {forum?.description && (
            <p className="text-lg text-muted-foreground ml-13">
              {forum.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 ml-13">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm px-3 py-1">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              {threads.length} {threads.length === 1 ? 'Discussion' : 'Discussions'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Discussion Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Discussions</h2>
          {currentUser ? (
            <Dialog open={newThreadOpen} onOpenChange={setNewThreadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Start a New Discussion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Title
                    </label>
                    <Input
                      placeholder="What would you like to discuss?"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Content
                    </label>
                    <Textarea
                      placeholder="Share your thoughts, questions, or insights..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setNewThreadOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleNewThread}
                      disabled={submitting || !newContent.trim()}
                    >
                      {submitting ? 'Posting...' : 'Post Discussion'}
                      <Send className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('login')}>
              Sign In to Post
            </Button>
          )}
        </div>

        {/* Threads */}
        {threads.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Discussions Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Be the first to start a conversation about this course. Ask a question, share an insight, or start a study group.
            </p>
            {currentUser && (
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setNewThreadOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start First Discussion
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => {
              const isExpanded = expandedThreads.has(thread.id)
              const replyCount = thread.replies?.length || 0
              const isModeratedContent = thread.isModerated

              return (
                <Card
                  key={thread.id}
                  className={`border-border/50 overflow-hidden transition-shadow hover:shadow-md ${
                    thread.isPinned ? 'border-amber-200 bg-amber-50/30' : ''
                  }`}
                >
                  {/* Thread Header */}
                  <CardHeader
                    className="p-4 sm:p-5 cursor-pointer"
                    onClick={() => toggleThread(thread.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(
                          thread.user.name
                        )}`}
                      >
                        {getInitials(thread.user.name)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {thread.isPinned && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0">
                              <Pin className="h-2.5 w-2.5 mr-0.5" />
                              Pinned
                            </Badge>
                          )}
                          {thread.isModerated && (
                            <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px] px-1.5 py-0">
                              <Shield className="h-2.5 w-2.5 mr-0.5" />
                              Moderated
                            </Badge>
                          )}
                          {thread.user.role === 'instructor' && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] px-1.5 py-0">
                              Instructor
                            </Badge>
                          )}
                          {thread.user.role === 'admin' && (
                            <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-[10px] px-1.5 py-0">
                              Admin
                            </Badge>
                          )}
                        </div>

                        {thread.title && (
                          <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 mb-1">
                            {thread.title}
                          </h3>
                        )}

                        {isModeratedContent && !isInstructor ? (
                          <p className="text-sm text-muted-foreground italic">
                            This content has been moderated by an instructor.
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {thread.content}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/70">
                            {thread.user.name || 'Unknown User'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(thread.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                          </span>
                        </div>
                      </div>

                      {/* Expand/Collapse */}
                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Instructor actions */}
                    {isInstructor && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30 ml-13">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePin(thread.id, !thread.isPinned)
                          }}
                        >
                          <Pin className="h-3 w-3 mr-1" />
                          {thread.isPinned ? 'Unpin' : 'Pin'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs h-7 ${thread.isModerated ? 'text-emerald-600' : 'text-rose-600'}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleModerate(thread.id)
                          }}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {thread.isModerated ? 'Unmoderate' : 'Moderate'}
                        </Button>
                      </div>
                    )}
                  </CardHeader>

                  {/* Expanded: Replies + Reply Input */}
                  {isExpanded && (
                    <CardContent className="px-4 sm:px-5 pb-5 pt-0">
                      <Separator className="mb-4" />

                      {/* Full thread content */}
                      {thread.title && (
                        <div className="mb-4 p-3 rounded-lg bg-muted/30">
                          {(isModeratedContent && !isInstructor) ? (
                            <p className="text-sm italic text-muted-foreground">
                              This content has been moderated.
                            </p>
                          ) : (
                            <p className="text-sm text-foreground whitespace-pre-wrap">{thread.content}</p>
                          )}
                        </div>
                      )}

                      {/* Replies */}
                      {thread.replies && thread.replies.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {thread.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="flex items-start gap-3 pl-4 border-l-2 border-primary/20"
                            >
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
                                  reply.user.name
                                )}`}
                              >
                                {getInitials(reply.user.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-sm font-medium text-foreground">
                                    {reply.user.name || 'Unknown'}
                                  </span>
                                  {reply.user.role === 'instructor' && (
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0">
                                      Instructor
                                    </Badge>
                                  )}
                                  {reply.isModerated && (
                                    <Badge className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0">
                                      <Shield className="h-2.5 w-2.5 mr-0.5" />
                                      Moderated
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {timeAgo(reply.createdAt)}
                                  </span>
                                </div>
                                {(reply.isModerated && !isInstructor) ? (
                                  <p className="text-sm italic text-muted-foreground">
                                    This reply has been moderated.
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {reply.content}
                                  </p>
                                )}

                                {/* Instructor moderation on replies */}
                                {isInstructor && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs h-6"
                                      onClick={() => handleModerate(reply.id)}
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      {reply.isModerated ? 'Unmoderate' : 'Moderate'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {currentUser ? (
                        <div className="flex items-start gap-3 pl-4 border-l-2 border-primary/20">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
                              currentUser.name
                            )}`}
                          >
                            {getInitials(currentUser.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyContent[thread.id] || ''}
                              onChange={(e) =>
                                setReplyContent((prev) => ({
                                  ...prev,
                                  [thread.id]: e.target.value,
                                }))
                              }
                              rows={3}
                              className="text-sm resize-none"
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleReply(thread.id)}
                                disabled={
                                  submittingReply === thread.id ||
                                  !replyContent[thread.id]?.trim()
                                }
                              >
                                {submittingReply === thread.id
                                  ? 'Posting...'
                                  : 'Reply'}
                                <Send className="h-3.5 w-3.5 ml-1.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3 pl-4 border-l-2 border-primary/20">
                          <Button
                            variant="link"
                            className="text-primary"
                            onClick={() => navigate('login')}
                          >
                            Sign in to reply
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
