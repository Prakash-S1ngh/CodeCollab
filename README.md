# CodeArena - Multiplayer DSA Challenge Platform

A real-time collaborative coding platform where users can participate in mock interviews, AI-guided practice, or competitive sessions with friends in a gamified environment.

## 🚀 Features

### 🧑‍💻 Multiplayer Coding Sessions
- **Real-time collaboration** with up to 4 participants
- **Live collaborative editor** with syntax highlighting and AI hints
- **Session chat** and **timer** functionality
- Support for **solo or group sessions** with bots or friends

### 🤖 AI-Powered Features
- **GPT-powered mock interviewer** and coding partner
- **Scenario-based prompts** with adaptive difficulty
- **Smart code suggestions** and explanations

### 🏁 DSA Challenges
- **Real problems** from arrays, trees, DP, graphs, and more
- **Points system** based on correctness, speed, and explanation quality
- **Progressive difficulty** with personalized recommendations

### 👤 User Profiles
- **Comprehensive tracking**:
  - Languages known and skill levels
  - Session statistics and performance metrics
  - Past attempts and improvement analytics
  - Achievements, badges, and rankings
- **Social features**: Follow other users and join teams

### 🏆 Competitive Gaming
- **Weekly challenges** and timed sprints
- **Private lobbies** for friend groups
- **Gamified rewards**: badges, streaks, and coins
- **Real-time leaderboards** and tournaments

### 🖥️ Built-in IDE
- **Multi-language support**: Python, Java, C++, JavaScript, and more
- **Secure code compilation** and execution
- **Code history** and explanation-saving features
- **Real-time collaboration** with live cursors

### 🎥 Communication Features
- **Integrated video calls** for pair programming
- **Real-time chat** during coding sessions
- **Screen sharing** capabilities
- **Voice channels** for team coordination

### 🎨 Modern UI/UX
- **Light and dark mode** theming
- **Responsive design** for all devices
- **Smooth animations** and micro-interactions
- **Professional gaming-inspired** interface

## 🏗️ Architecture

This project uses a **TurboRepo monorepo** structure with the following packages:

```
codearena/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Express.js backend API
├── packages/
│   ├── ui/           # Shared React components
│   ├── types/        # TypeScript type definitions
│   ├── database/     # Prisma schema and client
│   └── config/       # Shared configuration files
└── docs/             # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Monaco Editor** - VS Code editor for the web
- **Socket.io Client** - Real-time communication

### Backend
- **Express.js** - Node.js web framework
- **Socket.io** - WebSocket communication
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Infrastructure
- **TurboRepo** - Monorepo build system
- **Docker** - Containerization
- **Vercel** - Frontend deployment
- **Railway** - Backend deployment
- **Supabase** - Database hosting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/codearena.git
   cd codearena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other configurations
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket Server**: ws://localhost:3001

## 📝 Development

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all applications
- `npm run lint` - Run ESLint on all packages
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean all build artifacts
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

### Database Management

```bash
# Push schema changes to database
npm run db:push

# Generate Prisma client after schema changes
npm run db:generate

# Open Prisma Studio for database management
npm run db:studio

# Seed the database with initial data
npm run db:seed
```

## 🌟 Key Features in Detail

### Real-time Collaboration
- **Live code synchronization** across all participants
- **Cursor tracking** and selection highlighting
- **Turn-based coding** with active user management
- **Real-time chat** with typing indicators

### AI Integration
- **Mock interview scenarios** with realistic questions
- **Code review** and optimization suggestions
- **Adaptive difficulty** based on user performance
- **Explanation generation** for solutions

### Gaming Elements
- **XP and leveling system**
- **Achievement badges** for milestones
- **Daily challenges** and streak tracking
- **Competitive tournaments** with prizes

### Code Execution
- **Secure sandboxed environment**
- **Multiple language support**
- **Custom test cases** and validation
- **Performance metrics** (time/memory)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** - For the amazing code editor
- **Socket.io** - For real-time communication
- **Prisma** - For the excellent database toolkit
- **TurboRepo** - For the monorepo management
- **Vercel** - For the deployment platform

## 📞 Support

- 📧 Email: support@codearena.dev
- 💬 Discord: [Join our community](https://discord.gg/codearena)
- 📚 Documentation: [docs.codearena.dev](https://docs.codearena.dev)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/codearena/issues)

---

**Built with ❤️ by the CodeArena Team**