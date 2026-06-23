'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Headphones,
  Loader2,
  Newspaper,
  Pause,
  PenLine,
  Play,
  Video,
  Volume2,
  VolumeX,
  X,
  Maximize,
  AlertCircle,
  BookMarked,
  FileType,
  Clapperboard,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LessonData {
  id: string
  title: string
  content: string
  type: string
  mediaUrl: string | null
  videoUrl: string | null
  audioUrl: string | null
  codeSnippet: string | null
  pdfUrl: string | null
  presentationUrl: string | null
  embedCode: string | null
  externalUrl: string | null
  resourceUrl: string | null
  duration: string
  order: number
  module: {
    id: string
    title: string
    courseId: string
    order: number
  }
}

interface SidebarLesson {
  id: string
  title: string
  type: string
  duration: string
  order: number
}

interface SidebarQuiz {
  id: string
  title: string
  type: string
  order: number
}

interface SidebarAssignment {
  id: string
  title: string
  type: string
  order: number
}

interface ModuleWithItems {
  id: string
  title: string
  order: number
  lessons: SidebarLesson[]
  quizzes: SidebarQuiz[]
  assignments: SidebarAssignment[]
}

interface CourseData {
  id: string
  title: string
  modules: ModuleWithItems[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getLessonTypeIcon(type: string) {
  switch (type) {
    case 'video':
      return <Video className="h-3.5 w-3.5" />
    case 'audio':
      return <Headphones className="h-3.5 w-3.5" />
    case 'pdf':
      return <FileType className="h-3.5 w-3.5" />
    case 'webbook':
      return <BookMarked className="h-3.5 w-3.5" />
    case 'notes':
    case 'text':
    default:
      return <FileText className="h-3.5 w-3.5" />
  }
}

function getLessonTypeLabel(type: string): string {
  switch (type) {
    case 'video': return 'Video'
    case 'audio': return 'Audio'
    case 'pdf': return 'PDF'
    case 'webbook': return 'Webbook'
    case 'notes': return 'Notes'
    case 'text': return 'Reading'
    default: return 'Lesson'
  }
}

function getLessonTypeBadgeColor(type: string): string {
  switch (type) {
    case 'video': return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'audio': return 'bg-violet-50 text-violet-700 border-violet-200'
    case 'pdf': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'webbook': return 'bg-cyan-50 text-cyan-700 border-cyan-200'
    case 'notes': return 'bg-teal-50 text-teal-700 border-teal-200'
    case 'text': return 'bg-amber-50 text-amber-700 border-amber-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

// ─── Waveform Visualization ────────────────────────────────────────────────────

function WaveformBars({ isPlaying, progress }: { isPlaying: boolean; progress: number }) {
  const barCount = 48
  return (
    <div className="flex items-center gap-[2px] h-8 overflow-hidden">
      {Array.from({ length: barCount }).map((_, i) => {
        const pct = (i / barCount) * 100
        const isActive = pct <= progress
        const height = 8 + Math.sin(i * 0.5) * 12 + Math.cos(i * 0.3) * 6 + (i % 3) * 4
        return (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-primary/80'
                : 'bg-muted-foreground/20'
            }`}
            style={{
              width: 3,
              height: isPlaying && isActive
                ? `${height}px`
                : isActive
                ? `${height * 0.7}px`
                : `${height * 0.4}px`,
              animation: isPlaying && isActive ? `waveform-bar ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate` : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Video Player Component ────────────────────────────────────────────────────

function VideoPlayer({
  mediaUrl,
  onProgress80,
}: {
  mediaUrl: string | null
  onProgress80: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const eightyReached = useRef(false)

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    if (v.duration && !eightyReached.current && v.currentTime / v.duration >= 0.8) {
      eightyReached.current = true
      onProgress80()
    }
  }, [onProgress80])

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current
    if (v) {
      setDuration(v.duration)
      setIsLoading(false)
    }
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
  }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = pct * duration
  }, [duration])

  const toggleFullscreen = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      v.requestFullscreen()
    }
  }, [])

  if (!mediaUrl) {
    return (
      <div className="aspect-video bg-stone-900 rounded-xl flex items-center justify-center">
        <div className="text-center text-white/60">
          <Clapperboard className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Video will be available soon</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="aspect-video bg-stone-900 rounded-xl flex items-center justify-center">
        <div className="text-center text-white/70">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-rose-400" />
          <p className="text-sm font-medium mb-1">Unable to load video</p>
          <p className="text-xs text-white/50">Please try again later or check the video URL</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group rounded-xl overflow-hidden bg-stone-900">
      {/* Aspect ratio container */}
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          src={mediaUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/60">
            <Loader2 className="h-10 w-10 animate-spin text-white/80" />
          </div>
        )}

        {/* Big play button overlay */}
        {!playing && !isLoading && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity group-hover:bg-black/30"
            aria-label="Play video"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
              <Play className="h-8 w-8 text-white fill-white ml-1" />
            </div>
          </button>
        )}

        {/* Controls bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Progress bar */}
          <div
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-3 hover:h-1.5 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-primary rounded-full relative"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-white/80 transition-colors" aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={() => setMuted(!muted)} className="text-white hover:text-white/80 transition-colors" aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <span className="text-xs text-white/80 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex-1" />
            <button onClick={toggleFullscreen} className="text-white hover:text-white/80 transition-colors" aria-label="Fullscreen">
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Audio Player Component ────────────────────────────────────────────────────

function AudioPlayer({
  mediaUrl,
  title,
  onProgress80,
}: {
  mediaUrl: string | null
  title: string
  onProgress80: () => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [muted, setMuted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const eightyReached = useRef(false)

  const handleTimeUpdate = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    setCurrentTime(a.currentTime)
    if (a.duration && !eightyReached.current && a.currentTime / a.duration >= 0.8) {
      eightyReached.current = true
      onProgress80()
    }
  }, [onProgress80])

  const handleLoadedMetadata = useCallback(() => {
    const a = audioRef.current
    if (a) {
      setDuration(a.duration)
      setIsLoading(false)
    }
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
  }, [])

  const togglePlay = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      a.play()
      setPlaying(true)
    } else {
      a.pause()
      setPlaying(false)
    }
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current
    if (!a || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    a.currentTime = pct * duration
  }, [duration])

  const handleVolumeChange = useCallback((v: number[]) => {
    const a = audioRef.current
    if (!a) return
    const val = v[0]
    setVolume(val)
    a.volume = val / 100
    if (val === 0) setMuted(true)
    else setMuted(false)
  }, [])

  useEffect(() => {
    const a = audioRef.current
    if (a) {
      a.volume = volume / 100
    }
  }, [])

  if (!mediaUrl) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 flex flex-col items-center justify-center text-muted-foreground">
          <Headphones className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm font-medium mb-1">Audio Not Available</p>
          <p className="text-xs">The audio for this lesson will be available soon</p>
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card className="border-rose-200 bg-rose-50/50">
        <CardContent className="p-8 flex flex-col items-center justify-center text-rose-700">
          <AlertCircle className="h-12 w-12 mb-3" />
          <p className="text-sm font-medium mb-1">Unable to load audio</p>
          <p className="text-xs text-rose-500">Please try again later</p>
        </CardContent>
      </Card>
    )
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-violet-600/10 via-primary/5 to-cyan-600/10 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <button
            onClick={togglePlay}
            className="shrink-0 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : playing ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-lg truncate">{title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>
        </div>

        {/* Waveform */}
        <div className="mb-4">
          <WaveformBars isPlaying={playing} progress={progressPct} />
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-2 bg-muted rounded-full cursor-pointer mb-4 hover:h-3 transition-all"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary rounded-full transition-all duration-100 relative"
            style={{ width: `${progressPct}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full shadow-md border-2 border-white" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="text-foreground hover:text-primary transition-colors" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button onClick={() => { setMuted(!muted); if (audioRef.current) audioRef.current.muted = !muted }} className="text-foreground hover:text-primary transition-colors" aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <div className="w-24 hidden sm:block">
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => handleVolumeChange([parseInt(e.target.value)])}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              aria-label="Volume"
            />
          </div>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <audio
          ref={audioRef}
          src={mediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      </div>
    </Card>
  )
}

// ─── PDF Viewer Component ──────────────────────────────────────────────────────

function PdfViewer({
  mediaUrl,
  content,
}: {
  mediaUrl: string | null
  content: string
}) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !mediaUrl) {
    return (
      <div>
        <Card className="border-dashed mb-6">
          <CardContent className="p-8 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">
              {mediaUrl ? 'Unable to load PDF' : 'PDF Not Available'}
            </p>
            <p className="text-xs">
              {mediaUrl ? 'Please try again later' : 'The PDF for this lesson will be available soon'}
            </p>
          </CardContent>
        </Card>
        {content && <TextContent content={content} />}
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-border/50 bg-stone-100 mb-4">
        <iframe
          src={mediaUrl}
          className="w-full border-0"
          style={{ height: '600px' }}
          title="PDF Viewer"
          onError={() => setHasError(true)}
        />
      </div>
      <div className="flex items-center justify-between mb-6">
        <a
          href={mediaUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      </div>
      {content && <TextContent content={content} />}
    </div>
  )
}

// ─── Webbook Viewer Component ──────────────────────────────────────────────────

function WebbookViewer({
  mediaUrl,
  content,
}: {
  mediaUrl: string | null
  content: string
}) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !mediaUrl) {
    return (
      <div>
        <Card className="border-dashed mb-6">
          <CardContent className="p-8 flex flex-col items-center justify-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">
              {mediaUrl ? 'Unable to load content' : 'Webbook Not Available'}
            </p>
            <p className="text-xs">
              {mediaUrl ? 'Please try again later' : 'The webbook for this lesson will be available soon'}
            </p>
          </CardContent>
        </Card>
        {content && <TextContent content={content} />}
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-border/50 bg-white">
        <iframe
          src={mediaUrl}
          className="w-full border-0"
          style={{ height: '700px' }}
          title="Webbook Viewer"
          onError={() => setHasError(true)}
        />
      </div>
      {content && (
        <div className="mt-6">
          <TextContent content={content} />
        </div>
      )}
    </div>
  )
}

// ─── Text Content Component ────────────────────────────────────────────────────

function TextContent({ content }: { content: string }) {
  if (!content) return null

  return (
    <div className="prose prose-stone max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-foreground mt-5 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-foreground/90 leading-relaxed mb-4">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1.5 text-foreground/90">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-foreground/90">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 bg-primary/5 rounded-r-lg italic text-foreground/80">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="text-foreground/80">{children}</em>,
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground/90">{children}</code>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// ─── Presentation Viewer Component ─────────────────────────────────────────────

function PresentationViewer({ presentationUrl }: { presentationUrl: string }) {
  const isEmbeddable =
    presentationUrl.includes('docs.google.com') ||
    presentationUrl.includes('slideshare') ||
    presentationUrl.includes('prezi')

  // Extract a display name from the URL for the open button
  const getOpenLabel = () => {
    if (presentationUrl.includes('docs.google.com')) return 'Open in Google Slides'
    if (presentationUrl.includes('slideshare')) return 'Open on SlideShare'
    if (presentationUrl.includes('prezi')) return 'Open in Prezi'
    return 'Open Presentation'
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-emerald-600/10 via-primary/5 to-teal-600/10 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Newspaper className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">Presentation</h3>
            <p className="text-xs text-muted-foreground truncate">{presentationUrl}</p>
          </div>
        </div>

        {isEmbeddable ? (
          <div className="rounded-lg overflow-hidden border border-border/50 bg-white">
            <iframe
              src={presentationUrl}
              className="w-full border-0"
              style={{ height: '500px' }}
              title="Presentation Viewer"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="gap-1.5">
              <a href={presentationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                {getOpenLabel()}
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={presentationUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Download
              </a>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Embedded Content Component ────────────────────────────────────────────────

function EmbeddedContent({ embedCode }: { embedCode: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-sky-600/10 via-primary/5 to-indigo-600/10 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Embedded Content</h3>
            <p className="text-xs text-muted-foreground">Interactive content from an external source</p>
          </div>
        </div>

        <div
          className="rounded-lg overflow-hidden border border-border/50 bg-white [&>iframe]:w-full [&>iframe]:border-0"
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
      </div>
    </Card>
  )
}

// ─── External Link Component ───────────────────────────────────────────────────

function ExternalLinkCard({ externalUrl }: { externalUrl: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-amber-600/10 via-primary/5 to-orange-600/10 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <ExternalLink className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">External Resource</h3>
            <p className="text-xs text-muted-foreground">Reference material from an external source</p>
          </div>
        </div>

        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors break-all"
        >
          <Globe className="h-4 w-4 shrink-0" />
          {externalUrl}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      </div>
    </Card>
  )
}

// ─── Downloadable Resource Component ───────────────────────────────────────────

function DownloadableResource({ resourceUrl }: { resourceUrl: string }) {
  // Extract filename from URL
  const getFilename = (url: string) => {
    try {
      const pathname = new URL(url).pathname
      const parts = pathname.split('/')
      const filename = parts[parts.length - 1]
      return filename ? decodeURIComponent(filename) : 'Download Resource'
    } catch {
      // If URL parsing fails, try extracting the last segment
      const parts = url.split('/')
      return parts[parts.length - 1] || 'Download Resource'
    }
  }

  const filename = getFilename(resourceUrl)

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-rose-600/10 via-primary/5 to-pink-600/10 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">Download Resources</h3>
            <p className="text-xs text-muted-foreground truncate font-mono">{filename}</p>
          </div>
        </div>

        <Button asChild size="sm" className="gap-1.5">
          <a href={resourceUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Download File
          </a>
        </Button>
      </div>
    </Card>
  )
}

// ─── Main LessonPlayer Component ───────────────────────────────────────────────

export function LessonPlayer() {
  const { selectedCourseId, selectedLessonId, navigate, currentUser } = useAppStore()
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [course, setCourse] = useState<CourseData | null>(null)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesLoaded, setNotesLoaded] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch course & lesson data
  useEffect(() => {
    if (selectedCourseId && selectedLessonId) {
      fetchCourseAndLesson()
    }
  }, [selectedCourseId, selectedLessonId])

  const fetchCourseAndLesson = async () => {
    setLoading(true)
    try {
      const courseRes = await fetch(`/api/courses/${selectedCourseId}`)
      const courseData = await courseRes.json()
      setCourse(courseData)

      // Find the current lesson
      for (const mod of courseData.modules) {
        const found = mod.lessons.find((l: { id: string }) => l.id === selectedLessonId)
        if (found) {
          setLesson(found)
        }
      }

      // Fetch progress
      if (currentUser) {
        try {
          const progressRes = await fetch(`/api/progress?userId=${currentUser.id}&courseId=${selectedCourseId}`)
          if (progressRes.ok) {
            const progressData = await progressRes.json()
            setCompletedLessons(progressData.completedLessons || [])
            setEnrollmentId(progressData.enrollmentId)
          }
        } catch {
          // Not enrolled
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch notes when lesson changes
  useEffect(() => {
    if (currentUser && selectedLessonId) {
      fetchNotes()
    } else {
      setNotes('')
      setNotesLoaded(false)
    }
  }, [selectedLessonId, currentUser])

  const fetchNotes = async () => {
    if (!currentUser || !selectedLessonId) return
    try {
      const res = await fetch(`/api/notes?userId=${currentUser.id}&lessonId=${selectedLessonId}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data.content || '')
        setNotesLoaded(true)
      }
    } catch {
      // Silently fail
    }
  }

  // Auto-save notes (debounced)
  const saveNotes = useCallback(async (content: string) => {
    if (!currentUser || !selectedLessonId) return
    setNotesSaving(true)
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          lessonId: selectedLessonId,
          content,
        }),
      })
    } catch {
      // Silently fail
    } finally {
      setNotesSaving(false)
    }
  }, [currentUser, selectedLessonId])

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(value)
    }, 1500)
  }, [saveNotes])

  // Mark complete
  const handleMarkComplete = async () => {
    if (!currentUser || !enrollmentId) {
      toast.error('Please sign in to track progress')
      return
    }
    setMarkingComplete(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          lessonId: selectedLessonId,
          enrollmentId,
        }),
      })
      if (res.ok) {
        setCompletedLessons((prev) => [...prev, selectedLessonId!])
        toast.success('Lesson completed! 🎉')
      }
    } catch {
      toast.error('Failed to mark as complete')
    } finally {
      setMarkingComplete(false)
    }
  }

  // Auto-mark complete from media playback
  const handleMediaProgress80 = useCallback(() => {
    if (!currentUser || !enrollmentId) return
    if (completedLessons.includes(selectedLessonId!)) return
    handleMarkComplete()
  }, [currentUser, enrollmentId, selectedLessonId, completedLessons])

  // Navigation helpers
  const getAllLessons = () => {
    if (!course) return []
    return course.modules
      .sort((a, b) => a.order - b.order)
      .flatMap((mod) =>
        mod.lessons
          .sort((a, b) => a.order - b.order)
          .map((l) => ({ ...l, moduleId: mod.id, moduleTitle: mod.title }))
      )
  }

  const getCurrentIndex = () => {
    const all = getAllLessons()
    return all.findIndex((l) => l.id === selectedLessonId)
  }

  const goToLesson = (lessonId: string) => {
    navigate('lesson', { courseId: selectedCourseId, lessonId })
  }

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <p className="text-muted-foreground mb-6">The lesson you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => navigate('courses')}>Back to Courses</Button>
        </div>
      </div>
    )
  }

  const allLessons = getAllLessons()
  const currentIndex = getCurrentIndex()
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const isCompleted = completedLessons.includes(selectedLessonId!)
  const progressPct = allLessons.length > 0
    ? Math.round((completedLessons.length / allLessons.length) * 100)
    : 0

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-background">
      {/* ── Sidebar ── */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } shrink-0 border-r border-border/50 bg-white transition-all duration-300 overflow-hidden hidden lg:block`}
      >
        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="p-4">
            {/* Sidebar header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-foreground">Course Content</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Course title */}
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2 font-medium">
              {course.title}
            </p>

            {/* Modules and lessons */}
            {course.modules
              .sort((a, b) => a.order - b.order)
              .map((mod) => (
                <div key={mod.id} className="mb-3">
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                    Module {mod.order + 1}: {mod.title}
                  </h4>
                  <div className="space-y-0.5">
                    {mod.lessons
                      .sort((a, b) => a.order - b.order)
                      .map((l) => {
                        const isActive = l.id === selectedLessonId
                        const done = completedLessons.includes(l.id)
                        return (
                          <button
                            key={l.id}
                            onClick={() => goToLesson(l.id)}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm transition-all duration-200 ${
                              isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : done
                                ? 'text-muted-foreground hover:bg-accent/50'
                                : 'text-foreground hover:bg-accent/50'
                            }`}
                          >
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0 ${
                              done
                                ? 'bg-emerald-100 text-emerald-700'
                                : isActive
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {done ? (
                                <CheckCircle className="h-3.5 w-3.5" />
                              ) : (
                                getLessonTypeIcon(l.type)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="truncate block">{l.title}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {l.duration}
                            </span>
                          </button>
                        )
                      })}

                    {/* Quizzes */}
                    {mod.quizzes && mod.quizzes.length > 0 && mod.quizzes.map((q) => (
                      <button
                        key={q.id}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm text-foreground hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full shrink-0 bg-violet-100 text-violet-700">
                          <FileText className="h-3 w-3" />
                        </div>
                        <span className="truncate">{q.title}</span>
                        <Badge variant="outline" className="text-[9px] ml-auto px-1.5 py-0 h-4">
                          Quiz
                        </Badge>
                      </button>
                    ))}

                    {/* Assignments */}
                    {mod.assignments && mod.assignments.length > 0 && mod.assignments.map((a) => (
                      <button
                        key={a.id}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm text-foreground hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full shrink-0 bg-orange-100 text-orange-700">
                          <FileText className="h-3 w-3" />
                        </div>
                        <span className="truncate">{a.title}</span>
                        <Badge variant="outline" className="text-[9px] ml-auto px-1.5 py-0 h-4">
                          Assignment
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            {/* Progress bar */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Course Progress</span>
                <span className="font-semibold text-primary">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {completedLessons.length} of {allLessons.length} lessons completed
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* ── Top Toolbar ── */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border/50 px-3 sm:px-5 lg:px-6 py-2.5 flex items-center gap-2">
          {/* Sidebar toggle */}
          {!sidebarOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSidebarOpen(true)}>
                  <BookOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Open sidebar</TooltipContent>
            </Tooltip>
          )}

          {/* Back button */}
          <Button variant="ghost" size="sm" onClick={() => navigate('course-detail', { courseId: selectedCourseId })} className="text-muted-foreground shrink-0">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Back to Course</span>
          </Button>

          {/* Separator */}
          <Separator orientation="vertical" className="h-5 mx-1 hidden sm:block" />

          {/* Lesson type badge */}
          <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 shrink-0 ${getLessonTypeBadgeColor(lesson.type)}`}>
            {getLessonTypeIcon(lesson.type)}
            <span className="ml-1">{getLessonTypeLabel(lesson.type)}</span>
          </Badge>

          {/* Duration badge */}
          <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            {lesson.duration}
          </Badge>

          <div className="flex-1" />

          {/* Notes toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={notesOpen ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setNotesOpen(!notesOpen)}
                className="shrink-0 gap-1.5"
              >
                <PenLine className="h-4 w-4" />
                <span className="hidden sm:inline">Notes</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Personal notes</TooltipContent>
          </Tooltip>

          {/* Mark complete button */}
          {!isCompleted ? (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 shrink-0 gap-1.5"
              onClick={handleMarkComplete}
              disabled={markingComplete || !currentUser}
            >
              {markingComplete ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Complete</span>
            </Button>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 shrink-0">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        {/* ── Content Area ── */}
        <div className="flex-1 flex min-h-0">
          {/* Main scroll content */}
          <ScrollArea className={`flex-1 transition-all duration-300 ${notesOpen ? 'hidden md:block md:flex-1' : ''}`}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
              {/* Lesson header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">
                    Lesson {currentIndex + 1} of {allLessons.length}
                  </Badge>
                  {lesson.module && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 text-muted-foreground">
                      {lesson.module.title}
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {lesson.title}
                </h1>
              </div>

              {/* ── Content Type Renderers ── */}
              <div className="mb-8">
                {lesson.type === 'video' && (
                  <VideoPlayer
                    mediaUrl={lesson.mediaUrl}
                    onProgress80={handleMediaProgress80}
                  />
                )}

                {lesson.type === 'audio' && (
                  <AudioPlayer
                    mediaUrl={lesson.mediaUrl}
                    title={lesson.title}
                    onProgress80={handleMediaProgress80}
                  />
                )}

                {lesson.type === 'pdf' && (
                  <PdfViewer
                    mediaUrl={lesson.mediaUrl}
                    content={lesson.content}
                  />
                )}

                {lesson.type === 'webbook' && (
                  <WebbookViewer
                    mediaUrl={lesson.mediaUrl}
                    content={lesson.content}
                  />
                )}

                {(lesson.type === 'text' || lesson.type === 'notes') && (
                  <TextContent content={lesson.content} />
                )}

                {/* Show content below video/audio as supplementary notes */}
                {(lesson.type === 'video' || lesson.type === 'audio') && lesson.content && (
                  <div className="mt-8">
                    <Separator className="mb-6" />
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      Lesson Notes
                    </h3>
                    <TextContent content={lesson.content} />
                  </div>
                )}

                {/* ── Additional Content Types ── */}
                {/* These render alongside the primary content type, allowing a lesson
                    to have e.g. video + presentation + downloadable resource */}

                {/* Presentation */}
                {lesson.presentationUrl && (
                  <div className="mt-6">
                    <PresentationViewer presentationUrl={lesson.presentationUrl} />
                  </div>
                )}

                {/* Embedded Content */}
                {lesson.embedCode && (
                  <div className="mt-6">
                    <EmbeddedContent embedCode={lesson.embedCode} />
                  </div>
                )}

                {/* External Link */}
                {lesson.externalUrl && (
                  <div className="mt-6">
                    <ExternalLinkCard externalUrl={lesson.externalUrl} />
                  </div>
                )}

                {/* Downloadable Resource */}
                {lesson.resourceUrl && (
                  <div className="mt-6">
                    <DownloadableResource resourceUrl={lesson.resourceUrl} />
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* ── Mark Complete (bottom) ── */}
              {!isCompleted && (
                <div className="mb-6">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 h-11 text-sm font-medium gap-2"
                    onClick={handleMarkComplete}
                    disabled={markingComplete || !currentUser}
                  >
                    {markingComplete ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Mark as Complete
                  </Button>
                  {!currentUser && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Sign in to track your progress
                    </p>
                  )}
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="flex items-center justify-between gap-3 mb-8">
                {prevLesson ? (
                  <Button
                    variant="outline"
                    onClick={() => goToLesson(prevLesson.id)}
                    className="gap-1.5 flex-1 sm:flex-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <div className="text-left hidden sm:block">
                      <div className="text-[10px] text-muted-foreground">Previous</div>
                      <div className="text-xs font-medium truncate max-w-[140px]">{prevLesson.title}</div>
                    </div>
                    <span className="sm:hidden text-xs">Previous</span>
                  </Button>
                ) : (
                  <div />
                )}

                {isCompleted && nextLesson ? (
                  <Button
                    className="bg-primary hover:bg-primary/90 gap-1.5 flex-1 sm:flex-none"
                    onClick={() => goToLesson(nextLesson.id)}
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-primary-foreground/70">Next Lesson</div>
                      <div className="text-xs font-medium truncate max-w-[140px]">{nextLesson.title}</div>
                    </div>
                    <span className="sm:hidden text-xs">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : isCompleted && !nextLesson ? (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                    onClick={() => navigate('course-detail', { courseId: selectedCourseId })}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Course Complete!
                  </Button>
                ) : nextLesson ? (
                  <Button
                    variant="outline"
                    onClick={() => goToLesson(nextLesson.id)}
                    className="gap-1.5 flex-1 sm:flex-none"
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-muted-foreground">Next</div>
                      <div className="text-xs font-medium truncate max-w-[140px]">{nextLesson.title}</div>
                    </div>
                    <span className="sm:hidden text-xs">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div />
                )}
              </div>

              {/* ── Progress Summary ── */}
              <Card className="bg-accent/30 border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground font-medium">Course Progress</span>
                    <span className="font-bold text-primary">
                      {completedLessons.length}/{allLessons.length} lessons
                    </span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* ── Notes Panel (inline on desktop, sheet on mobile) ── */}
          {/* Desktop inline panel */}
          {notesOpen && (
            <div className="hidden md:flex w-80 lg:w-96 shrink-0 border-l border-border/50 bg-white flex-col">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Personal Notes</h3>
                </div>
                <div className="flex items-center gap-2">
                  {notesSaving && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {notesLoaded && !notesSaving && notes && (
                    <span className="text-[10px] text-emerald-600">Saved</span>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setNotesOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4">
                <Textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Write your personal notes here...&#10;&#10;Notes are auto-saved as you type."
                  className="min-h-[300px] h-full resize-none border-dashed text-sm leading-relaxed focus-visible:border-primary/50"
                />
              </div>
              <div className="p-4 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground">
                  Notes are private and auto-saved. Only you can see them.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile Sidebar (Sheet) ── */}
        <Sheet open={sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024} onOpenChange={(open) => { if (!open) setSidebarOpen(false) }}>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 pb-2">
              <SheetTitle className="text-sm">Course Content</SheetTitle>
              <SheetDescription className="text-xs">{course.title}</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="p-4 pt-0">
                {course.modules
                  .sort((a, b) => a.order - b.order)
                  .map((mod) => (
                    <div key={mod.id} className="mb-3">
                      <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                        Module {mod.order + 1}: {mod.title}
                      </h4>
                      <div className="space-y-0.5">
                        {mod.lessons
                          .sort((a, b) => a.order - b.order)
                          .map((l) => {
                            const isActive = l.id === selectedLessonId
                            const done = completedLessons.includes(l.id)
                            return (
                              <button
                                key={l.id}
                                onClick={() => { goToLesson(l.id); setSidebarOpen(false) }}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm transition-colors ${
                                  isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : done
                                    ? 'text-muted-foreground hover:bg-accent/50'
                                    : 'text-foreground hover:bg-accent/50'
                                }`}
                              >
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0 ${
                                  done
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isActive
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {done ? (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  ) : (
                                    getLessonTypeIcon(l.type)
                                  )}
                                </div>
                                <span className="truncate">{l.title}</span>
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* ── Mobile Notes (Sheet) ── */}
        <Sheet open={notesOpen && typeof window !== 'undefined' && window.innerWidth < 768} onOpenChange={(open) => { if (!open) setNotesOpen(false) }}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-sm flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-primary" />
                    Personal Notes
                  </SheetTitle>
                  <SheetDescription className="text-xs mt-1">
                    {notesSaving ? 'Saving...' : notes ? 'Saved' : 'Auto-saved as you type'}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="flex-1 p-4 pt-0">
              <Textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Write your personal notes here...&#10;&#10;Notes are auto-saved as you type."
                className="min-h-[300px] h-full resize-none border-dashed text-sm leading-relaxed"
              />
            </div>
            <div className="p-4 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">
                Notes are private and auto-saved. Only you can see them.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
