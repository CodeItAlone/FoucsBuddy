# FocusBuddy

Full-stack productivity app with focus sessions, task management, streak tracking, and distraction logging. Spring Boot backend + React Native (Expo) frontend.

## Tech Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Backend   | Java 17, Spring Boot 3.2, JPA, H2/PostgreSQL |
| Frontend  | React Native 0.81, Expo 54, Axios         |
| Auth      | JWT (HS512), BCrypt                       |

## Run Locally

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 15+ (optional, for production)

### Backend

```bash
cd server

# Windows
.\mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

API runs at `http://localhost:8080`

> **Note**: By default, the app uses H2 file-based database (`./data/focusbuddy`). Data persists across restarts.

#### PostgreSQL Setup (Production)

1. Create database:
   ```sql
   CREATE DATABASE focusbuddy;
   ```

2. Update `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/focusbuddy
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
   ```

3. For production, set a secure JWT secret:
   ```bash
   # Generate secret
   openssl rand -base64 64
   
   # Set in application.properties or environment variable
   app.jwt.secret=<your-generated-secret>
   ```

### Frontend

```bash
cd client
npm install
npm start
```

Press `w` for web, `a` for Android, `i` for iOS.

## Screenshots

| Light Mode | Dark Mode |
|------------|-----------|
| ![Light](screenshots/dashboard_light.png) | ![Dark](screenshots/dashboard_dark.png) |

## Project Structure

```
FocusBuddy/
├── client/          # React Native app
│   └── src/
│       ├── api/
│       ├── components/
│       ├── screens/
│       └── services/
└── server/          # Spring Boot API
    ├── docs/        # API & Schema documentation
    └── src/main/java/com/focusbuddy/
        ├── controller/
        ├── service/
        ├── model/
        ├── repository/
        ├── dto/
        ├── security/
        └── exception/
```

## API Endpoints

### Authentication
| Method | Endpoint                      | Description           |
|--------|-------------------------------|-----------------------|
| POST   | `/api/auth/signup`            | Register user         |
| POST   | `/api/auth/login`             | Get JWT token         |

### Tasks
| Method | Endpoint                      | Description           |
|--------|-------------------------------|-----------------------|
| POST   | `/api/tasks`                  | Create task           |
| GET    | `/api/tasks`                  | List tasks (filterable) |
| GET    | `/api/tasks/{id}`             | Get single task       |
| PUT    | `/api/tasks/{id}`             | Update task           |
| DELETE | `/api/tasks/{id}`             | Delete task           |
| GET    | `/api/tasks/count`            | Pending task count    |

### Sessions
| Method | Endpoint                      | Description           |
|--------|-------------------------------|-----------------------|
| POST   | `/api/sessions`               | Create focus session  |
| GET    | `/api/sessions`               | Get session history   |
| GET    | `/api/sessions/current`       | Get active session    |
| PATCH  | `/api/sessions/{id}`          | Update session status |
| POST   | `/api/sessions/{id}/distractions` | Log a distraction |

### Streaks
| Method | Endpoint                      | Description           |
|--------|-------------------------------|-----------------------|
| GET    | `/api/streaks/me`             | Get current streak    |

> All endpoints except `/api/auth/*` require `Authorization: Bearer <token>`

## Documentation

- [Database Schema](server/docs/SCHEMA.md) - ERD, table definitions, DDL
- [API Examples](server/docs/API_EXAMPLES.md) - cURL examples for all endpoints

## License

MIT
