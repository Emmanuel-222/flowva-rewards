import { useState, useEffect } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Gift, AlertCircle } from 'lucide-react'

interface FormErrors {
  displayName?: string
  email?: string
  password?: string
}

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const referralCode = searchParams.get('ref')

  // Check if user came via /signup route or has referral code
  const shouldStartWithSignup = location.pathname === '/signup' || !!referralCode

  const [isSignUp, setIsSignUp] = useState(shouldStartWithSignup)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { signIn, signUp } = useAuth()

  // Auto-switch to signup mode if referral code is present or on /signup route
  useEffect(() => {
    if (shouldStartWithSignup) {
      setIsSignUp(true)
    }
  }, [shouldStartWithSignup])

  // Show referral code notification
  useEffect(() => {
    if (referralCode) {
      toast.success('Referral link detected! Sign up to claim your bonus.', { icon: '' })
    }
  }, [referralCode])

  // Clear errors when switching between sign in/up
  useEffect(() => {
    setErrors({})
    setTouched({})
  }, [isSignUp])

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    if (isSignUp && !/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (isSignUp && !/[0-9]/.test(password)) return 'Password must contain at least one number'
    return undefined
  }

  const validateDisplayName = (name: string): string | undefined => {
    if (!isSignUp) return undefined
    if (!name.trim()) return 'Name is required'
    if (name.trim().length < 2) return 'Name must be at least 2 characters'
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      displayName: validateDisplayName(displayName),
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate individual field on blur
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(email) }))
    } else if (field === 'password') {
      setErrors(prev => ({ ...prev, password: validatePassword(password) }))
    } else if (field === 'displayName') {
      setErrors(prev => ({ ...prev, displayName: validateDisplayName(displayName) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({ email: true, password: true, displayName: true })
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }
    
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName, referralCode || undefined)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Account created! Welcome to Flowva!')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Welcome back!')
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getInputClassName = (field: keyof FormErrors) => {
    const baseClass = "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all"
    if (touched[field] && errors[field]) {
      return `${baseClass} border-red-300 focus:ring-red-500 bg-red-50`
    }
    return `${baseClass} border-gray-200 focus:ring-purple-500`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="https://www.flowvahub.com/assets/flowva_icon-DYe7ga1V.png"
              alt="Flowva"
              className="w-12 h-12"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              Flowva
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isSignUp
              ? 'Start earning rewards today!'
              : 'Sign in to access your rewards'}
          </p>
        </div>

        {/* Referral Banner */}
        {referralCode && (
          <div className="bg-gradient-to-r from-purple-100 to-orange-100 rounded-xl p-4 mb-4 flex items-center gap-3 border border-purple-200">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">You've been invited!</p>
              <p className="text-sm text-gray-600">Sign up now to get started with Flowva</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={() => handleBlur('displayName')}
                  className={getInputClassName('displayName')}
                  placeholder="John Doe"
                />
                {touched.displayName && errors.displayName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.displayName}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={getInputClassName('email')}
                placeholder="you@example.com"
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={getInputClassName('password')}
                placeholder=""
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
              {isSignUp && !errors.password && (
                <p className="mt-1 text-xs text-gray-400">
                  Min 6 characters, 1 uppercase, 1 number
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
