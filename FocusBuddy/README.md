# FocusBuddy

<div align="center">

![FocusBuddy](https://img.shields.io/badge/FocusBuddy-Social%20Accountability%20Engine-FF4500?style=for-the-badge)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-6DB33F?style=flat&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=json-web-tokens)](https://jwt.io/)

**A brutal, execution-focused productivity app using social pressure and strict rules to force consistency.**

[Features](#features) • [Architecture](#architecture) • [Getting Started](#getting-started) • [API Reference](#api-reference) • [Security](#security)

</div>

---

## 🎯 Overview

FocusBuddy is a social accountability engine designed to eliminate excuses and enforce productivity through:

- **No Pause Sessions** - Once started, you complete or fail
- **Streak Decay** - Miss a day? Lose 20% of your streak (after grace period)
- **Social Visibility** - Your group sees when you're working (coming soon)
- **Brutal Honesty** - No sugarcoating, only results

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| **User Authentication** | ✅ Complete | JWT-based secure authentication with BCrypt password hashing |
| **Focus Sessions** | ✅ Complete | Timed work sessions with task descriptions (25/45/60 min) |
| **Streak Tracking** | ✅ Complete | Daily streak with grace days and decay algorithm |
| **Session History** | ✅ Complete | Track completed and abandoned sessions |
| **Group System** | 🚧 Coming Soon | Accountability groups with member activity visibility |
| **Real-time Updates** | 🚧 Coming Soon | WebSocket-based live activity feed |
| **Notifications** | 📋 Planned | Push notifications for streak warnings |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│  React Native (Expo) + React Navigation                      │
│  ├── Screens: Login, Signup, Home, Session                   │
│  ├── Services: API (Axios), AuthContext, WebSocket           │
│  └── Theme: Dark mode with alert orange accent               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS + JWT
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVER                                │
│  Spring Boot 3.2.0 + Spring Security                         │
│  ├── Security: JWT Auth Filter, BCrypt Password Encoder      │
│  ├── Controllers: AuthController, SessionController          │
│  ├── Services: AuthService, SessionService, StreakService    │
│  ├── Repositories: JPA Repositories                          │
│  └── Exception Handling: Global @ControllerAdvice            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ JPA/Hibernate
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                                │
│  H2 (Development) / PostgreSQL (Production)                  │
│  ├── app_users: User accounts with hashed passwords          │
│  ├── sessions: Focus session records                         │
│  ├── streaks: User streak data with grace days               │
│  └── groups: Accountability groups (schema ready)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+** (JDK)
- **Node.js 18+** and npm
- **Expo CLI** (`npm install -g expo-cli`)
- **PostgreSQL** (optional, for production)

### Backend Setup

```bash
cd server

# Development (H2 file-based database)
./mvnw spring-boot:run

# Or on Windows
.\mvnw.cmd spring-boot:run
```

The server starts at `http://localhost:8080`

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start Expo development server
npm start

# Options:
# Press 'a' for Android Emulator
# Press 'w' for Web Browser
# Press 'i' for iOS Simulator (Mac only)
```

---

## 📡 API Reference

### Authentication

All endpoints except `/api/auth/**` require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

#### Register New User

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "handle": "username",
  "password": "securepassword123"
}
```

**Response:**
```json
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

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Sessions

#### Start Session

```http
POST /api/sessions/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "task": "Deep Work - Project X",
  "duration": 25
}
```

#### Complete Session

```http
POST /api/sessions/{id}/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "reflection": "Completed the feature implementation"
}
```

#### Abandon Session

```http
POST /api/sessions/{id}/abandon
Authorization: Bearer <token>
```

#### Get Active Session

```http
GET /api/sessions/active
Authorization: Bearer <token>
```

#### Get Session History

```http
GET /api/sessions/history
Authorization: Bearer <token>
```

---

## 🔐 Security

### Implemented Security Measures

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | BCrypt with strength 10 |
| **Authentication** | JWT tokens (HS512, 24h expiry) |
| **Authorization** | Per-request token validation |
| **Ownership Validation** | Users can only modify their own sessions |
| **Input Validation** | Bean Validation annotations |
| **Error Handling** | Centralized exception handling, no stack traces exposed |
| **CORS** | Configured for development (restrict in production) |

### Security Headers

- CSRF disabled (stateless JWT auth)
- Frame options disabled (for H2 console in dev)

### Production Recommendations

1. **Use environment variables** for JWT secret and database credentials
2. **Restrict CORS origins** to your frontend domain
3. **Enable HTTPS** with valid SSL certificates
4. **Implement rate limiting** on authentication endpoints
5. **Add refresh token** mechanism for long-lived sessions

---

## 📁 Project Structure

```
FocusBuddy/
├── client/                          # React Native Frontend
│   ├── src/
│   │   ├── screens/
│   │   │   ├── LoginScreen.js       # User login
│   │   │   ├── SignupScreen.js      # User registration
│   │   │   ├── HomeScreen.js        # Dashboard with streak
│   │   │   └── SessionScreen.js     # Focus timer
│   │   ├── services/
│   │   │   ├── api.js               # Axios client with JWT
│   │   │   ├── AuthContext.js       # Auth state management
│   │   │   └── socket.js            # WebSocket (stub)
│   │   └── theme/
│   │       └── index.js             # Dark theme config
│   ├── App.js                       # Navigation setup
│   └── package.json
│
├── server/                          # Spring Boot Backend
│   ├── src/main/java/com/focusbuddy/
│   │   ├── config/
│   │   │   ├── SecurityConfig.java  # JWT + BCrypt config
│   │   │   ├── WebConfig.java       # CORS settings
│   │   │   └── WebSocketConfig.java # STOMP configuration
│   │   ├── controller/
│   │   │   ├── AuthController.java  # Login/Signup endpoints
│   │   │   └── SessionController.java
│   │   ├── dto/
│   │   │   ├── AuthResponse.java    # JWT + user response
│   │   │   ├── UserResponse.java    # Safe user DTO
│   │   │   ├── LoginRequest.java
│   │   │   └── SignupRequest.java
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   └── UnauthorizedException.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── Session.java
│   │   │   ├── Streak.java
│   │   │   └── Group.java
│   │   ├── repository/
│   │   │   └── *Repository.java     # JPA repositories
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   └── CustomUserDetailsService.java
│   │   └── service/
│   │       ├── AuthService.java     # BCrypt + JWT logic
│   │       ├── SessionService.java
│   │       └── StreakService.java
│   ├── src/main/resources/
│   │   └── application.properties   # App configuration
│   └── pom.xml
│
└── README.md
```

---

## ⚙️ Configuration

### Backend Configuration

Edit `server/src/main/resources/application.properties`:

```properties
# Server
server.port=8080

# JWT Configuration
app.jwt.secret=<your-base64-encoded-secret>
app.jwt.expiration-ms=86400000

# Database (H2 for development)
spring.datasource.url=jdbc:h2:file:./data/focusbuddy
spring.h2.console.enabled=true

# Database (PostgreSQL for production)
# spring.datasource.url=jdbc:postgresql://localhost:5432/focusbuddy
# spring.datasource.username=${DB_USERNAME}
# spring.datasource.password=${DB_PASSWORD}
```

### Frontend Configuration

Edit `client/src/services/api.js` to change the API URL:

```javascript
const BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:8080/api'
    : 'http://10.0.2.2:8080/api';  // Android emulator
```

---

## 🧪 Testing

### Backend Tests

```bash
cd server
./mvnw test
```

### API Testing with cURL

```bash
# Signup
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","handle":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Start Session (with token)
curl -X POST http://localhost:8080/api/sessions/start \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"task":"Deep Work","duration":25}'
```

---

## 🔄 Recent Updates

### v1.1.0 - Security Hardening (January 2026)

**Breaking Changes:**
- API now requires JWT token for all protected endpoints
- Login/Signup return `AuthResponse` with token instead of raw User entity
- Session API no longer accepts `userId` in request body (extracted from JWT)

**Security Fixes:**
- ✅ Implemented BCrypt password hashing (was plaintext)
- ✅ Added JWT token-based authentication
- ✅ Added session ownership validation
- ✅ Added input validation with Bean Validation
- ✅ Added centralized exception handling
- ✅ Switched to file-based H2 for data persistence

**New Components:**
- `security/` package with JWT infrastructure
- `AuthService` with BCrypt password handling
- `AuthResponse` and `UserResponse` DTOs
- `GlobalExceptionHandler` for consistent error responses

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with Spring Boot and React Native
- Inspired by the need for brutal accountability in productivity
- Dark theme designed for late-night coding sessions

---

<div align="center">

**Built for those who execute, not those who excuse.**

</div>
