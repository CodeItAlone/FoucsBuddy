# FocusBuddy

**Social Accountability Engine**

FocusBuddy is a brutal, execution-focused productivity app. It uses social pressure and strict rules (no pausing, streak decay) to force consistency.

## Project Structure

- **`server/`**: Spring Boot Backend.
  - Core Logic: `StreakService` (Decay), `SessionService` (State Machine).
  - API: REST + WebSocket.
- **`client/`**: React Native (Expo) Frontend.
  - Dark Mode UI.
  - Timer and Session Management.

## Quick Start

### Backend
```bash
cd server
# Ensure PostgreSQL is running on localhost:5432 (db: ironclad)
mvn spring-boot:run
```

### Frontend
```bash
cd client
npm start
# Press 'a' for Android Emulator
```

## Configuration
- **Database**: Edit `server/src/main/resources/application.properties`.
- **API URL**: Edit `client/src/services/api.js` (Default: `http://10.0.2.2:8080`).
