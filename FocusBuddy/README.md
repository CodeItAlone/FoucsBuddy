# FocusBuddy

Full-stack productivity app with focus sessions, task management, streak tracking, and distraction logging. Built with robustness, security, and scalability in mind.

## Tech Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| **Backend**   | Java 23, Spring Boot 3.2, JPA, Hibernate |
| **Database**  | PostgreSQL (Prod), H2 (Dev), Flyway Migrations |
| **Frontend**  | React Native (Expo), Axios                |
| **Auth**      | JWT (HS256), Refresh Tokens, Role-Based Access |
| **Tools**     | Maven, npm, Git                           |

## Features

- ⏱️ **Focus Sessions**: Track work duration with Pause/Resume capabilities.
- 📊 **Productivity Stats**: Daily/Weekly/Monthly analytics and timelines.
- 🔥 **Streaks**: Maintain daily consistency.
- 🔒 **Secure Auth**: JWT access tokens (short-lived) + Refresh tokens (rotating, secure).
- 📝 **Task Management**: Prioritize tasks (High/Medium/Low).
- 📉 **Distraction Logging**: Track interruptions during sessions.

## Run Locally

### Prerequisites
- Java 23+
- Node.js 18+

### 1. Backend (Spring Boot)

The backend uses **Spring Profiles** to switch between H2 (dev) and PostgreSQL (prod).

**Development Mode (H2 Database):**
Runs with an embedded file-based H2 database by default.
```bash
cd server
# Windows
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-23'
.\mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```
*API runs at `http://localhost:8080`*

**Production Mode (PostgreSQL):**
Requires environment variables.
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/focusbuddy
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=secret
export JWT_SECRET=your_secure_256bit_secret_key
export SPRING_PROFILES_ACTIVE=prod

.\mvnw.cmd spring-boot:run
```

### 2. Frontend (React Native)

```bash
cd client
npm install
npm start
```
Press `w` for web, `a` for Android, `i` for iOS.

## API Endpoints (v1)

All endpoints are prefixed with `/api/v1`.

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login (Returns Access + Refresh Token) |
| POST | `/auth/refresh` | Get new Access Token using Refresh Token |
| POST | `/auth/logout` | Logout (Revokes Refresh Token) |

### ⏱️ Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sessions` | Start a new session |
| POST | `/sessions/{id}/pause` | Pause active session |
| POST | `/sessions/{id}/resume` | Resume paused session |
| POST | `/sessions/{id}/end` | End session (with reflection) |
| POST | `/sessions/{id}/distractions` | Log a distraction |

### 📊 Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats?range=DAILY` | Get productivity stats (DAILY/WEEKLY/MONTHLY) |
| GET | `/stats/timeline` | Get paginated session history |

### ✅ Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks` | Create task |
| GET | `/tasks` | List tasks |
| GET | `/tasks/count` | Get task counts |

### 🔥 Streaks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/streaks/me` | Get current user streak |

## Project Structure

```
FocusBuddy/
├── client/          # React Native app
└── server/          # Spring Boot API
    ├── src/main/resources/
    │   ├── db/migration/  # Flyway SQL migrations
    │   ├── application-dev.properties
    │   └── application-prod.properties
    └── src/main/java/com/focusbuddy/
        ├── config/      # Security & App Config
        ├── controller/  # API V1 Controllers
        ├── model/       # JPA Entities
        ├── repository/  # Data Access
        ├── service/     # Business Logic
        └── security/    # JWT & Auth Filters
```

## License
MIT
