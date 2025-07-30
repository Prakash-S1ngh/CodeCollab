export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  languages: string[];
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  rating: number;
  totalSessions: number;
  problemsSolved: number;
  streak: number;
  achievements: Achievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt: Date;
}

export interface CodingSession {
  id: string;
  title: string;
  type: 'MOCK_INTERVIEW' | 'PRACTICE' | 'COMPETITION' | 'FRIENDLY';
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  maxParticipants: number;
  currentParticipants: number;
  language: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number;
  currentCode: string;
  activeUserId?: string;
  hostId: string;
  challengeId?: string;
  participants: SessionParticipant[];
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  lastActivity: Date;
}

export interface SessionParticipant {
  id: string;
  userId: string;
  user: User;
  sessionId: string;
  joinedAt: Date;
  leftAt?: Date;
  score?: number;
  timeToSolve?: number;
  isReady: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string[];
  tags: string[];
  examples: TestCase[];
  constraints: string[];
  hints: string[];
  solution?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  popularity: number;
  successRate: number;
  totalAttempts: number;
  totalSolved: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
  isHidden: boolean;
}

export interface CodeExecution {
  id: string;
  sessionId: string;
  userId: string;
  challengeId?: string;
  code: string;
  language: string;
  input?: string;
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsage?: number;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  createdAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  userId: string;
  user: User;
  content: string;
  type: 'TEXT' | 'CODE' | 'SYSTEM';
  timestamp: Date;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'WEEKLY' | 'MONTHLY' | 'SPECIAL' | 'TOURNAMENT';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  currentParticipants: number;
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  prizes: Prize[];
  rules: string[];
  createdAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  user: User;
  competitionId?: string;
  rank: number;
  score: number;
  timeSpent: number;
  problemsSolved: number;
  lastSubmission: Date;
}

export interface Prize {
  id: string;
  competitionId: string;
  rank: number;
  title: string;
  description: string;
  value?: number;
  type: 'BADGE' | 'COINS' | 'SUBSCRIPTION' | 'MERCHANDISE';
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface CodeChangeEvent {
  sessionId: string;
  code: string;
  language: string;
  userId: string;
  timestamp: Date;
}

export interface CursorChangeEvent {
  sessionId: string;
  userId: string;
  position: {
    line: number;
    column: number;
  };
  timestamp: Date;
}

export interface ChatMessageEvent {
  sessionId: string;
  userId: string;
  message: string;
  timestamp: Date;
}

export interface VideoCallEvent {
  sessionId: string;
  from: string;
  to: string;
  type: 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE' | 'HANG_UP';
  data: any;
  timestamp: Date;
}