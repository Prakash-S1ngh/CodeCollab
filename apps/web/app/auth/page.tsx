'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react'
import { Button } from '@codearena/ui'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle, isLoading } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
      } else {
        console.log('signUp', formData.name, formData.email, formData.password)

        await signUp(formData.name, formData.email, formData.password)
      }
      router.push('/dashboard')
    } catch (error) {
      console.log('error', error) 
      setError('Authentication failed. Please try again.')
    }
  }

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle()
      router.push('/dashboard')
    } catch (error) {
      setError('Google authentication failed. Please try again.')
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Chrome className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent font-mono">
              CodeArena
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Sign in to continue coding' : 'Join thousands of developers'}
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          className="glass-effect rounded-2xl p-8 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <Button 
              onClick={handleGoogleAuth}
              variant="outline" 
              className="w-full h-12 text-base border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isLoading}
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">
                or continue with email
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-100 placeholder-slate-400"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-100 placeholder-slate-400"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-100 placeholder-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-slate-600" />
                  <span className="text-sm text-slate-400">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-emerald-400 hover:text-emerald-300 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Terms */}
        <motion.p 
          className="text-center text-sm text-slate-400 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">
            Privacy Policy
          </Link>
        </motion.p>
      </div>
    </div>
  )
} 