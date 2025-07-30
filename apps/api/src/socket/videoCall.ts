import { Server as SocketIOServer } from 'socket.io'
import { prisma } from '../index'

interface VideoCallUser {
  userId: string
  socketId: string
  username: string
  avatar?: string
}

interface VideoCallRoom {
  roomId: string
  sessionId: string
  hostId: string
  participants: VideoCallUser[]
  isActive: boolean
  createdAt: Date
}

const videoCallRooms = new Map<string, VideoCallRoom>()

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error'))
      }

      // Verify token and get user
      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, displayName: true, avatar: true }
      })

      if (!user) {
        return next(new Error('User not found'))
      }

      socket.data.user = user
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.username} (${socket.id})`)

    // Join video call room
    socket.on('join-video-call', async (data: { sessionId: string, roomId: string }) => {
      try {
        const { sessionId, roomId } = data
        const user = socket.data.user

        // Check if user is part of the session
        const participant = await prisma.sessionParticipant.findUnique({
          where: {
            userId_sessionId: {
              userId: user.id,
              sessionId: sessionId
            }
          }
        })

        if (!participant) {
          socket.emit('error', { message: 'You are not part of this session' })
          return
        }

        // Join socket room
        socket.join(roomId)

        // Get or create video call room
        let videoRoom = videoCallRooms.get(roomId)
        if (!videoRoom) {
          const session = await prisma.codingSession.findUnique({
            where: { id: sessionId }
          })
          
          videoRoom = {
            roomId,
            sessionId,
            hostId: session!.hostId,
            participants: [],
            isActive: true,
            createdAt: new Date()
          }
          videoCallRooms.set(roomId, videoRoom)
        }

        // Add user to room participants
        const videoUser: VideoCallUser = {
          userId: user.id,
          socketId: socket.id,
          username: user.displayName,
          avatar: user.avatar || undefined
        }

        const existingParticipantIndex = videoRoom.participants.findIndex(
          p => p.userId === user.id
        )

        if (existingParticipantIndex === -1) {
          videoRoom.participants.push(videoUser)
        } else {
          videoRoom.participants[existingParticipantIndex] = videoUser
        }

        // Notify others in the room
        socket.to(roomId).emit('user-joined-video', {
          user: videoUser,
          participants: videoRoom.participants
        })

        // Send current participants to the joining user
        socket.emit('video-call-joined', {
          participants: videoRoom.participants,
          isHost: videoRoom.hostId === user.id
        })

        console.log(`User ${user.username} joined video call room ${roomId}`)
      } catch (error) {
        console.error('Error joining video call:', error)
        socket.emit('error', { message: 'Failed to join video call' })
      }
    })

    // Handle WebRTC signaling
    socket.on('offer', (data: { to: string, offer: any }) => {
      socket.to(data.to).emit('offer', {
        from: socket.id,
        offer: data.offer
      })
    })

    socket.on('answer', (data: { to: string, answer: any }) => {
      socket.to(data.to).emit('answer', {
        from: socket.id,
        answer: data.answer
      })
    })

    socket.on('ice-candidate', (data: { to: string, candidate: any }) => {
      socket.to(data.to).emit('ice-candidate', {
        from: socket.id,
        candidate: data.candidate
      })
    })

    // Handle video call controls
    socket.on('toggle-video', (data: { roomId: string, enabled: boolean }) => {
      socket.to(data.roomId).emit('user-video-toggled', {
        userId: socket.data.user.id,
        enabled: data.enabled
      })
    })

    socket.on('toggle-audio', (data: { roomId: string, enabled: boolean }) => {
      socket.to(data.roomId).emit('user-audio-toggled', {
        userId: socket.data.user.id,
        enabled: data.enabled
      })
    })

    // Handle screen sharing
    socket.on('start-screen-share', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('user-started-screen-share', {
        userId: socket.data.user.id
      })
    })

    socket.on('stop-screen-share', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('user-stopped-screen-share', {
        userId: socket.data.user.id
      })
    })

    // Handle chat messages
    socket.on('send-message', async (data: { sessionId: string, content: string, type: string }) => {
      try {
        const { sessionId, content, type } = data
        const user = socket.data.user

        // Save message to database
        const message = await prisma.message.create({
          data: {
            sessionId,
            userId: user.id,
            content,
            type: type as any
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        })

        // Broadcast to all users in the session
        io.to(sessionId).emit('new-message', message)
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle typing indicators
    socket.on('typing-start', (data: { sessionId: string }) => {
      socket.to(data.sessionId).emit('user-typing', {
        userId: socket.data.user.id,
        username: socket.data.user.displayName
      })
    })

    socket.on('typing-stop', (data: { sessionId: string }) => {
      socket.to(data.sessionId).emit('user-stopped-typing', {
        userId: socket.data.user.id
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.username} (${socket.id})`)

      // Remove user from video call rooms
      videoCallRooms.forEach((room, roomId) => {
        const participantIndex = room.participants.findIndex(p => p.socketId === socket.id)
        if (participantIndex !== -1) {
          const removedUser = room.participants[participantIndex]
          room.participants.splice(participantIndex, 1)
          
          socket.to(roomId).emit('user-left-video', {
            userId: removedUser.userId,
            participants: room.participants
          })

          // Clean up empty rooms
          if (room.participants.length === 0) {
            videoCallRooms.delete(roomId)
          }
        }
      })
    })
  })

  // Clean up inactive rooms periodically
  setInterval(() => {
    const now = new Date()
    videoCallRooms.forEach((room, roomId) => {
      const timeSinceCreation = now.getTime() - room.createdAt.getTime()
      const oneHour = 60 * 60 * 1000
      
      if (timeSinceCreation > oneHour && room.participants.length === 0) {
        videoCallRooms.delete(roomId)
        console.log(`Cleaned up inactive video call room: ${roomId}`)
      }
    })
  }, 5 * 60 * 1000) // Check every 5 minutes
} 