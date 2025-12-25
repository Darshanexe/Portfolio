# E-Commerce Full-Stack Application

A modern full-stack application with FastAPI backend and React frontend, featuring JWT authentication.

## 🏗️ Project Structure

```
Rest_full_micro_service/
├── services/
│   └── user_service/          # FastAPI Backend
│       ├── user_main.py       # Main API endpoints
│       ├── auth.py            # JWT authentication
│       ├── models.py          # Pydantic models
│       └── database.py        # SQLAlchemy database
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API integration
│   │   └── utils/             # Helper functions
│   └── package.json
│
├── .env                       # Backend environment variables
└── README.md
```

## 🚀 Running the Application

### 1. Start the Backend (FastAPI)

```cmd
# Navigate to project directory
cd c:\My_CodeRoom\Rest_full_micro_service

# Activate virtual environment
c:\My_CodeRoom\My_venv\Scripts\activate

# Run the backend server
uvicorn services.user_service.user_main:app --reload --port 8001
```

Backend will be running at: **http://localhost:8001**
- API Docs (Swagger): http://localhost:8001/docs

### 2. Start the Frontend (React)

Open a **NEW terminal** and run:

```cmd
# Navigate to frontend directory
cd c:\My_CodeRoom\Rest_full_micro_service\frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

Frontend will be running at: **http://localhost:3000**

## 📝 Features

### Backend (FastAPI)
- ✅ User registration with validation
- ✅ JWT authentication (login/logout)
- ✅ Protected endpoints
- ✅ Password hashing (SHA-256 + salt)
- ✅ SQLite database
- ✅ CORS enabled for frontend
- ✅ Auto-generated API documentation

### Frontend (React)
- ✅ Beautiful modern UI
- ✅ User registration form
- ✅ Login form
- ✅ Protected profile page
- ✅ Profile editing
- ✅ Account deletion
- ✅ JWT token management
- ✅ Automatic authentication state
- ✅ Responsive design

## 🎯 Usage

1. **Open Frontend**: Go to http://localhost:3000
2. **Register**: Create a new account
3. **Login**: Login with your credentials
4. **View Profile**: See your profile information
5. **Edit Profile**: Update your full name
6. **Logout**: Click logout in navbar

## 🔒 Security Features

- JWT tokens with 30-minute expiration
- Secure password hashing with salt
- Protected routes (auto-redirect if not logged in)
- Token stored in localStorage
- CORS protection

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- python-jose (JWT)
- Pydantic (Validation)

**Frontend:**
- React 18
- React Router (Navigation)
- Axios (HTTP client)
- Vite (Build tool)

## 📚 API Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | /register | Create new user | No |
| POST | /login | Login user | No |
| GET | /profile | Get current user | Yes |
| PUT | /profile | Update profile | Yes |
| DELETE | /profile | Delete account | Yes |
| GET | /users | Get all users | No |
| GET | /health | Health check | No |

## 🎨 Pages

- **Home** (`/`) - Landing page
- **Register** (`/register`) - User registration
- **Login** (`/login`) - User login
- **Profile** (`/profile`) - User dashboard (protected)

## 📦 Environment Variables

**Backend** (`.env`):
```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./ecommerce_users.db
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8001
```

## 🐛 Troubleshooting

### Backend not starting?
- Make sure virtual environment is activated
- Check if port 8001 is available
- Verify all Python packages are installed

### Frontend not starting?
- Make sure Node.js is installed (`node --version`)
- Run `npm install` in frontend folder
- Check if port 3000 is available

### CORS errors?
- Ensure backend is running on port 8001
- Check frontend is running on port 3000
- Verify CORS middleware is enabled in backend

### Login not working?
- Check backend is running
- Open browser console for errors
- Verify API URL in frontend/.env

## 🎓 Learning Resources

- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- JWT: https://jwt.io/
- SQLAlchemy: https://www.sqlalchemy.org/

---

**Happy Coding! 🚀**
