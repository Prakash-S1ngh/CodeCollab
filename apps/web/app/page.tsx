'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Code, Users, Trophy, Zap, Star, Play, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@codearena/ui';
import { ThemeToggle } from '@/components/theme-toggle'

const features = [
  {
    icon: Users,
    title: 'Multiplayer Sessions',
    description: 'Code with up to 4 players in real-time collaborative sessions',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: Code,
    title: 'AI-Powered Interviews',
    description: 'Practice with GPT-powered mock interviewers and coding partners',
    color: 'from-secondary-500 to-secondary-600'
  },
  {
    icon: Trophy,
    title: 'DSA Challenges',
    description: 'Solve real problems from arrays, trees, DP, graphs and more',
    color: 'from-accent-500 to-accent-600'
  },
  {
    icon: Zap,
    title: 'Live IDE',
    description: 'Built-in compiler with syntax highlighting for multiple languages',
    color: 'from-green-500 to-green-600'
  }
]

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '500+', label: 'DSA Problems' },
  { value: '50K+', label: 'Sessions Completed' },
  { value: '99.9%', label: 'Uptime' }
]

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-secondary-50/20 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20">
      {/* Navigation */}
      <nav className="relative z-50 px-4 py-6">
        <div className="container mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              CodeArena
            </span>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="neon-glow">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                Code Together
              </span>
              <br />
              <span className="text-foreground">Win Together</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Join the ultimate multiplayer coding platform. Practice DSA challenges, 
              participate in mock interviews, and compete with friends in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-4 neon-glow group">
                  Start Coding Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="glass-effect rounded-2xl p-8 border">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFeature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      {(() => {
                        const FeatureIcon = features[currentFeature].icon
                        return (
                          <>
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[currentFeature].color} flex items-center justify-center mb-4`}>
                              <FeatureIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-foreground">
                              {features[currentFeature].title}
                            </h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                              {features[currentFeature].description}
                            </p>
                          </>
                        )
                      })()}
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex space-x-2">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeature(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentFeature 
                            ? 'bg-primary-500 w-8' 
                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-br from-muted/50 to-muted/80 rounded-xl p-6 code-editor">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">main.py</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="text-blue-600 dark:text-blue-400">def</div>
                      <div className="text-purple-600 dark:text-purple-400 ml-4">two_sum(nums, target):</div>
                      <div className="text-gray-600 dark:text-gray-400 ml-8"># Your solution here</div>
                      <div className="text-green-600 dark:text-green-400 ml-8">return result</div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Excel</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From beginner-friendly challenges to advanced algorithmic problems, 
              CodeArena provides all the tools you need to level up your coding skills.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="glass-effect rounded-2xl p-6 border group hover:border-primary-500/50 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <FeatureIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center glass-effect rounded-3xl p-12 border"
          >
            <Star className="w-16 h-16 text-primary-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Level Up?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already improving their skills 
              and landing their dream jobs with CodeArena.
            </p>
            <Link href="/auth">
              <Button size="lg" className="text-lg px-12 py-4 neon-glow">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              CodeArena
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 CodeArena. Built with passion for the developer community.
          </p>
        </div>
      </footer>
    </div>
  )
}