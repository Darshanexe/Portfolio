from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn 

import httpx
from fastapi import Request

app = FastAPI(
    title = "E-Commerce Platform API Gateway",
    description="API Gateway for managing products, orders, and users in an e-commerce platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://darshanexe.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get microservice URLs from environment variables (set in Render)
# Local development uses localhost, production uses Render URLs
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:8001")
# PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8002")  # Not ready yet
PRODUCT_SERVICE_URL = None

@app.get("/")
async def root():
    return {
        "message": "Welcome to E-Commerce Platform API Gateway!",
        "documentation": "Visit /docs for API documentation.",
        "services": {
            "user_service": USER_SERVICE_URL,
            # "product_service": PRODUCT_SERVICE_URL,  # Not deployed yet
        },
        "status": "running"
    }
    
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api_gateway"}


# ============= USER SERVICE PROXY ROUTES =============

# Proxy /register
@app.api_route("/register", methods=["POST"])
async def proxy_register(request: Request):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{USER_SERVICE_URL}/register", json=await request.json())
        return response.json()

# Proxy /login
@app.api_route("/login", methods=["POST"])
async def proxy_login(request: Request):
    form_data = await request.form()
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{USER_SERVICE_URL}/login", data=form_data)
        return response.json()

# Proxy /users
@app.api_route("/users", methods=["GET"])
async def proxy_get_users():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{USER_SERVICE_URL}/users")
        return response.json()

# Proxy /profile (GET, PUT, DELETE)
@app.api_route("/profile", methods=["GET", "PUT", "DELETE"])
async def proxy_profile(request: Request):
    headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient() as client:
        if request.method == "GET":
            response = await client.get(f"{USER_SERVICE_URL}/profile", headers=headers)
        elif request.method == "PUT":
            response = await client.put(f"{USER_SERVICE_URL}/profile", data=await request.body(), headers=headers)
        else:  # DELETE
            response = await client.delete(f"{USER_SERVICE_URL}/profile", headers=headers)
        return response.json()

# Proxy /stats
@app.api_route("/stats", methods=["GET"])
async def proxy_stats(request: Request):
    headers = {"Authorization": request.headers.get("Authorization", "")}
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{USER_SERVICE_URL}/stats", headers=headers)
        return response.json()

# Proxy /platform/stats
@app.api_route("/platform/stats", methods=["GET"])
async def proxy_platform_stats():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{USER_SERVICE_URL}/platform/stats")
        return response.json()

# Proxy /games/score
@app.api_route("/games/score", methods=["POST"])
async def proxy_game_score(request: Request):
    headers = {"Authorization": request.headers.get("Authorization", "")}
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{USER_SERVICE_URL}/games/score", json=await request.json(), headers=headers)
        return response.json()

# Proxy /games/history
@app.api_route("/games/history", methods=["GET"])
async def proxy_game_history(request: Request):
    headers = {"Authorization": request.headers.get("Authorization", "")}
    async with httpx.AsyncClient() as client:
        query_params = dict(request.query_params)
        response = await client.get(f"{USER_SERVICE_URL}/games/history", params=query_params, headers=headers)
        return response.json()

# Proxy /games/best/{game_type}
@app.api_route("/games/best/{game_type}", methods=["GET"])
async def proxy_best_score(request: Request):
    game_type = request.path_params.get("game_type")
    headers = {"Authorization": request.headers.get("Authorization", "")}
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{USER_SERVICE_URL}/games/best/{game_type}", headers=headers)
        return response.json()

# Proxy /leaderboard
@app.api_route("/leaderboard", methods=["GET"])
async def proxy_leaderboard(request: Request):
    async with httpx.AsyncClient() as client:
        query_params = dict(request.query_params)
        response = await client.get(f"{USER_SERVICE_URL}/leaderboard", params=query_params)
        return response.json()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)