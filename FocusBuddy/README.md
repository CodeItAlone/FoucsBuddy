<div align="center">

# ⚡ FocusBuddy

### A Modern Productivity Dashboard for Deep Work

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

[Features](#-features) • [Quick Start](#-quick-start) • [Screenshots](#-screenshots) • [Architecture](#-architecture) • [API Docs](#-api-reference)

</div>

---

## 📖 About

FocusBuddy is a full-stack productivity application that combines **time tracking**, **streak management**, and **social accountability** to help you stay focused. Built with a modern tech stack featuring a Spring Boot backend and React Native frontend with Expo.

**Key Highlights:**
- 🎨 **Beautiful Dashboard** — Tempus-inspired UI with timeline visualization, progress charts, and analytics
- 🌓 **Dark/Light Theme** — One-click theme toggle with smooth transitions
- 📱 **Cross-Platform** — Runs on Web, iOS, and Android from a single codebase
- 🔐 **Secure by Design** — JWT authentication, BCrypt password hashing, and per-request authorization

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Productivity Dashboard** | Timeline visualization, projects breakdown, app usage tracking, and daily summary stats |
| **Focus Sessions** | Timed Pomodoro-style sessions (25/45/60 min) with task descriptions |
| **Live Squad Widget** | Real-time view of 5 friends with status (Active/Deep Work/Idle) and current projects |
| **Quick Action Header** | Sticky header with theme toggle and session timer |
| **Daily Summary** | Compact horizontal progress rings showing Focus, Meetings, Breaks, Other |
| **Milestone Toasts** | Social notifications when squad members complete sessions with "High Five" nudge |
| **Streak Tracking** | Daily streaks with grace days and 20% decay algorithm for missed days |
| **Theme Toggle** | Switch between light and dark modes instantly from header |
| **Responsive Design** | Adapts to desktop, tablet, and mobile screen sizes |
| **JWT Authentication** | Secure token-based auth with 24-hour expiry |

### Roadmap

- [x] Group Focus Module — Live squad status, milestone toasts
- [ ] Push Notifications — Streak warnings and session reminders
- [ ] Analytics Export — Download productivity reports
- [ ] Calendar Integration — Sync with Google Calendar

---

## 📸 Screenshots

<div align="center">

### Light Mode
<img src="docs/screenshots/dashboard-light.png" alt="Dashboard Light Mode" width="800"/>

### Dark Mode
<img src="docs/screenshots/dashboard-dark.png" alt="Dashboard Dark Mode" width="800"/>

</div>

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| Java | 17+ | ✅ |
| Node.js | 18+ | ✅ |
| npm | 9+ | ✅ |
| PostgreSQL | 14+ | Production only |

### 1. Clone the Repository

```bash
git clone https://github.com/CodeItAlone/FoucsBuddy.git
cd FoucsBuddy/FocusBuddy
```

### 2. Start the Backend

```bash
cd server

# Windows
.\mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

> The API server starts at `http://localhost:8080`

### 3. Start the Frontend

```bash
cd client
npm install
npm start
```

> Press `w` for Web, `a` for Android, or `i` for iOS

---

## 🏛️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  CLIENT — React Native + Expo                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Screens        │  Components       │  Services          │  │
│  │  ─────────      │  ──────────       │  ────────          │  │
│  │  Dashboard      │  Sidebar          │  AuthContext       │  │
│  │  Login/Signup   │  TimelineChart    │  ThemeContext      │  │
│  │  Session        │  ProgressBar      │  API (Axios)       │  │
│  │  Groups         │  LiveSquadWidget  │  WebSocket         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              │ HTTPS + JWT / WebSocket
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  SERVER — Spring Boot 3.2                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Security       │  Controllers      │  Services          │  │
│  │  ────────       │  ───────────      │  ────────          │  │
│  │  JwtAuthFilter  │  AuthController   │  AuthService       │  │
│  │  JwtProvider    │  SessionController│  SessionService    │  │
│  │  WebSocket      │  GroupController  │  GroupService      │  │
│  │  BCrypt         │  StreakController │  StreakService     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              │ JPA/Hibernate
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  DATABASE — H2 (Dev) / PostgreSQL (Prod)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  app_users  │  sessions  │  streaks  │  groups           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
FocusBuddy/
├── client/                              # React Native Frontend
│   ├── src/
│   │   ├── components/                  # Reusable UI components
│   │   │   ├── Sidebar.js               # Navigation sidebar
│   │   │   ├── TimelineChart.js         # Activity timeline
│   │   │   ├── ProgressBar.js           # Horizontal progress
│   │   │   ├── CircularProgress.js      # Donut charts
│   │   │   ├── DashboardCard.js         # Card container
│   │   │   ├── LiveSquadWidget.js       # Real-time squad status
│   │   │   └── CompactDailySummary.js   # Compact summary rings
│   │   ├── screens/
│   │   │   ├── DashboardScreen.js       # Main dashboard
│   │   │   ├── LoginScreen.js           # Authentication
│   │   │   ├── SignupScreen.js          # Registration
│   │   │   ├── SessionScreen.js         # Focus timer
│   │   │   ├── GroupsScreen.js          # Groups list
│   │   │   ├── GroupDetailScreen.js     # Group details
│   │   │   └── CreateGroupScreen.js     # Create new group
│   │   ├── services/
│   │   │   ├── api.js                   # Axios HTTP client
│   │   │   ├── AuthContext.js           # Auth state management
│   │   │   ├── ThemeContext.js          # Theme provider
│   │   │   └── websocket.js             # WebSocket client
│   │   └── theme/
│   │       └── index.js                 # Light/Dark palettes
│   ├── App.js                           # Root component
│   └── package.json
│
├── server/                              # Spring Boot Backend
│   ├── src/main/java/com/focusbuddy/
│   │   ├── config/                      # App configuration
│   │   ├── controller/                  # REST endpoints
│   │   ├── dto/                         # Data transfer objects
│   │   ├── exception/                   # Error handling
│   │   ├── model/                       # JPA entities
│   │   ├── repository/                  # Data access layer
│   │   ├── security/                    # JWT infrastructure
│   │   └── service/                     # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── README.md
```

---

## 📡 API Reference

### Authentication

#### POST `/api/auth/signup`

Create a new user account.

```json
// Request
{
  "email": "user@example.com",
  "handle": "username",
  "password": "securePassword123"
}

// Response 201
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "handle": "username",
    "currentStreak": 0,
    "graceDaysRemaining": 1
  }
}
```

#### POST `/api/auth/login`

Authenticate and receive a JWT token.

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "user": { ... }
}
```

