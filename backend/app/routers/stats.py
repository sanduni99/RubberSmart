from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Production

router = APIRouter()

@router.get("/total_by_year")
def total_production_by_year(db: Session = Depends(get_db)):
    """Return total production per year"""
    try:
        results = db.query(
            Production.Year,  
            func.sum(Production.Total_MT).label("total_mt") 
        ).group_by(Production.Year).order_by(Production.Year).all()

        if not results:
            raise HTTPException(status_code=404, detail="No production data found")

        return [{"year": r.Year, "total_mt": float(r.total_mt)} for r in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
