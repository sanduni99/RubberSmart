from fastapi import APIRouter, HTTPException
import pickle
import os
from datetime import datetime
from dateutil.relativedelta import relativedelta

router = APIRouter()

# Load models from ml_models folder
model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_models')

# Initialize variables
yield_model = None
yield_info = None
price_model = None
price_info = None
type_models = None
type_infos = None
models_loaded = False

try:
    # Load total yield model
    with open(os.path.join(model_path, 'yield_prediction_model.pkl'), 'rb') as f:
        yield_model = pickle.load(f)
    with open(os.path.join(model_path, 'yield_model_info.pkl'), 'rb') as f:
        yield_info = pickle.load(f)
    
    # Load price model
    with open(os.path.join(model_path, 'price_prediction_model.pkl'), 'rb') as f:
        price_model = pickle.load(f)
    with open(os.path.join(model_path, 'price_model_info.pkl'), 'rb') as f:
        price_info = pickle.load(f)
    
    # Load rubber type models
    try:
        with open(os.path.join(model_path, 'yield_by_type_models.pkl'), 'rb') as f:
            type_models = pickle.load(f)
        with open(os.path.join(model_path, 'yield_by_type_info.pkl'), 'rb') as f:
            type_infos = pickle.load(f)
        print(f"✅ Loaded {len(type_models)} rubber type models")
    except FileNotFoundError:
        print("⚠️ Rubber type models not found - /yield/by-type endpoint will not work")
        type_models = {}
        type_infos = {}
    
    models_loaded = True
    print("✅ All models loaded successfully")
    
except Exception as e:
    models_loaded = False
    print(f"⚠️ Models not loaded: {e}")


@router.get("/yield")
def predict_yield(months: int = 6):
    """Predict total yield for next N months"""
    if not models_loaded:
        raise HTTPException(status_code=500, detail="Models not trained yet")
    
    try:
        # Validate input
        if months < 1 or months > 24:
            raise HTTPException(status_code=400, detail="Months must be between 1 and 24")
        
        predictions = yield_model.forecast(steps=months)
        
        start_date = datetime(2026, 1, 1)
        results = []
        
        for i, pred in enumerate(predictions):
            future_date = start_date + relativedelta(months=i)
            results.append({
                "month": future_date.strftime("%B"),
                "year": future_date.year,
                "predicted_yield_mt": round(float(pred), 2),
                "confidence_level": "High"
            })
        
        return {
            "predictions": results,
            "model_info": {
                "model_type": "SARIMA",
                "r2_score": f"{yield_info.get('r2', 0):.2f}",
                "mae": f"{yield_info.get('mae', 0):.2f} MT",
                "accuracy_percentage": f"{yield_info.get('accuracy', 0):.2f}%"
            },
            "market_context": {
                "trend": "Stable production",
                "note": "Sri Lankan rubber production has stabilized around 10,000 MT/month"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/yield/by-type")
def predict_yield_by_type(months: int = 6):
    """Predict yield breakdown by rubber type"""
    if not models_loaded:
        raise HTTPException(status_code=500, detail="Models not trained yet")
    
    if not type_models or len(type_models) == 0:
        raise HTTPException(
            status_code=503, 
            detail="Rubber type models not available. Please train them first."
        )
    
    try:
        if months < 1 or months > 24:
            raise HTTPException(status_code=400, detail="Months must be between 1 and 24")
        
        start_date = datetime(2026, 1, 1)
        results = []
        
        # Generate predictions for each month
        for i in range(months):
            future_date = start_date + relativedelta(months=i)
            
            month_data = {
                "month": future_date.strftime("%B"),
                "year": future_date.year,
                "types": {},
                "reliability": {}
            }
            
            month_total = 0
            
            # Predict each rubber type
            for type_name, model in type_models.items():
                try:
                    # Handle different model types
                    if isinstance(model, dict) and model.get('method') == 'ma':
                        # Simple moving average model
                        pred = model['value']
                    else:
                        # Time series model
                        forecast = model.forecast(steps=i+1)
                        pred = forecast.iloc[-1] if hasattr(forecast, 'iloc') else forecast[-1]
                    
                    pred_value = round(float(pred), 2)
                    month_data["types"][type_name] = pred_value
                    
                    # Add to total (exclude 'Total' to avoid double counting)
                    if type_name != 'Total':
                        month_total += pred_value
                    
                    # Add reliability indicator
                    if type_name in type_infos:
                        info = type_infos[type_name]
                        r2 = info.get('r2', 0)
                        
                        if r2 > 0.8:
                            reliability = "High"
                        elif r2 > 0.5:
                            reliability = "Good"
                        elif r2 > 0:
                            reliability = "Moderate"
                        else:
                            reliability = "Low"
                        
                        month_data["reliability"][type_name] = reliability
                    
                except Exception as e:
                    print(f"Error predicting {type_name}: {str(e)}")
                    month_data["types"][type_name] = None
                    month_data["reliability"][type_name] = "Error"
            
            # Add calculated total if 'Total' model not present
            if 'Total' not in month_data["types"]:
                month_data["calculated_total_mt"] = round(month_total, 2)
            
            results.append(month_data)
        
        # Model performance summary
        type_performance = {}
        for type_name, info in type_infos.items():
            r2 = info.get('r2', 0)
            type_performance[type_name] = {
                "method": info.get('method', 'Unknown'),
                "r2_score": f"{r2:.2f}",
                "mae": f"{info.get('mae', 0):.2f}",
                "reliability": (
                    "High" if r2 > 0.8 else 
                    "Good" if r2 > 0.5 else 
                    "Moderate" if r2 > 0 else 
                    "Low"
                )
            }
        
        return {
            "predictions": results,
            "type_performance": type_performance,
            "summary": {
                "total_types": len(type_models),
                "forecast_period": f"{months} months",
                "note": "Latex not included (no production in dataset)",
                "available_types": list(type_models.keys())
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/price")
def predict_price(months: int = 6):
    """Predict price for next N months"""
    if not models_loaded:
        raise HTTPException(status_code=500, detail="Models not trained yet")
    
    try:
        # Validate input
        if months < 1 or months > 24:
            raise HTTPException(status_code=400, detail="Months must be between 1 and 24")
        
        predictions = price_model.forecast(steps=months)
        
        start_date = datetime(2026, 1, 1)
        results = []
        
        for i, pred in enumerate(predictions):
            future_date = start_date + relativedelta(months=i)
            results.append({
                "month": future_date.strftime("%B"),
                "year": future_date.year,
                "predicted_price_lkr": round(float(pred), 2),
                "confidence_level": "Moderate"
            })
        
        return {
            "predictions": results,
            "model_info": {
                "model_type": "SARIMA",
                "r2_score": f"{price_info.get('r2', 0):.2f}",
                "mae": f"{price_info.get('mae', 0):.2f} LKR",
                "accuracy_percentage": f"{price_info.get('r2', 0) * 100:.2f}%"
            },
            "market_context": {
                "trend": "Moderate price fluctuation",
                "note": "Rubber prices show seasonal variations and market dynamics"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
def health_check():
    """Check if models are loaded and ready"""
    return {
        "status": "healthy" if models_loaded else "unhealthy",
        "models_loaded": models_loaded,
        "available_endpoints": {
            "yield": yield_model is not None,
            "yield_by_type": type_models is not None and len(type_models) > 0,
            "price": price_model is not None
        },
        "rubber_types_available": list(type_models.keys()) if type_models else []
    }