### Sessions

> All session endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sessions/start` | Start a new focus session |
| `POST` | `/api/sessions/{id}/complete` | Mark session as completed |
| `POST` | `/api/sessions/{id}/abandon` | Abandon current session |
| `GET` | `/api/sessions/active` | Get current active session |
| `GET` | `/api/sessions/history` | Get session history |

---

## 🔐 Security

| Layer | Implementation |
|-------|---------------|
| **Password Storage** | BCrypt (strength 10) |
| **Authentication** | JWT tokens (HS512, 24h expiry) |
| **Authorization** | Per-request token validation |
| **Ownership** | Users can only access their own data |
| **Validation** | Bean Validation on all inputs |
| **Error Handling** | Centralized handler, no stack traces exposed |

### Production Checklist

- [ ] Use environment variables for secrets
- [ ] Configure HTTPS with valid SSL certificate
- [ ] Restrict CORS to production domains
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up database backups
- [ ] Configure logging and monitoring

---

## ⚙️ Configuration

### Backend (`server/src/main/resources/application.properties`)

```properties
# Server
server.port=8080

# JWT (use env vars in production)
app.jwt.secret=${JWT_SECRET:your-256-bit-secret}
app.jwt.expiration-ms=86400000

# Database - Development (H2)
spring.datasource.url=jdbc:h2:file:./data/focusbuddy
spring.h2.console.enabled=true

# Database - Production (PostgreSQL)
# spring.datasource.url=jdbc:postgresql://${DB_HOST}:5432/focusbuddy
# spring.datasource.username=${DB_USER}
# spring.datasource.password=${DB_PASS}
```

### Frontend (`client/src/services/api.js`)

```javascript
const BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:8080/api'
    : 'http://10.0.2.2:8080/api';  // Android emulator
```

---

## 🧪 Testing

```bash
# Backend unit tests
cd server && ./mvnw test

# API smoke test
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","handle":"tester","password":"pass123"}'
```

---

## 📝 Recent Changes

### v1.4.0 — Frontend Integration & WebSocket (January 2026)

- 🔌 **WebSocket Integration** — Real-time session status updates via STOMP/SockJS
- 🔗 **Full API Integration** — LiveSquadWidget now fetches real data from backend
- 📱 **Group Screens** — New GroupsScreen, GroupDetailScreen, CreateGroupScreen
- 🎮 **Group Controller** — Backend API for group CRUD operations
- 📊 **Streak Controller** — Dedicated endpoint for streak data
- 🔄 **Real-time Updates** — Live session status changes pushed to clients

### v1.3.0 — Group Focus Module (January 2026)

- 👥 **Live Squad Widget** — Real-time friend status with Active/Deep Work/Idle indicators
- 🎯 **Quick Action Header** — Sticky header with theme toggle and session timer
- 📊 **Compact Daily Summary** — Horizontal progress rings layout
- 🎉 **Milestone Toasts** — Social notifications with High Five button
- 🌙 **Header Theme Toggle** — One-click Dark/Light mode switch in header

### v1.2.0 — Dashboard UI (January 2026)

- ✨ **New Dashboard** — Tempus-inspired productivity interface
- 🌓 **Theme Toggle** — Light/dark mode with smooth transitions
- 📊 **New Components** — Timeline, progress bars, circular charts
- 📱 **Responsive Layout** — Desktop, tablet, and mobile support
- 🛠️ **ThemeContext** — Centralized theme state management

### v1.1.0 — Security Hardening (January 2026)

- 🔐 Implemented BCrypt password hashing
- 🎫 Added JWT token-based authentication
- ✅ Added session ownership validation
- 🛡️ Centralized exception handling

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/awesome-feature`
3. **Commit** your changes: `git commit -m 'Add awesome feature'`
4. **Push** to the branch: `git push origin feature/awesome-feature`
5. **Open** a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for focused developers**

[Report Bug](https://github.com/CodeItAlone/FoucsBuddy/issues) • [Request Feature](https://github.com/CodeItAlone/FoucsBuddy/issues)

</div>
