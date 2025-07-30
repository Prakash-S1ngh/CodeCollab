'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Edit, 
  Save, 
  X, 
  Github, 
  Linkedin, 
  Globe, 
  Trophy, 
  Users, 
  Code, 
  Star,
  Calendar,
  MapPin,
  MessageCircle,
  Plus,
  Minus,
  ExternalLink,
  Camera,
  Trash2
} from 'lucide-react'
import { Button } from '@codearena/ui'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

interface User {
  id: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  githubUrl?: string
  linkedinUrl?: string
  websiteUrl?: string
  languages: string[]
  skillLevel: string
  rating: number
  totalSessions: number
  problemsSolved: number
  streak: number
  coins: number
  followersCount: number
  followingCount: number
  isFollowing?: boolean
  createdAt: string
}

interface Achievement {
  id: string
  unlockedAt: string
  achievement: {
    id: string
    title: string
    description: string
    icon: string
    rarity: string
  }
}

interface Session {
  id: string
  session: {
    id: string
    title: string
    type: string
    status: string
    language: string
    difficulty: string
    createdAt: string
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    languages: [] as string[],
    skillLevel: ''
  })
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const username = params.username as string

  useEffect(() => {
    fetchUserProfile()
  }, [username])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/profile/${username}`)
      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        setAchievements(data.data.achievements)
        setRecentSessions(data.data.recentSessions)
        setIsFollowing(data.data.user.isFollowing || false)
        setFollowersCount(data.data.user.followersCount)

        // Initialize edit form
        setEditForm({
          displayName: data.data.user.displayName,
          bio: data.data.user.bio || '',
          githubUrl: data.data.user.githubUrl || '',
          linkedinUrl: data.data.user.linkedinUrl || '',
          websiteUrl: data.data.user.websiteUrl || '',
          languages: data.data.user.languages,
          skillLevel: data.data.user.skillLevel
        })
      } else {
        router.push('/404')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/auth')
      return
    }

    try {
      const response = await fetch(`/api/users/follow/${user?.id}`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const data = await response.json()
        setUser(prev => prev ? { ...prev, ...data.data.user } : null)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const addLanguage = () => {
    setEditForm(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }))
  }

  const removeLanguage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const updateLanguage = (index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => i === index ? value : lang)
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUser(prev => prev ? { ...prev, avatar: data.data.url } : null)
      } else {
        console.error('Failed to upload image:', data.message)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async () => {
    try {
      const response = await fetch('/api/upload/profile-image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        setUser(prev => prev ? { ...prev, avatar: null } : null)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-secondary-50/20 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-secondary-50/20 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-secondary-50/20 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <div className="glass-effect rounded-3xl p-8 border mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white text-4xl font-bold relative group">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.displayName.charAt(0).toUpperCase()
                  )}
                  
                  {/* Image upload overlay for own profile */}
                  {isOwnProfile && (
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isUploadingImage}
                          />
                          <Camera className="w-6 h-6 text-white hover:text-primary-300 transition-colors" />
                        </label>
                        {user.avatar && (
                          <button
                            onClick={handleDeleteImage}
                            className="text-white hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                {user.skillLevel && (
                  <div className="absolute -bottom-2 -right-2 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {user.skillLevel}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.displayName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="bg-background border border-input rounded-lg px-3 py-2 text-3xl font-bold"
                        />
                      ) : (
                        user.displayName
                      )}
                    </h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>

                  <div className="flex gap-3">
                    {isOwnProfile ? (
                      <>
                        {isEditing ? (
                          <>
                            <Button onClick={handleSaveProfile} size="sm">
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button onClick={() => setIsEditing(true)} size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"} size="sm">
                          {isFollowing ? (
                            <>
                              <Minus className="w-4 h-4 mr-2" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground mb-4">
                    {user.bio || "No bio yet."}
                  </p>
                )}

                {/* Social Links */}
                <div className="flex gap-4 mb-4">
                  {isEditing ? (
                    <>
                      <input
                        type="url"
                        placeholder="GitHub URL"
                        value={editForm.githubUrl}
                        onChange={(e) => setEditForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                        className="flex-1 bg-background border border-input rounded-lg px-3 py-2"
                      />
                      <input
                        type="url"
                        placeholder="LinkedIn URL"
                        value={editForm.linkedinUrl}
                        onChange={(e) => setEditForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        className="flex-1 bg-background border border-input rounded-lg px-3 py-2"
                      />
                      <input
                        type="url"
                        placeholder="Website URL"
                        value={editForm.websiteUrl}
                        onChange={(e) => setEditForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                        className="flex-1 bg-background border border-input rounded-lg px-3 py-2"
                      />
                    </>
                  ) : (
                    <>
                      {user.githubUrl && (
                        <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {user.linkedinUrl && (
                        <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {user.websiteUrl && (
                        <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{user.rating}</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-600">{user.problemsSolved}</div>
                    <div className="text-sm text-muted-foreground">Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-600">{user.totalSessions}</div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{user.streak}</div>
                    <div className="text-sm text-muted-foreground">Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="glass-effect rounded-2xl p-6 border mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2" />
              Programming Languages
            </h2>
            {isEditing ? (
              <div className="space-y-3">
                {editForm.languages.map((lang, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={lang}
                      onChange={(e) => updateLanguage(index, e.target.value)}
                      placeholder="Language name"
                      className="flex-1 bg-background border border-input rounded-lg px-3 py-2"
                    />
                    <Button onClick={() => removeLanguage(index)} variant="outline" size="sm">
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={addLanguage} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Language
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.languages.map((lang, index) => (
                  <span key={index} className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="glass-effect rounded-2xl p-6 border mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Recent Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-background rounded-lg p-4 border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          {recentSessions.length > 0 && (
            <div className="glass-effect rounded-2xl p-6 border">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Recent Sessions
              </h2>
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="bg-background rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{session.session.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.session.type} • {session.session.language} • {session.session.difficulty}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.session.createdAt).toLocaleDateString()}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          session.session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          session.session.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {session.session.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 