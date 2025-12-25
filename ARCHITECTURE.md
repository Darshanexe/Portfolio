# 🎯 Application Architecture

## Visual Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR COMPUTER                            │
│                                                              │
│  ┌──────────────────┐              ┌────────────────────┐  │
│  │   FRONTEND       │              │    BACKEND         │  │
│  │   (React)        │◄────────────►│    (FastAPI)       │  │
│  │                  │   HTTP/CORS  │                    │  │
│  │  Port: 3000      │              │   Port: 8001       │  │
│  │                  │              │                    │  │
│  │  - UI Components │              │   - API Endpoints  │  │
│  │  - React Router  │              │   - JWT Auth       │  │
│  │  - Axios Client  │              │   - Database       │  │
│  └──────────────────┘              └────────────────────┘  │
│           │                                   │             │
│           │                                   │             │
│           ▼                                   ▼             │
│    Browser Storage                    SQLite Database      │
│    (JWT Token)                        (ecommerce_users.db) │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## How They Work Together

### 1. User Visits Frontend (http://localhost:3000)
```
Browser → React App Loads → Shows Home Page
```

### 2. User Clicks "Register"
```
User Fills Form
    ↓
React sends POST to http://localhost:8001/register
    ↓
FastAPI validates data
    ↓
Password is hashed (SHA-256 + salt)
    ↓
User saved to SQLite database
    ↓
Success response sent back to React
    ↓
React redirects to Login page
```

### 3. User Logs In
```
User enters email + password
    ↓
React sends POST to http://localhost:8001/login
    ↓
FastAPI verifies password hash
    ↓
JWT token created (valid for 30 minutes)
    ↓
Token sent back to React
    ↓
React saves token in localStorage
    ↓
User redirected to Profile page
```

### 4. User Views Profile (Protected Route)
```
React checks if token exists
    ↓
Token found → Allow access
    ↓
React sends GET to http://localhost:8001/profile
    (with token in Authorization header)
    ↓
FastAPI verifies token signature
    ↓
FastAPI extracts user_id from token
    ↓
FastAPI fetches user from database
    ↓
User data sent back to React
    ↓
React displays profile
```

### 5. User Logs Out
```
User clicks Logout
    ↓
React removes token from localStorage
    ↓
User redirected to Login page
```

---

## File Locations

### Backend Files (Python)
```
services/user_service/
├── user_main.py      → API endpoints (register, login, profile, etc.)
├── auth.py           → JWT creation/verification
├── models.py         → Pydantic validation models
└── database.py       → SQLAlchemy User model & DB setup
```

### Frontend Files (React)
```
frontend/src/
├── App.jsx                      → Main app with routing
├── main.jsx                     → Entry point
├── components/
│   ├── Navbar.jsx               → Top navigation bar
│   ├── ProtectedRoute.jsx       → Route protection
│   └── LoadingSpinner.jsx       → Loading animation
├── pages/
│   ├── Home.jsx                 → Landing page
│   ├── Login.jsx                → Login form
│   ├── Register.jsx             → Registration form
│   └── Profile.jsx              → User dashboard
├── services/
│   └── api.js                   → All API calls (axios)
└── utils/
    └── auth.js                  → Token management helpers
```

---

## Data Flow Example: Registering a User

### Step-by-Step:

```
1. USER ACTION
   ├─ User opens: http://localhost:3000/register
   └─ Fills form: username, email, password, full_name

2. FRONTEND (React)
   ├─ Validates form (client-side)
   ├─ Calls: userAPI.register(formData)
   └─ Sends POST request to: http://localhost:8001/register

3. BACKEND (FastAPI)
   ├─ Receives request at /register endpoint
   ├─ Validates with Pydantic (UserCreate model)
   ├─ Checks if username/email already exists
   ├─ Hashes password: hash_password(plain_password)
   │   └─ Generates random salt
   │   └─ Creates: SHA-256(password + salt)
   │   └─ Returns: "salt:hash"
   ├─ Creates User object
   ├─ Saves to SQLite database
   └─ Returns user data (without password)

4. FRONTEND (React)
   ├─ Receives success response
   ├─ Shows success message
   └─ Redirects to: /login

5. DATABASE (SQLite)
   └─ New row in 'users' table:
       ├─ id: 1
       ├─ username: "kakashi"
       ├─ email: "kakashi@konoha.com"
       ├─ hashed_password: "abc123...:def456..."
       ├─ full_name: "Kakashi Hatake"
       ├─ is_active: true
       └─ created_at: "2025-11-09T10:30:00"
```

---

## Communication Protocol

### Frontend → Backend Requests

```javascript
// Example: Login request
axios.post('http://localhost:8001/login', {
  username: 'kakashi@konoha.com',
  password: 'copy_ninja'
}, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
```

### Backend → Frontend Responses

```json
// Success Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}

// Error Response
{
  "detail": "Invalid email or password"
}
```

### Protected Requests (with JWT)

```javascript
// React automatically adds token
axios.get('http://localhost:8001/profile', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
```

---

## Ports & URLs Reference

| Component | Port | Local URL | Purpose |
|-----------|------|-----------|---------|
| React Dev Server | 3000 | http://localhost:3000 | Web interface |
| FastAPI Backend | 8001 | http://localhost:8001 | API endpoints |
| Swagger Docs | 8001 | http://localhost:8001/docs | API testing |
| ReDoc | 8001 | http://localhost:8001/redoc | API documentation |

---

## Security Flow

### Password Security
```
User enters: "copy_ninja"
    ↓
Frontend sends to backend (HTTPS in production)
    ↓
Backend generates random salt: "abc123..."
    ↓
Backend hashes: SHA256("copy_ninja" + "abc123...")
    ↓
Backend stores: "abc123...:def456..." (salt:hash)
    ↓
Database never sees plain password! ✅
```

### JWT Token Security
```
Login successful
    ↓
Backend creates token with:
    - user_id (payload)
    - expiration time (30 min)
    - signature (using SECRET_KEY)
    ↓
Token format: header.payload.signature
    ↓
Frontend stores in localStorage
    ↓
Every request includes token
    ↓
Backend verifies signature
    ↓
If valid → process request
If invalid/expired → return 401 Unauthorized
```

---

## 🎓 Key Concepts

### Why Two Servers?
- **Separation of Concerns**: UI logic vs Business logic
- **Scalability**: Can deploy separately
- **Development**: Can work on frontend/backend independently
- **Technology Choice**: Best tool for each job (React for UI, Python for API)

### Why CORS?
- Browsers block cross-origin requests by default
- Frontend (port 3000) calling Backend (port 8001) = cross-origin
- CORS middleware allows this communication

### Why JWT?
- **Stateless**: Server doesn't store sessions
- **Scalable**: Works across multiple servers
- **Secure**: Cryptographically signed
- **Self-contained**: Token has all needed info

---

This is your full-stack architecture! 🚀
```
