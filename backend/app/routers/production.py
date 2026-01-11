from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Production

router = APIRouter()

@router.get("/")
def get_all_production(db: Session = Depends(get_db)):
    """Return all production rows"""
    return db.query(Production).all()

@router.get("/{year}")
def get_production_by_year(year: int, db: Session = Depends(get_db)):
    """Return production data filtered by year"""
    return db.query(Production).filter(Production.year == year).all()
