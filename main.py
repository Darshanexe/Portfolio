from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get microservice URLs from environment variables (set in Render)
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:8001")
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8002")

@app.get("/")
async def root():
    return {
        "message": "Welcome to E-Commerce Platform API Gateway!",
        "documentation": "Visit /docs for API documentation.",
        "services": {
            "user_service": USER_SERVICE_URL,
            "product_service": PRODUCT_SERVICE_URL,
        },
        "status": "running"
    }
    
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api_gateway"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)