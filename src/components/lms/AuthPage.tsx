'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  BookOpen, 
  GraduationCap, 
  ArrowRight,
  Shield,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
} from 'lucide-react'

type SelectedRole = 'student' | 'admin' | 'instructor' | null

const roleConfig = {
  student: {
    icon: GraduationCap,
    title: 'Student',
    description: 'Access courses, quizzes, and track your progress',
    demoEmail: 'student@dreamcraft.org',
    demoPassword: 'demo123',
    dashboard: 'dashboard' as const,
    color: 'text-amber-600',
    bgHover: 'hover:border-amber-400 hover:bg-amber-50/50',
    bgSelected: 'border-amber-500 bg-amber-50/80',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  admin: {
    icon: Shield,
    title: 'Administrator',
    description: 'Full system control: manage users, courses, and settings',
    demoEmail: 'admin@dreamcraft.org',
    demoPassword: 'demo123',
    dashboard: 'admin-dashboard' as const,
    color: 'text-emerald-600',
    bgHover: 'hover:border-emerald-400 hover:bg-emerald-50/50',
    bgSelected: 'border-emerald-500 bg-emerald-50/80',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  instructor: {
    icon: BookOpen,
    title: 'Instructor',
    description: 'Manage your courses, grade assignments, and communicate with students',
    demoEmail: 'instructor@dreamcraft.org',
    demoPassword: 'demo123',
    dashboard: 'instructor-dashboard' as const,
    color: 'text-violet-600',
    bgHover: 'hover:border-violet-400 hover:bg-violet-50/50',
    bgSelected: 'border-violet-500 bg-violet-50/80',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
} as const

export function AuthPage() {
  const { currentPage, navigate, setUser } = useAppStore()
  const isLogin = currentPage === 'login'
  const [authMode, setAuthMode] = useState<'default' | 'forgot-password' | 'reset-password'>('default')
  const [resetToken, setResetToken] = useState('')
  const [resetEmail, setResetEmail] = useState('')

  const handleForgotSuccess = (token: string, email: string) => {
    setResetToken(token)
    setResetEmail(email)
    setAuthMode('reset-password')
  }

  const handleResetSuccess = () => {
    setAuthMode('default')
    setResetToken('')
    setResetEmail('')
    navigate('login')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Mobile branding */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <img src="/main-logo.png" alt="DreamCraft" className="h-9 w-9 rounded-lg object-cover" />
          <div>
            <span className="text-base font-bold text-foreground">DreamCraft</span>
            <span className="text-[10px] font-medium text-muted-foreground block leading-tight tracking-wider uppercase">Christian Institute</span>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-2xl font-bold text-foreground">
              {authMode === 'forgot-password'
                ? 'Reset Password'
                : authMode === 'reset-password'
                ? 'Set New Password'
                : isLogin
                ? 'Welcome Back'
                : 'Create Account'}
            </h2>
            <CardDescription className="text-muted-foreground">
              {authMode === 'forgot-password'
                ? 'Enter your email to receive a password reset token'
                : authMode === 'reset-password'
                ? 'Enter the reset token and your new password'
                : isLogin
                ? 'Sign in to continue your learning journey'
                : 'Start your free Christian education today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authMode === 'forgot-password' ? (
              <ForgotPasswordForm onSuccess={handleForgotSuccess} onBack={() => setAuthMode('default')} />
            ) : authMode === 'reset-password' ? (
              <ResetPasswordForm token={resetToken} email={resetEmail} onSuccess={handleResetSuccess} onBack={() => setAuthMode('forgot-password')} />
            ) : isLogin ? (
              <LoginForm onForgotPassword={() => setAuthMode('forgot-password')} />
            ) : (
              <RegisterForm />
            )}
          </CardContent>
        </Card>

        {/* Switch mode */}
        {authMode === 'default' && (
          <div className="text-center mt-6 text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => navigate('register')}
                  className="text-primary font-medium hover:underline focus:outline-none focus:underline"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('login')}
                  className="text-primary font-medium hover:underline focus:outline-none focus:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LoginForm({ onForgotPassword }: { onForgotPassword: () => void }) {
  const { navigate, setUser } = useAppStore()
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground text-center">
          Choose how you want to sign in
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(roleConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedRole(key as SelectedRole)}
                className={`group relative flex flex-col items-center gap-2.5 rounded-xl border-2 border-border/60 p-4 sm:p-5 text-center transition-all duration-200 ${config.bgHover} focus:outline-none focus:ring-2 focus:ring-primary/30`}
              >
                <div className={`rounded-full p-2.5 ${config.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{config.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-1 hidden sm:block">
                    {config.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        {/* Show descriptions on mobile below cards */}
        <div className="sm:hidden space-y-1">
          {Object.entries(roleConfig).map(([key, config]) => (
            <p key={key} className="text-[11px] text-muted-foreground text-center">
              <span className="font-medium text-foreground">{config.title}:</span> {config.description}
            </p>
          ))}
        </div>
      </div>
    )
  }

  // Login form with selected role
  const config = roleConfig[selectedRole]
  const RoleIcon = config.icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!password.trim()) {
      setError('Please enter your password')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: email.trim(), password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid email or password')
        return
      }

      const user = data.user

      // Validate that the user's role matches the selected role
      if (user.role !== selectedRole) {
        const roleTitle = config.title
        setError(`This account does not have ${roleTitle} privileges`)
        return
      }

      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      })
      navigate(config.dashboard)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: config.demoEmail, password: config.demoPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Demo login failed')
        return
      }

      const user = data.user

      // Validate role match for demo login too
      if (user.role !== selectedRole) {
        const roleTitle = config.title
        setError(`This account does not have ${roleTitle} privileges`)
        return
      }

      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      })
      navigate(config.dashboard)
    } catch {
      setError('Demo login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected role indicator with back button */}
      <div className="flex items-center gap-3 pb-3 border-b border-border/60">
        <button
          type="button"
          onClick={() => {
            setSelectedRole(null)
            setEmail('')
            setPassword('')
            setError('')
          }}
          className="flex items-center justify-center h-8 w-8 rounded-lg border border-border/60 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Back to role selection"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`rounded-full p-1.5 ${config.iconBg}`}>
            <RoleIcon className={`h-4 w-4 ${config.iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground">{config.title} Login</p>
            <p className="text-[11px] text-muted-foreground truncate">{config.description}</p>
          </div>
        </div>
        <CheckCircle2 className={`h-5 w-5 ${config.iconColor} shrink-0`} />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="login-email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={loading}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <button
            type="button"
            className="text-xs text-primary hover:underline focus:outline-none"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-medium"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <ArrowRight className="h-4 w-4 mr-2" />
        )}
        Sign In as {config.title}
      </Button>

      <div className="relative">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground uppercase">
          or
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className={`w-full h-11 text-base font-medium border-primary/20 hover:bg-primary/5`}
        disabled={loading}
        onClick={handleDemoLogin}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <RoleIcon className="h-4 w-4 mr-2" />
        )}
        Try Demo {config.title} Account
      </Button>

      <p className="text-[11px] text-muted-foreground text-center">
        Demo: {config.demoEmail} / {config.demoPassword}
      </p>
    </form>
  )
}

function RegisterForm() {
  const { navigate, setUser } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!password.trim()) {
      setError('Please enter a password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name: name.trim(), email: email.trim(), password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        return
      }

      const user = data.user
      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      })
      navigate('dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="register-name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10"
            disabled={loading}
            autoComplete="name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={loading}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={loading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-confirm"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10"
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-medium"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <GraduationCap className="h-4 w-4 mr-2" />
        )}
        Create Free Account
      </Button>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        By creating an account, you agree to our{' '}
        <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{' '}
        and{' '}
        <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
      </p>

      <p className="text-[11px] text-muted-foreground text-center">
        New accounts are registered as Student role.
      </p>
    </form>
  )
}

