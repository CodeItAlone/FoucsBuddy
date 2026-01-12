# FocusBuddy API Examples

Complete API reference with cURL examples for all endpoints.

## Base URL
```
http://localhost:8080/api
```

## Authentication

All endpoints except `/auth/*` require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### Register New User
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "handle": "focusmaster",
    "password": "securePass123"
  }'
```

**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "handle": "focusmaster"
  }
}
```

**Validation Errors (400 Bad Request)**:
```json
{
  "timestamp": "2026-01-12T23:00:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

---

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePass123"
  }'
```

**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "handle": "focusmaster"
  }
}
```

---

## Task Endpoints

### Create Task
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write API docs and setup guide",
    "priority": "HIGH",
    "dueDate": "2026-01-15"
  }'
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write API docs and setup guide",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2026-01-15",
  "createdAt": "2026-01-12T23:30:00",
  "updatedAt": "2026-01-12T23:30:00"
}
```

---

### Get All Tasks
```bash
curl http://localhost:8080/api/tasks \
  -H "Authorization: Bearer <token>"
```

**With Status Filter**:
```bash
curl "http://localhost:8080/api/tasks?status=TODO" \
  -H "Authorization: Bearer <token>"
```

**With Priority Filter**:
```bash
curl "http://localhost:8080/api/tasks?priority=HIGH" \
  -H "Authorization: Bearer <token>"
```

---

### Get Single Task
```bash
curl http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer <token>"
```

---

### Update Task
```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "MEDIUM"
  }'
```

---

### Delete Task
```bash
curl -X DELETE http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer <token>"
```

**Response**: `204 No Content`

---

### Get Pending Task Count
```bash
curl http://localhost:8080/api/tasks/count \
  -H "Authorization: Bearer <token>"
```

**Response**: `5` (plain number)

---

## Session Endpoints

### Create Focus Session
```bash
curl -X POST http://localhost:8080/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "task": "Working on API documentation",
    "duration": 25
  }'
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "status": "ACTIVE",
  "taskDescription": "Working on API documentation",
  "plannedDuration": 25,
  "startedAt": "2026-01-12T23:30:00",
  "endedAt": null,
  "distractionCount": 0
}
```

---

### Get Current Active Session
```bash
curl http://localhost:8080/api/sessions/current \
  -H "Authorization: Bearer <token>"
```

**Response**: Returns active session or `204 No Content` if none.

---

### Complete/Abandon Session
```bash
curl -X PATCH http://localhost:8080/api/sessions/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "COMPLETED",
    "reflection": "Finished the docs, feeling productive!"
  }'
```

---

### Log Distraction
```bash
curl -X POST http://localhost:8080/api/sessions/1/distractions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "description": "Checked social media"
  }'
```

---

### Get Session History
```bash
curl http://localhost:8080/api/sessions \
  -H "Authorization: Bearer <token>"
```

---

## Streak Endpoints

### Get My Streak
```bash
curl http://localhost:8080/api/streaks/me \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "currentStreak": 7,
  "graceDaysRemaining": 1,
  "lastSessionDate": "2026-01-12"
}
```

---

## Error Responses

### Unauthorized (401)
```json
{
  "timestamp": "2026-01-12T23:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

### Not Found (404)
```json
{
  "timestamp": "2026-01-12T23:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Task not found"
}
```

### Conflict (409)
```json
{
  "timestamp": "2026-01-12T23:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "User already has an active session."
}
```
