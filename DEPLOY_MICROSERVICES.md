# Microservices Deployment Guide for Render

## Overview
This project contains multiple microservices that need separate deployments on Render.

## Current Services
- **User Service** → Port 8001 locally, auto-assigned on Render
- **Product Service** → Port 8002 locally, auto-assigned on Render (when ready)
- **API Gateway** → Port 8000 locally, auto-assigned on Render

---

## Deployment Steps (CORRECT ORDER)

### Step 1: Deploy User Service FIRST

1. Go to **Render Dashboard** → https://dashboard.render.com
2. Click **"New +" → "Web Service"**
3. **Connect your GitHub repo** (Darshanexe/Portfolio)
4. Fill in the form:

| Setting | Value |
|---------|-------|
| **Name** | `brainforge-user-service` |
| **Region** | Closest to you |
| **Branch** | `master` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn services.user_service.user_main:app --host 0.0.0.0` |
| **Environment** | Python 3.10 |

5. **Click "Create Web Service"** ✅
6. **Wait for deployment** (~2-3 min)
7. **Copy the URL**: `https://brainforge-user-service.onrender.com`

---

### Step 2: Deploy Product Service (when ready)

Same as User Service, but:
- **Name**: `brainforge-product-service`
- **Start Command**: `uvicorn services.product_service.product_main:app --host 0.0.0.0`
- **Note**: Only deploy when `product_main.py` is ready

---

### Step 3: Deploy API Gateway (LAST)

1. **New Web Service** on Render
2. Fill in:

| Setting | Value |
|---------|-------|
| **Name** | `brainforge-api-gateway` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0` |

3. **Set Environment Variables** (IMPORTANT!):

Click **"Add Environment Variable"** and add:

```
USER_SERVICE_URL=https://brainforge-user-service.onrender.com
PRODUCT_SERVICE_URL=https://brainforge-product-service.onrender.com
```

*(Use the exact URLs from Step 1 & 2)*

4. **Click "Create Web Service"** ✅

---

## Environment Variables Setup

### For API Gateway:
In Render dashboard, go to your gateway service → **Settings** → **Environment**

Add these variables:
```
USER_SERVICE_URL=https://brainforge-user-service.onrender.com
PRODUCT_SERVICE_URL=https://brainforge-product-service.onrender.com
```

### For User Service (if using database):
```
DATABASE_URL=postgresql://user:password@host/dbname
SECRET_KEY=your-secret-key-here
```

---

## How It Works

```
┌─────────────────────────────────────────┐
│   Your Frontend (React)                  │
│   https://yourdomain.com                 │
└────────────────────┬────────────────────┘
                     │
                     ▼
       ┌─────────────────────────────┐
       │   API Gateway (main.py)     │
       │   :onrender.com             │
       └──────────┬──────────────────┘
                  │
        ┌─────────┴──────────┐
        ▼                    ▼
   ┌─────────────┐      ┌──────────────┐
   │User Service │      │Product Service│
   │ :8001       │      │ :8002         │
   └─────────────┘      └──────────────┘
```

---

## Build Failed? Common Issues & Fixes

### Issue: "Exited with status 1 while building your code"

**Fix 1: Update requirements.txt**
```bash
pip freeze > requirements.txt
```
Make sure it includes:
```
fastapi
uvicorn
sqlalchemy
pydantic
python-jose
passlib
bcrypt
python-dotenv
email-validator
```

**Fix 2: Check Python version**
- Render defaults to Python 3.13+
- If needed, create `runtime.txt`:
```
python-3.10.13
```

**Fix 3: Check start command**
Make sure it's EXACTLY:
```
uvicorn services.user_service.user_main:app --host 0.0.0.0
```
(No `--port` or `--reload`)

### Issue: ModuleNotFoundError
- ✅ Already fixed: Using relative imports (`from . import models`)
- Verify all files have `__init__.py` in their directories

### Issue: Database Connection Error
- Set `DATABASE_URL` in environment variables
- Ensure database accepts connections from Render's IP

---

## Testing Locally Before Deploy

Run all services locally to test imports work:

```bash
# Terminal 1: User Service
uvicorn services.user_service.user_main:app --reload --port 8001

# Terminal 2: Product Service (optional)
uvicorn services.product_service.product_main:app --reload --port 8002

# Terminal 3: API Gateway
uvicorn main:app --reload --port 8000
```

Visit: http://localhost:8000/docs

---

## After Deployment

1. **Test User Service**: 
   - Visit `https://brainforge-user-service.onrender.com/health`
   - Should return: `{"status":"healthy","service":"user_service"}`

2. **Test Gateway**: 
   - Visit `https://brainforge-api-gateway.onrender.com/`
   - Should show all service URLs

3. **Update CORS in code**:
   Edit `services/user_service/user_main.py`:
   ```python
   allow_origins=[
       "http://localhost:3000",  # Local dev
       "https://brainforge-api-gateway.onrender.com",
       "https://yourdomain.com"
   ]
   ```

---

## key Points for Render

| Point | Details |
|-------|---------|
| **Port** | Always use `--host 0.0.0.0`, Render assigns port automatically |
| **Imports** | Must use relative imports (`from . import models`) |
| **Environment** | Set variables in Render dashboard, access via `os.getenv()` |
| **Secrets** | NEVER commit `.env` files, use Render's env settings |
| **Build Command** | `pip install -r requirements.txt` |
| **Each Service** | Gets its own `.onrender.com` URL |

---

## Checklist Before Deploying

- [ ] All imports are relative (`from . import`, not `import models`)
- [ ] `requirements.txt` has all dependencies
- [ ] `__init__.py` exists in every package folder
- [ ] Test locally first with `uvicorn` commands
- [ ] Deploy User Service first, get its URL
- [ ] Set environment variables in Render dashboard
- [ ] Deploy Gateway last with correct env vars
- [ ] Update frontend API endpoints to Render URLs

---

## Service Communication Example

From API Gateway to User Service:

```python
import httpx

@app.get("/users")
async def get_all_users():
    user_service_url = os.getenv("USER_SERVICE_URL")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{user_service_url}/users")
        return response.json()
```

---

## Rollback/Redeploy

If deployment fails:
1. Render → Your Service → **Settings** → **Rollback**
2. Or push new code and Render will auto-redeploy

