from fastapi import APIRouter, HTTPException
import pickle
import os
from datetime import datetime
from dateutil.relativedelta import relativedelta

router = APIRouter()

# Load models from ml_models folder
model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_models')

try:
    with open(os.path.join(model_path, 'yield_prediction_model.pkl'), 'rb') as f:
        yield_model = pickle.load(f)
    with open(os.path.join(model_path, 'yield_model_info.pkl'), 'rb') as f:
        yield_info = pickle.load(f)
    
    with open(os.path.join(model_path, 'price_prediction_model.pkl'), 'rb') as f:
        price_model = pickle.load(f)
    with open(os.path.join(model_path, 'price_model_info.pkl'), 'rb') as f:
        price_info = pickle.load(f)
    
    models_loaded = True
except Exception as e:
    models_loaded = False
    print(f"⚠️ Models not loaded: {e}")

@router.get("/yield")
def predict_yield(months: int = 6):
    """Predict yield for next N months"""
    if not models_loaded:
        raise HTTPException(status_code=500, detail="Models not trained yet")
    
    try:
        predictions = yield_model.forecast(steps=months)
        
        last_date = datetime(2023, 12, 1)
        results = []
        
        for i, pred in enumerate(predictions, 1):
            future_date = last_date + relativedelta(months=i)
            results.append({
                "month": future_date.strftime("%B"),
                "year": future_date.year,
                "predicted_yield_mt": round(float(pred), 2),
                "confidence": f"{yield_info['accuracy']:.2f}%"
            })
        
        return {
            "predictions": results,
            "model_info": {
                "accuracy": f"{yield_info['accuracy']:.2f}%",
                "mae": f"{yield_info['mae']:.2f} MT"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/price")
def predict_price(months: int = 6):
    """Predict price for next N months"""
    if not models_loaded:
        raise HTTPException(status_code=500, detail="Models not trained yet")
    
    try:
        predictions = price_model.forecast(steps=months)
        
        last_date = datetime(2023, 12, 1)
        results = []
        
        for i, pred in enumerate(predictions, 1):
            future_date = last_date + relativedelta(months=i)
            results.append({
                "month": future_date.strftime("%B"),
                "year": future_date.year,
                "predicted_price_lkr": round(float(pred), 2),
                "confidence": f"{price_info['accuracy']:.2f}%"
            })
        
        return {
            "predictions": results,
            "model_info": {
                "accuracy": f"{price_info['accuracy']:.2f}%"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))