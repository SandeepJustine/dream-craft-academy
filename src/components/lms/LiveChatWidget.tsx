'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Loader2,
  User,
  Mail,
  ArrowRight,
  Bot,
} from 'lucide-react'

interface ChatMessageData {
  id: string
  content: string
  senderType: string
  senderName: string | null
  senderId: string | null
  createdAt: string
  isRead: boolean
  sender?: { id: string; name: string; email: string; avatar: string | null; role: string } | null
}

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Registration form state
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registerError, setRegisterError] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Poll for new messages
  const pollMessages = useCallback(async () => {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/live-chat?action=messages&sessionId=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setMessages(data)
        }
      }
    } catch {
      // Silent fail for polling
    }
  }, [sessionId])

  // Start polling when session exists and widget is open
  useEffect(() => {
    if (sessionId && isOpen && !isMinimized) {
      pollIntervalRef.current = setInterval(pollMessages, 3000)
      // Also poll immediately
      pollMessages()
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [sessionId, isOpen, isMinimized, pollMessages])

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && !isMinimized && sessionId) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized, sessionId])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!visitorName.trim() || !visitorEmail.trim()) return

    try {
      setRegistering(true)
      setRegisterError('')

      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-session',
          visitorName: visitorName.trim(),
          visitorEmail: visitorEmail.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSessionId(data.sessionId)
        // Send an initial greeting message
        const msgRes = await fetch('/api/live-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send-message',
            sessionId: data.sessionId,
            content: `Hi, I'm ${visitorName.trim()}. I'd like some help.`,
            senderType: 'visitor',
            senderName: visitorName.trim(),
          }),
        })
        if (msgRes.ok) {
          const msgData = await msgRes.json()
          setMessages([msgData])
        }
      } else {
        setRegisterError(data.error || 'Failed to start chat session')
      }
    } catch {
      setRegisterError('Network error. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !sessionId || sending) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      setSending(true)
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          sessionId,
          content: messageContent,
          senderType: 'visitor',
          senderName: visitorName.trim(),
        }),
      })

      if (res.ok) {
        const msgData = await res.json()
        setMessages((prev) => [...prev, msgData])
      } else {
        // Re-add the message to input on failure
        setNewMessage(messageContent)
      }
    } catch {
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const toggleWidget = () => {
    if (isMinimized) {
      setIsMinimized(false)
      setIsOpen(true)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  // Count unread admin messages
  const unreadAdminMessages = messages.filter(
    (m) => m.senderType === 'admin' && !m.isRead
  ).length

  return (
    <>
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadAdminMessages > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {unreadAdminMessages}
            </span>
          )}
        </button>
      )}

      {/* Minimized bar */}
      {isOpen && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-primary text-primary-foreground pl-4 pr-3 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Live Chat</span>
          {unreadAdminMessages > 0 && (
            <Badge className="bg-destructive text-destructive-foreground text-[10px] h-5 w-5 p-0 flex items-center justify-center">
              {unreadAdminMessages}
            </Badge>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col w-[calc(100vw-2.5rem)] sm:w-[380px] h-[min(600px,calc(100vh-5rem))] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="text-sm font-semibold">Live Chat</h3>
                <p className="text-[10px] text-primary-foreground/70">We typically reply within minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMinimize}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!sessionId ? (
            /* Registration Form */
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Enter your details and we&apos;ll connect you with our support team.
              </p>

              <form onSubmit={handleRegister} className="w-full space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Your name"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="pl-9 h-11"
                    required
                    disabled={registering}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    className="pl-9 h-11"
                    required
                    disabled={registering}
                  />
                </div>

                {registerError && (
                  <p className="text-xs text-destructive text-center">{registerError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 h-11"
                  disabled={registering || !visitorName.trim() || !visitorEmail.trim()}
                >
                  {registering ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Start Chat
                </Button>
              </form>

              <p className="text-[10px] text-muted-foreground text-center mt-4">
                By starting a chat, you agree to our terms of service.
              </p>
            </div>
          ) : (
            /* Messages Area */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* System welcome message */}
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Starting your conversation...
                    </p>
                  </div>
                )}

                {messages.map((msg) => {
                  const isVisitor = msg.senderType === 'visitor'
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          isVisitor
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        }`}
                      >
                        {!isVisitor && msg.sender?.name && (
                          <p className="text-[10px] font-semibold text-primary mb-0.5">
                            {msg.sender.name}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isVisitor ? 'text-primary-foreground/60' : 'text-muted-foreground'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-border shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 h-10"
                    disabled={sending}
                    maxLength={1000}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 bg-primary hover:bg-primary/90 shrink-0"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
