from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

from app.config import settings
from app.database import async_engine, Base
from app.ws import handle_websocket
from app.core.rate_limit import rate_limit_middleware

# Import routers
from app.api import auth, products, recommendations, orders, cart, wishlist, analytics, admin, coupons, monitoring, features
from app.api import marketplace, inventory, checkout, payments, order_lifecycle, delivery, reviews_enterprise
from app.api import flash_sales, price_tracking, loyalty, prime, notifications_enterprise, community, support, enterprise_admin
from app.api import ai_features, dashboard
from app.api import payments_gateway
from app.api import chat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")
    yield
    await async_engine.dispose()
    logger.info("Database connections closed")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-Powered Personalized Shopping Platform API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Rate limiting (outermost middleware)
app.middleware("http")(rate_limit_middleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Validation error"}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc) if settings.DEBUG else "An unexpected error occurred"}
    )


# Register routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(recommendations.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(coupons.router)
app.include_router(monitoring.router)
app.include_router(features.router)
app.include_router(marketplace.router)
app.include_router(inventory.router)
app.include_router(checkout.router)
app.include_router(payments.router)
app.include_router(order_lifecycle.router)
app.include_router(delivery.router)
app.include_router(reviews_enterprise.router)
app.include_router(flash_sales.router)
app.include_router(price_tracking.router)
app.include_router(loyalty.router)
app.include_router(prime.router)
app.include_router(notifications_enterprise.router)
app.include_router(community.router)
app.include_router(support.router)
app.include_router(enterprise_admin.router)
app.include_router(ai_features.router)
app.include_router(payments_gateway.router)
app.include_router(chat.router)
app.include_router(dashboard.router)


@app.websocket("/api/ws")
async def websocket_endpoint(ws: WebSocket, token: str = Query(None)):
    await handle_websocket(ws, token)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION
    }


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "docs": "/api/docs",
        "health": "/api/health"
    }
