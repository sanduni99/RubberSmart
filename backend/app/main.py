from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.routers import admin
from app.routers import admin_users
from app.database import get_db, engine
from app.models import Base, Production, Price
from app.routers import production, prices, stats, auth  
from app.routers import predictions
from app.routers import contact
from app.routers.contact import router as contact_router
from app.scheduler.email_scheduler import start_scheduler


# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RubberSmart API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(production.router, prefix="/api/production", tags=["Production"])
app.include_router(prices.router, prefix="/api/prices", tags=["Prices"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"]) 
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(admin.router)
app.include_router(admin_users.router)


@app.get("/")
def root():
    return {
        "message": "RubberSmart API",
        "version": "1.0",
        "status": "running",
        "endpoints": {
            "predictions_health": "/api/predictions/health",
            "yield": "/api/predictions/yield?months=6",
            "yield_by_type": "/api/predictions/yield/by-type?months=6",
            "price": "/api/predictions/price?months=6"
        }
    }

@app.get("/api/production")
def get_production(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    production = db.query(Production).offset(skip).limit(limit).all()
    return production

@app.get("/api/prices")
def get_prices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prices = db.query(Price)\
        .order_by(Price.Year.desc(), Price.id.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return prices

@app.get("/api/production/latest")
def get_latest_production(db: Session = Depends(get_db)):
    latest = db.query(Production).order_by(Production.Year.desc()).first()
    return latest

@app.get("/api/prices/latest")
def get_latest_price(db: Session = Depends(get_db)):
    latest = db.query(Price).order_by(Price.Year.desc()).first()
    return latest

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    prod_stats = db.query(
        func.count(Production.id).label('total_records'),
        func.avg(Production.Total_MT).label('avg_production'),
        func.min(Production.Total_MT).label('min_production'),
        func.max(Production.Total_MT).label('max_production')
    ).first()
    
    price_stats = db.query(
        func.avg(Price.Price_per_Liter_LKR).label('avg_price'),
        func.min(Price.Price_per_Liter_LKR).label('min_price'),
        func.max(Price.Price_per_Liter_LKR).label('max_price')
    ).first()
    
    return {
        "production": {
            "total_records": prod_stats.total_records,
            "avg_production_mt": round(prod_stats.avg_production, 2),
            "min_production_mt": prod_stats.min_production,
            "max_production_mt": prod_stats.max_production
        },
        "prices": {
            "avg_price_lkr": round(price_stats.avg_price, 2),
            "min_price_lkr": price_stats.min_price,
            "max_price_lkr": price_stats.max_price
        }
    }
    
    
@app.on_event("startup")
def startup_event():
    start_scheduler()
    