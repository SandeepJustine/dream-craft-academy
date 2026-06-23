'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Send,
  MessageCircle,
  BookOpen,
  User,
  Loader2,
} from 'lucide-react'

interface ChatMessage {
  id: string
  courseId: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    avatar: string | null
    role: string
  }
}

interface CourseInfo {
  id: string
  title: string
  instructor: string
  category: string
  level: string
}

export function PrivateChat() {
  const { currentUser, selectedCourseId, navigate } = useAppStore()
  const chatInstructorId = useAppStore((state) => state.chatInstructorId)
  const chatStudentId = useAppStore((state) => state.chatStudentId)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [instructorInfo, setInstructorInfo] = useState<{ id: string; name: string; avatar: string | null; role: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch course info to determine instructor
  useEffect(() => {
    if (!selectedCourseId) return

    const fetchCourseInfo = async () => {
      try {
        const res = await fetch(`/api/courses/${selectedCourseId}`)
        if (res.ok) {
          const data = await res.json()
          setCourseInfo(data)
        }
      } catch (err) {
        console.error('Error fetching course info:', err)
      }
    }

    fetchCourseInfo()
  }, [selectedCourseId])

  // Determine if current user is instructor (instructor-initiated chat)
  const isInstructorMode = currentUser?.role === 'instructor' || currentUser?.role === 'admin'

  // Fetch the "other person" info (student for instructor mode, instructor for student mode)
  const [otherPersonInfo, setOtherPersonInfo] = useState<{ id: string; name: string; avatar: string | null; role: string } | null>(null)

  // Fetch instructor info
  useEffect(() => {
    const fetchInstructor = async () => {
      if (isInstructorMode && chatStudentId) {
        // Instructor mode: fetch student info
        try {
          const res = await fetch(`/api/auth?userId=${chatStudentId}`)
          if (res.ok) {
            const data = await res.json()
            setOtherPersonInfo({
              id: data.id,
              name: data.name || 'Student',
              avatar: data.avatar,
              role: data.role || 'student',
            })
          }
        } catch (err) {
          console.error('Error fetching student info:', err)
        }
      }

      // Student mode: fetch instructor info
      let instructorIdToFetch = chatInstructorId

      if (!instructorIdToFetch && courseInfo?.instructor) {
        try {
          instructorIdToFetch = null
        } catch {
          // ignore
        }
      }

      if (!isInstructorMode && instructorIdToFetch) {
        try {
          const res = await fetch(`/api/auth?userId=${instructorIdToFetch}`)
          if (res.ok) {
            const data = await res.json()
            setInstructorInfo({
              id: data.id,
              name: data.name || 'Instructor',
              avatar: data.avatar,
              role: data.role || 'instructor',
            })
          }
        } catch (err) {
          console.error('Error fetching instructor info:', err)
        }
      } else if (!isInstructorMode && courseInfo?.instructor) {
        setInstructorInfo({
          id: 'instructor-' + courseInfo.id,
          name: courseInfo.instructor,
          avatar: null,
          role: 'instructor',
        })
      }
    }

    fetchInstructor()
  }, [chatInstructorId, chatStudentId, courseInfo, isInstructorMode])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!currentUser || !selectedCourseId) return

    // Determine the userId and instructorId for the API
    const effectiveInstructorId = isInstructorMode ? currentUser.id : instructorInfo?.id
    const effectiveUserId = isInstructorMode ? (chatStudentId || otherPersonInfo?.id) : currentUser.id

    if (!effectiveInstructorId || !effectiveUserId) return

    try {
      const res = await fetch(
        `/api/chat?courseId=${selectedCourseId}&userId=${effectiveUserId}&instructorId=${effectiveInstructorId}`
      )
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
        setError(null)
      } else {
        setError('Failed to load messages')
      }
    } catch {
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [currentUser, selectedCourseId, instructorInfo, isInstructorMode, chatStudentId, otherPersonInfo])

  // Initial fetch and polling
  useEffect(() => {
    const canFetch = isInstructorMode
      ? currentUser && selectedCourseId && (chatStudentId || otherPersonInfo?.id)
      : currentUser && selectedCourseId && instructorInfo

    if (!canFetch) return

    fetchMessages()

    pollIntervalRef.current = setInterval(fetchMessages, 5000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [currentUser, selectedCourseId, instructorInfo, isInstructorMode, chatStudentId, otherPersonInfo, fetchMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`
    }
  }, [newMessage])

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser || !selectedCourseId) return

    // Determine receiver
    const receiverId = isInstructorMode
      ? (chatStudentId || otherPersonInfo?.id)
      : instructorInfo?.id

    if (!receiverId) return

    setSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          senderId: currentUser.id,
          receiverId,
          content: newMessage.trim(),
        }),
      })

      if (res.ok) {
        setNewMessage('')
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
        await fetchMessages()
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }
    
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    
    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access course chat.</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('login')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('course-detail', { courseId: selectedCourseId })}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={(isInstructorMode ? otherPersonInfo?.avatar : instructorInfo?.avatar) || undefined} alt={(isInstructorMode ? otherPersonInfo?.name : instructorInfo?.name) || 'Chat'} />
              <AvatarFallback className={isInstructorMode ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-700'} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {isInstructorMode
                  ? (otherPersonInfo ? getInitials(otherPersonInfo.name) : 'ST')
                  : (instructorInfo ? getInitials(instructorInfo.name) : 'IN')
                }
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">Course Chat</h1>
              <p className="text-xs text-muted-foreground truncate">
                {isInstructorMode
                  ? (otherPersonInfo?.name || 'Student')
                  : (instructorInfo?.name || 'Instructor')
                }
              </p>
            </div>
          </div>
          {courseInfo && (
            <Badge variant="outline" className="hidden sm:flex text-xs shrink-0">
              <BookOpen className="h-3 w-3 mr-1" />
              {courseInfo.title.length > 25 ? courseInfo.title.slice(0, 25) + '...' : courseInfo.title}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 flex max-w-5xl w-full mx-auto">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:flex flex-col w-72 border-r border-border/50 p-4 gap-4">
          {/* Course Info Card */}
          {courseInfo && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{courseInfo.title}</h3>
                    <p className="text-xs text-muted-foreground">{courseInfo.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">{courseInfo.level}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Partner Info Card */}
          {(isInstructorMode ? otherPersonInfo : instructorInfo) && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={(isInstructorMode ? otherPersonInfo?.avatar : instructorInfo?.avatar) || undefined} alt={(isInstructorMode ? otherPersonInfo?.name : instructorInfo?.name) || 'User'} />
                    <AvatarFallback className={isInstructorMode ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-700'} style={{ fontWeight: 600 }}>
                      {isInstructorMode
                        ? (otherPersonInfo ? getInitials(otherPersonInfo.name) : 'ST')
                        : (instructorInfo ? getInitials(instructorInfo.name) : 'IN')
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {isInstructorMode ? (otherPersonInfo?.name || 'Student') : (instructorInfo?.name || 'Instructor')}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground capitalize">
                        {isInstructorMode ? (otherPersonInfo?.role || 'student') : (instructorInfo?.role || 'instructor')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-auto p-3 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-xs text-amber-800 leading-relaxed">
              {isInstructorMode
                ? 'This is a private chat with your student. Messages are visible only to you and the student.'
                : 'This is a private chat with your course instructor. Messages are visible only to you and the instructor.'
              }
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-destructive/30 mx-auto mb-3" />
                  <p className="text-sm text-destructive">{error}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={fetchMessages}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">No messages yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {isInstructorMode
                      ? 'Start the conversation! Reach out to your student.'
                      : 'Start the conversation! Ask your instructor a question about the course.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4 space-y-1">
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === currentUser.id
                    const showSender = index === 0 || messages[index - 1].senderId !== message.senderId
                    const showTimestamp = index === messages.length - 1 || 
                      messages[index + 1].senderId !== message.senderId ||
                      new Date(messages[index + 1].createdAt).getTime() - new Date(message.createdAt).getTime() > 60000

                    return (
                      <div key={message.id}>
                        {/* Sender name for clarity when switching speakers */}
                        {showSender && !isOwn && (
                          <div className="flex items-center gap-2 mt-4 mb-1 ml-1">
                            <span className="text-xs font-medium text-emerald-700">
                              {message.sender.name}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showSender ? '' : ''}`}>
                          <div
                            className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {message.content}
                            </p>
                            {showTimestamp && (
                              <p className={`text-[10px] mt-1 ${
                                isOwn ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'
                              }`}>
                                {formatTime(message.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-border/50 bg-white p-3 sm:p-4">
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 placeholder:text-muted-foreground/60 transition-all"
                  style={{ maxHeight: '96px' }}
                />
              </div>
              <Button
                size="icon"
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shrink-0"
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
