# CodeArena - Full Stack Setup Guide

## 🚀 Overview

This is a comprehensive multiplayer coding platform with:
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js with TypeScript, Socket.IO for video calls
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket video calls and chat

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd apps/web
npm install

# Install backend dependencies
cd ../api
npm install

# Install database package dependencies
cd ../../packages/database
npm install
```

### 2. Install Additional Dependencies

```bash
# Backend dependencies
cd apps/api
npm install @monaco-editor/react cloudinary multer express-validator

# Frontend dependencies  
cd ../web
npm install @monaco-editor/react
```

### 3. Database Setup

1. Create a PostgreSQL database
2. Copy the environment variables:

```bash
# Backend environment
cd apps/api
cp .env.example .env
```

3. Update the `.env` file with your database credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/codearena"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3001"

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Generate Prisma client and run migrations:

```bash
cd packages/database
npx prisma generate
npx prisma db push
```

### 4. Frontend Environment

```bash
cd apps/web
cp .env.example .env
```

Update with:
```env
API_URL="http://localhost:3000"
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend** (Terminal 1):
```bash
cd apps/api
npm run dev
```

2. **Start the Frontend** (Terminal 2):
```bash
cd apps/web
npm run dev
```

3. **Access the Application**:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

### Production Build

```bash
# Build all packages
npm run build

# Start production servers
cd apps/api && npm start
cd apps/web && npm start
```

## 📁 Project Structure

```
CodeCollab/
├── apps/
│   ├── web/                 # Next.js Frontend
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and hooks
│   │   └── package.json
│   └── api/                # Express Backend
│       ├── src/
│       │   ├── routes/     # API routes
│       │   ├── middleware/ # Express middleware
│       │   ├── socket/     # Socket.IO handlers
│       │   └── index.ts    # Main server file
│       └── package.json
├── packages/
│   ├── database/           # Prisma schema and client
│   │   ├── prisma/
│   │   └── package.json
│   ├── ui/                # Shared UI components
│   │   ├── src/
│   │   └── package.json
│   └── types/             # Shared TypeScript types
└── package.json
```

## 🔐 Authentication Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** with bcrypt
- **Protected Routes** with middleware
- **Token Refresh** mechanism
- **Google OAuth** integration
- **Profile Image Upload** with Cloudinary

## 💻 Code IDE Features

- **Monaco Editor** with syntax highlighting
- **Multi-language Support** (JavaScript, Python, Java, C++)
- **Real-time Code Execution** with test cases
- **Code Testing** against problem examples
- **File Upload/Download** functionality
- **Execution History** tracking

## 🎥 Video Call Features

- **WebRTC** peer-to-peer video calls
- **Socket.IO** for signaling
- **Screen Sharing** support
- **Audio/Video Controls**
- **Room Management**

## 👤 User Profile System

- **Public Profiles** viewable by anyone
- **Editable Profiles** for owners only
- **Follow/Unfollow** functionality
- **Achievement System**
- **Progress Tracking**
- **Social Links** (GitHub, LinkedIn, Website)

## 🛡️ Security Features

- **Rate Limiting** on API endpoints
- **CORS** configuration
- **Helmet** security headers
- **Input Validation** with express-validator
- **SQL Injection** protection with Prisma
- **XSS Protection**

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Code Execution
- `POST /api/code/execute` - Execute code and run tests
- `GET /api/code/executions` - Get user's code executions
- `GET /api/code/executions/:id` - Get specific execution

### File Upload
- `POST /api/upload/profile-image` - Upload profile image
- `DELETE /api/upload/profile-image` - Delete profile image
- `POST /api/upload/image` - Upload general image
- `DELETE /api/upload/image/:publicId` - Delete image
- `GET /api/upload/signature` - Get upload signature

### Users
- `GET /api/users/profile/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/follow/:userId` - Follow user
- `DELETE /api/users/follow/:userId` - Unfollow user
- `GET /api/users/followers/:userId` - Get followers
- `GET /api/users/following/:userId` - Get following
- `GET /api/users/search` - Search users

### Sessions
- `GET /api/sessions` - Get all sessions

### Challenges
- `GET /api/challenges` - Get all challenges

### Competitions
- `GET /api/competitions` - Get all competitions

## 🎨 UI Components

The application uses a custom UI library with:
- **Button** components with variants
- **Glass Morphism** effects
- **Dark/Light** theme support
- **Responsive** design
- **Smooth Animations** with Framer Motion

## 🧪 Testing

```bash
# Run frontend tests
cd apps/web
npm test

# Run backend tests
cd apps/api
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set up a PostgreSQL database
2. Configure environment variables
3. Build the application: `npm run build`
4. Start the server: `npm start`

### Frontend Deployment
1. Configure API URL in environment
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Happy Coding! 🚀** 