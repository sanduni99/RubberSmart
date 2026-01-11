from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Price

router = APIRouter()

@router.get("/latest")
def get_latest_price(db: Session = Depends(get_db)):
    """Get the latest price"""
    latest = db.query(Price).order_by(Price.Year.desc()).first()
    if not latest:
        raise HTTPException(status_code=404, detail="No price data found")
    return latest

@router.get("/{year}")
def get_prices_by_year(year: int, db: Session = Depends(get_db)):
    """Get prices for a specific year"""
    prices = db.query(Price).filter(Price.Year == year).all()
    if not prices:
        raise HTTPException(status_code=404, detail=f"No prices found for year {year}")
    return prices
