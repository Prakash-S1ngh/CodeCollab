'use client'

import { useState, useEffect, useRef } from 'react'
import { useCamera } from '../../components/CameraProvider'
import { useAuth } from '../../lib/auth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import CodeIDE from '../../components/CodeIDE'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  Users,
  Code,
  Play,
  Square,
  Settings,
  MessageSquare,
  Send
} from 'lucide-react'

interface Participant {
  id: string
  name: string
  avatar?: string
  isHost: boolean
  isInterviewer: boolean
  isConnected: boolean
}

interface Message {
  id: string
  sender: string
  message: string
  timestamp: Date
}

export default function MockInterviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Interviewer',
      isHost: false,
      isInterviewer: true,
      isConnected: true
    },
    {
      id: '2',
      name: user?.name || 'You',
      isHost: true,
      isInterviewer: false,
      isConnected: true
    },
    {
      id: '3',
      name: 'Observer 1',
      isHost: false,
      isInterviewer: false,
      isConnected: false
    },
    {
      id: '4',
      name: 'Observer 2',
      isHost: false,
      isInterviewer: false,
      isConnected: false
    }
  ])
  
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [currentProblem, setCurrentProblem] = useState({
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ]
  })
  const [code, setCode] = useState(`def twoSum(nums, target):
    # Your solution here
    pass

# Test cases
print(twoSum([2,7,11,15], 9))  # Should print [0,1]
print(twoSum([3,2,4], 6))      # Should print [1,2]`)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Interviewer',
      message: 'Welcome to the mock interview! Let\'s start with a classic problem.',
      timestamp: new Date()
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'code' | 'chat' | 'problem'>('code')
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const { stream, startCamera, showVideo, setShowVideo } = useCamera()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

  // Start camera globally
  startCamera()
  }, [user, router])

  useEffect(() => {
    // Attach global stream to your video element
    if (stream && videoRefs.current[1]) {
      videoRefs.current[1].srcObject = stream
    }
  }, [stream])

  const toggleVideo = () => {
    setShowVideo(!showVideo)
    setIsVideoOn(!isVideoOn)
  }

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn)
    // TODO: Implement actual audio toggle
  }

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
    // TODO: Implement screen sharing
  }

  const startInterview = () => {
    setIsInterviewActive(true)
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'Interviewer',
      message: 'Great! Let\'s begin. I\'ll give you 30 minutes to solve this problem.',
      timestamp: new Date()
    }])
  }

  const endInterview = () => {
    setIsInterviewActive(false)
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'Interviewer',
      message: 'Interview completed. Thank you for your time!',
      timestamp: new Date()
    }])
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: Message = {
      id: Date.now().toString(),
      sender: user?.name || 'You',
      message: newMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const runCode = async () => {
    try {
      const response = await axios.post('/api/code/execute', {
        code,
        language: 'python'
      })
      
      if (response.data.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'System',
          message: `Code executed successfully!\nOutput: ${response.data.data.output}`,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'System',
        message: 'Error executing code. Please check your syntax.',
        timestamp: new Date()
      }])
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Mock Interview</h1>
          <p className="text-gray-400">Please sign in to access the mock interview.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Mock Interview</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isInterviewActive ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-400">
                {isInterviewActive ? 'Active' : 'Ready'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-lg ${isVideoOn ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-lg ${isAudioOn ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`p-2 rounded-lg ${isScreenSharing ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              <Monitor className="w-5 h-5" />
            </button>
            
            {!isInterviewActive ? (
              <button
                onClick={startInterview}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium"
              >
                Start Interview
              </button>
            ) : (
              <button
                onClick={endInterview}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium"
              >
                End Interview
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Panel - Video Grid */}
        <div className="w-1/2 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {participants.map((participant, index) => (
              <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                {index === 1 ? (
                  showVideo ? (
                    <video
                      ref={el => { videoRefs.current[index] = el; }}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <VideoOff className="w-12 h-12 text-gray-500" />
                      <span className="ml-2 text-gray-400">Video Off</span>
                    </div>
                  )
                ) : (
                  <video
                    ref={el => { videoRefs.current[index] = el; }}
                    autoPlay
                    muted={index === 1}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  {participant.name}
                  {participant.isInterviewer && <span className="ml-1 text-blue-400">(Interviewer)</span>}
                </div>
                {!participant.isConnected && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-400">Not Connected</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'code' 
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              Code Editor
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'chat' 
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('problem')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'problem' 
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Problem
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'code' && (
              <div className="h-full flex flex-col">
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                  <h3 className="font-semibold">Code Editor</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={runCode}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium"
                    >
                      <Play className="w-4 h-4 inline mr-1" />
                      Run Code
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <CodeIDE
                    value={code}
                    onChange={setCode}
                    language="python"
                    theme="vs-dark"
                  />
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="bg-gray-800 px-4 py-2">
                  <h3 className="font-semibold">Chat</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {message.sender.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{message.sender}</span>
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm bg-gray-800 rounded-lg p-3">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'problem' && (
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{currentProblem.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      currentProblem.difficulty === 'Easy' ? 'bg-green-900 text-green-200' :
                      currentProblem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-red-900 text-red-200'
                    }`}>
                      {currentProblem.difficulty}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Problem Description</h4>
                    <p className="text-gray-300 leading-relaxed">
                      {currentProblem.description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Examples</h4>
                    <div className="space-y-3">
                      {currentProblem.examples.map((example, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-3">
                          <div className="mb-2">
                            <span className="font-medium text-sm">Input:</span>
                            <code className="ml-2 text-blue-400">{example.input}</code>
                          </div>
                          <div>
                            <span className="font-medium text-sm">Output:</span>
                            <code className="ml-2 text-green-400">{example.output}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Constraints</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>2 ≤ nums.length ≤ 10⁴</li>
                      <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                      <li>-10⁹ ≤ target ≤ 10⁹</li>
                      <li>Only one valid answer exists</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 