function ForgotPasswordForm({ onSuccess, onBack }: { onSuccess: (token: string, email: string) => void; onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot-password', email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to generate reset token')
        return
      }

      if (data.token) {
        onSuccess(data.token, data.email)
      } else {
        setError('If an account with that email exists, a reset token has been sent.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 focus:outline-none"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </button>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 border border-destructive/20">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center p-4 rounded-full bg-primary/10 w-fit mx-auto mb-2">
        <KeyRound className="h-8 w-8 text-primary" />
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Enter the email address associated with your account and we&apos;ll generate a reset token for you.
      </p>

      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={loading}
            autoComplete="email"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-medium"
        disabled={loading || !email.trim()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Mail className="h-4 w-4 mr-2" />
        )}
        Send Reset Token
      </Button>
    </form>
  )
}

function ResetPasswordForm({ token, email, onSuccess, onBack }: { token: string; email: string; onSuccess: () => void; onBack: () => void }) {
  const [resetToken, setResetToken] = useState(token)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!resetToken.trim()) {
      setError('Please enter the reset token')
      return
    }
    if (!newPassword.trim()) {
      setError('Please enter a new password')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          token: resetToken.trim(),
          newPassword,
          confirmPassword,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        return
      }

      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 focus:outline-none"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 border border-destructive/20">
          {error}
        </div>
      )}

      {/* Demo mode notice with token */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-800">Reset Token Generated</span>
        </div>
        <p className="text-xs text-emerald-700 mb-2">
          In production, this token would be sent to <strong>{email}</strong>. For demo purposes, it&apos;s shown below:
        </p>
        <div className="bg-white rounded border border-emerald-200 p-2">
          <code className="text-xs break-all text-emerald-900 select-all">{token}</code>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-token">Reset Token</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-token"
            type="text"
            placeholder="Paste your reset token here"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={loading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirm-new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10"
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-medium"
        disabled={loading || !resetToken.trim() || !newPassword.trim() || !confirmPassword.trim()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <CheckCircle2 className="h-4 w-4 mr-2" />
        )}
        Reset Password
      </Button>
    </form>
  )
}
