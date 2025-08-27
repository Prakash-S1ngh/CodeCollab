import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface Participant {
  userId: string;
  username: string;
  socketId: string;
  isHost: boolean;
}

interface SessionState {
  sessionId: string;
  hostId: string;
  participants: Participant[];
  code: string;
  testCases: Array<{ input: string; expected: string }>;
  writerId: string; // userId of current writer
  writeRequest?: {
    requesterId: string;
    votes: Record<string, boolean>; // userId -> true/false
    totalNeeded: number;
  };
}

const sessions = new Map<string, SessionState>();

export const setupCollabSessionHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    // Host a session
    socket.on('host-session', ({ username, userId }, cb) => {
      const sessionId = uuidv4();
      const state: SessionState = {
        sessionId,
        hostId: userId,
        participants: [
          { userId, username, socketId: socket.id, isHost: true }
        ],
        code: '',
        testCases: [],
        writerId: userId,
      };
      sessions.set(sessionId, state);
      socket.join(sessionId);
      cb({ sessionId });
      io.to(sessionId).emit('session-update', state);
    });

    // Join a session
    socket.on('join-session', ({ sessionId, username, userId }, cb) => {
      const state = sessions.get(sessionId);
      if (!state) return cb({ error: 'Session not found' });
      if (state.participants.find(p => p.userId === userId)) return cb({ error: 'Already joined' });
      state.participants.push({ userId, username, socketId: socket.id, isHost: false });
      socket.join(sessionId);
      cb({ sessionId });
      io.to(sessionId).emit('session-update', state);
    });

    // Code change (only by writer)
    socket.on('code-change', ({ sessionId, userId, code }) => {
      const state = sessions.get(sessionId);
      if (!state || state.writerId !== userId) return;
      state.code = code;
      io.to(sessionId).emit('code-update', { code });
    });

    // Test case change (only by writer)
    socket.on('testcase-change', ({ sessionId, userId, testCases }) => {
      const state = sessions.get(sessionId);
      if (!state || state.writerId !== userId) return;
      state.testCases = testCases;
      io.to(sessionId).emit('testcase-update', { testCases });
    });

    // Request write access
    socket.on('request-write-access', ({ sessionId, userId }) => {
      const state = sessions.get(sessionId);
      if (!state || state.writerId === userId || state.writeRequest) return;
      // Only one request at a time
      state.writeRequest = {
        requesterId: userId,
        votes: {},
        totalNeeded: state.participants.length - 1,
      };
      io.to(sessionId).emit('write-access-requested', {
        requesterId: userId,
        username: state.participants.find(p => p.userId === userId)?.username,
      });
    });

    // Vote for write access
    socket.on('vote-write-access', ({ sessionId, userId, vote }) => {
      const state = sessions.get(sessionId);
      if (!state || !state.writeRequest) return;
      const { requesterId, votes, totalNeeded } = state.writeRequest;
      if (userId === requesterId) return; // requester can't vote
      votes[userId] = vote;
      // If any vote is false, deny
      if (Object.values(votes).includes(false)) {
        io.to(sessionId).emit('write-access-denied', { requesterId });
        state.writeRequest = undefined;
        return;
      }
      // If all votes are in and all are true, grant
      if (Object.keys(votes).length === totalNeeded && Object.values(votes).every(v => v)) {
        state.writerId = requesterId;
        io.to(sessionId).emit('write-access-granted', { writerId: requesterId });
        state.writeRequest = undefined;
        io.to(sessionId).emit('session-update', state);
      }
    });

    // Host can take back write access
    socket.on('host-take-write', ({ sessionId, userId }) => {
      const state = sessions.get(sessionId);
      if (!state || state.hostId !== userId) return;
      state.writerId = userId;
      state.writeRequest = undefined;
      io.to(sessionId).emit('write-access-granted', { writerId: userId });
      io.to(sessionId).emit('session-update', state);
    });

    // Host can kick participant
    socket.on('kick-participant', ({ sessionId, hostId, targetUserId }) => {
      const state = sessions.get(sessionId);
      if (!state || state.hostId !== hostId) return;
      state.participants = state.participants.filter(p => p.userId !== targetUserId);
      if (state.writerId === targetUserId) state.writerId = hostId;
      io.to(sessionId).emit('session-update', state);
      // Remove from room
      const target = io.sockets.sockets.get(state.participants.find(p => p.userId === targetUserId)?.socketId || '');
      if (target) target.leave(sessionId);
    });

    // Run code (anyone can trigger)
    socket.on('run-code', async ({ sessionId, code, language, testCases }, cb) => {
      // Call your existing code execution logic here (e.g., Judge0)
      // For now, mock output:
      const output = `Output for code: ${code.slice(0, 20)}...`;
      io.to(sessionId).emit('code-output', { output });
      cb && cb({ output });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Remove from all sessions
      sessions.forEach((state, sessionId) => {
        const idx = state.participants.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) {
          const wasWriter = state.writerId === state.participants[idx].userId;
          state.participants.splice(idx, 1);
          // If writer left, give write access to host
          if (wasWriter) state.writerId = state.hostId;
          io.to(sessionId).emit('session-update', state);
        }
      });
    });
  });
};