'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Trophy, Code, Settings, ArrowLeft, Camera, Save, Edit3, Upload, X } from 'lucide-react'
import { Button } from '@codearena/ui'
import Link from 'next/link'
import axios from 'axios'

interface ProfileData {
  displayName: string
  email: string
  bio: string
  githubUrl: string
  linkedinUrl: string
  websiteUrl: string
  languages: string[]
  skillLevel: string
  rating: number
  totalSessions: number
  problemsSolved: number
  streak: number
  coins: number
  createdAt: string
  lastLoginAt: string
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    email: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    languages: [],
    skillLevel: '',
    rating: 0,
    totalSessions: 0,
    problemsSolved: 0,
    streak: 0,
    coins: 0,
    createdAt: '',
    lastLoginAt: ''
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      // Fetch user profile data
      fetchProfileData()
    }
  }, [user])

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setProfileData(data.data.user)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    }
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        })
        
        if (response.ok) {
          setIsEditing(false)
          // Refresh profile data
          await fetchProfileData()
          // Show success message
          alert('Profile updated successfully!')
        } else {
          const errorData = await response.json()
          alert(`Failed to update profile: ${errorData.message || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.post('/api/users/upload-avatar', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true

      })

      if (response.ok) {
        const result = await response.json()
        // Update the user's avatar in the auth context
        if (user) {
          // You might need to update the auth context to refresh user data
          window.location.reload() // Simple refresh for now
        }
        alert('Avatar uploaded successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Coding Background with Parallax Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Code Lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 text-emerald-400 font-mono text-sm animate-pulse">
            <div>function solveProblem() {'{'}</div>
            <div className="ml-4">return "Hello World";</div>
            <div>{'}'}</div>
          </div>
          <div className="absolute top-32 right-20 text-emerald-400 font-mono text-sm animate-pulse delay-1000">
            <div>const algorithm = () => {'{'}</div>
            <div className="ml-4">// Optimize this</div>
            <div className="ml-4">return result;</div>
            <div>{'}'}</div>
          </div>
          <div className="absolute bottom-32 left-20 text-emerald-400 font-mono text-sm animate-pulse delay-2000">
            <div>class CodeArena {'{'}</div>
            <div className="ml-4">constructor() {'{'}</div>
            <div className="ml-8">this.skills = [];</div>
            <div className="ml-4">{'}'}</div>
            <div>{'}'}</div>
          </div>
          <div className="absolute top-1/2 right-1/3 text-emerald-400 font-mono text-sm animate-pulse delay-3000">
            <div>if (user.isLoggedIn) {'{'}</div>
            <div className="ml-4">startCoding();</div>
            <div>{'}'}</div>
          </div>
        </div>
        
        {/* Floating Code Symbols */}
        <div className="absolute top-20 left-1/4 text-emerald-500 text-2xl animate-bounce">
          {'{'}
        </div>
        <div className="absolute top-40 right-1/4 text-emerald-500 text-2xl animate-bounce delay-500">
          {'}'}
        </div>
        <div className="absolute bottom-20 left-1/3 text-emerald-500 text-2xl animate-bounce delay-1000">
          {'['}
        </div>
        <div className="absolute bottom-40 right-1/3 text-emerald-500 text-2xl animate-bounce delay-1500">
          {']'}
        </div>
        
        {/* Matrix-like Rain Effect */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-emerald-400 font-mono text-xs animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          ))}
        </div>
      </div>
      {/* Header */}
      <header className="border-b border-slate-700 relative z-10 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant="outline" 
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
            {isEditing && (
              <Button 
                onClick={handleSave}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <div className="glass-effect rounded-2xl p-8 border border-slate-700 mb-8 bg-slate-800/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-slate-700 overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isEditing && (
                  <button 
                    onClick={triggerFileUpload}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </button>
                )}
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Upload Progress */}
                {isUploading && (
                  <div className="absolute -bottom-2 left-0 right-0 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                      className="text-3xl font-bold bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-slate-100">{profileData.displayName || user.name}</h1>
                  )}
                  <p className="text-slate-400 mt-2">{profileData.email || user.email}</p>
                </div>

                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-300 mb-4">{profileData.bio || "No bio yet. Click 'Edit Profile' to add one!"}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{profileData.rating}</div>
                    <div className="text-sm text-slate-400">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{profileData.problemsSolved}</div>
                    <div className="text-sm text-slate-400">Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{profileData.streak}</div>
                    <div className="text-sm text-slate-400">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{profileData.coins}</div>
                    <div className="text-sm text-slate-400">Coins</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="glass-effect rounded-2xl p-6 border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-emerald-400" />
                Personal Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Skill Level</label>
                  {isEditing ? (
                    <select
                      value={profileData.skillLevel}
                      onChange={(e) => setProfileData({ ...profileData, skillLevel: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  ) : (
                    <p className="text-slate-300 capitalize">{profileData.skillLevel?.toLowerCase()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Programming Languages</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.languages.join(', ')}
                      onChange={(e) => setProfileData({ ...profileData, languages: e.target.value.split(', ').filter(lang => lang.trim()) })}
                      placeholder="JavaScript, Python, Java..."
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileData.languages.map((lang, index) => (
                        <span key={index} className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Member Since</label>
                  <p className="text-slate-300">
                    {new Date(profileData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="glass-effect rounded-2xl p-6 border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-emerald-400" />
                Social Links
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">GitHub</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.githubUrl}
                      onChange={(e) => setProfileData({ ...profileData, githubUrl: e.target.value })}
                      placeholder="https://github.com/username"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-slate-300">
                      {profileData.githubUrl ? (
                        <a href={profileData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                          {profileData.githubUrl}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">LinkedIn</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.linkedinUrl}
                      onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-slate-300">
                      {profileData.linkedinUrl ? (
                        <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                          {profileData.linkedinUrl}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.websiteUrl}
                      onChange={(e) => setProfileData({ ...profileData, websiteUrl: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-slate-300">
                      {profileData.websiteUrl ? (
                        <a href={profileData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                          {profileData.websiteUrl}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 