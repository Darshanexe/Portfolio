# Environment Variables Setup Guide

## **CRITICAL: Where to Set Each Environment Variable**

---

## **1. API GATEWAY (Render Service: `brainforge-tjls.onrender.com`)**

### Location in Render:
1. Go to Render Dashboard → **brainforge-api-gateway** (NOT user-service)
2. Go to **Settings** tab
3. Scroll to **Environment** section
4. Click **"Add Environment Variable"**

### Set This Variable:
```
USER_SERVICE_URL=https://portfolio-fa88.onrender.com
```

**Why?** The API Gateway (main.py) needs to know where the User Service is so it can proxy requests to it.

---

## **2. FRONTEND (GitHub Pages or Render Static Site)**

### For GitHub Pages Deployment:
Create file in `frontend/.env.production` (NOT in repo, create locally):
```
VITE_API_URL=https://brainforge-tjls.onrender.com
```

### For Render Frontend Deployment (if deploying frontend separately):
In Render Dashboard → **frontend service** → Settings → Environment:
```
VITE_API_URL=https://brainforge-tjls.onrender.com
```

**Why?** The frontend needs to know where the API Gateway is. Change `brainforge-tjls` to your actual gateway URL.

---

## **3. USER SERVICE (Render Service: `portfolio-fa88.onrender.com`)**

**No environment variables needed!** The User Service runs on its own. It does NOT need to know about other services.

---

## **Complete URLs Reference**

```
┌─────────────────────────────────────────────────────────┐
│                   YOUR RENDER SERVICES                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  API GATEWAY:     https://brainforge-tjls.onrender.com │
│  (deployed from:  main.py - API Gateway routes)         │
│                                                         │
│  USER SERVICE:    https://portfolio-fa88.onrender.com  │
│  (deployed from:  services/user_service/user_main.py)  │
│                                                         │
│  PRODUCT SERVICE: Not deployed yet (commented out)      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## **Request Flow**

```
1. FRONTEND (user clicks "Create Account")
   ↓ HTTP POST to: https://brainforge-tjls.onrender.com/register
   
2. API GATEWAY (main.py)
   ↓ Reads: USER_SERVICE_URL env var = https://portfolio-fa88.onrender.com
   ↓ Proxies request to: https://portfolio-fa88.onrender.com/register
   
3. USER SERVICE
   ↓ Processes request
   ↓ Responds with user data or error
   
4. API GATEWAY
   ↓ Returns response to frontend
   
5. FRONTEND
   ↓ Shows success/error message
```

---

## **Local Development Setup**

### Frontend (.env.local):
```
VITE_API_URL=http://localhost:8000
```

### Backend (no .env needed):
- API Gateway: Runs on `http://localhost:8000`
- User Service: Runs on `http://localhost:8001`
- API Gateway automatically knows this from code defaults

---

## **WRONG ❌ vs CORRECT ✅**

| Service | WRONG | CORRECT |
|---------|-------|---------|
| **API Gateway ENV** | `PRODUCT_SERVICE_URL=https://brainforge-tjls.onrender.com` | `USER_SERVICE_URL=https://portfolio-fa88.onrender.com` |
| **Frontend ENV** | `VITE_API_URL=https://portfolio-fa88.onrender.com` | `VITE_API_URL=https://brainforge-tjls.onrender.com` |
| **User Service ENV** | (needs any env vars) | (NO env vars needed) |

---

## **Checklist Before Testing**

- [ ] API Gateway has `USER_SERVICE_URL=https://portfolio-fa88.onrender.com` set
- [ ] Frontend has `VITE_API_URL=https://brainforge-tjls.onrender.com` set
- [ ] User Service is deployed and running
- [ ] API Gateway is deployed and running
- [ ] Test at: `https://brainforge-tjls.onrender.com/health` (should return `{"status":"healthy","service":"api_gateway"}`)
- [ ] Test at: `https://portfolio-fa88.onrender.com/health` (should return `{"status":"healthy","service":"user_service"}`)

---

## **Still Getting 404 Errors?**

1. **Check API Gateway is running**: Visit `https://brainforge-tjls.onrender.com/`
2. **Check User Service is running**: Visit `https://portfolio-fa88.onrender.com/health`
3. **Check API Gateway env vars**: In Render settings, verify `USER_SERVICE_URL` is set correctly
4. **Check frontend env**: In GitHub/Render, verify `VITE_API_URL` is set to the gateway URL

---

## **If Still Not Working**

Run this to test locally first:
```bash
# Terminal 1: User Service
cd services/user_service
uvicorn user_main:app --port 8001 --reload

# Terminal 2: API Gateway
cd .
uvicorn main:app --port 8000 --reload

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:3000` and try creating an account.

