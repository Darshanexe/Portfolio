from fastapi import FastAPI
import uvicorn

app = FastAPI(
    title = "E-Commerce Platform API Gateway",
    description="API Gateway for managing products, orders, and users in an e-commerce platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the E-Commerce Platform API Gateway!",
        "documentation": "Visit /docs for API documentation.",
        "services": {
            "user_service": "https://brainforge-tjls.onrender.com",
            "product_service": "https://brainforge-tjls.onrender.com",
            "order_service": "https://brainforge-tjls.onrender.com",
            "payment_service": "https://brainforge-tjls.onrender.com",
            "notification_service": "https://brainforge-tjls.onrender.com"
        }
    }
    
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api_gateway"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)