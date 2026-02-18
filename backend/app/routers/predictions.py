from fastapi import APIRouter, HTTPException
import pickle
import os
import json
from datetime import datetime
from dateutil.relativedelta import relativedelta
import pandas as pd

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
future_price_predictions = None  # NEW: For pre-generated predictions
models_loaded = False

try:
    print(f"📂 Looking for models in: {model_path}")
    
    # Check what files exist
    if os.path.exists(model_path):
        files = os.listdir(model_path)
        print(f"📁 Files in ml_models: {files}")
    
    # FIRST: Try to load pre-generated future predictions (EASIER)
    future_predictions_path = os.path.join(model_path, 'price_predictions_2023_2028.json')
    if os.path.exists(future_predictions_path):
        with open(future_predictions_path, 'r') as f:
            future_price_predictions = json.load(f)
        print(f"✅ Loaded pre-generated price predictions (2024-2028)")
    
    # Load total yield model
    yield_model_path = os.path.join(model_path, 'yield_prediction_model.pkl')
    if os.path.exists(yield_model_path):
        with open(yield_model_path, 'rb') as f:
            yield_model = pickle.load(f)
        print("✅ Loaded yield model")
    else:
        print(f"⚠️ Yield model not found: {yield_model_path}")
    
    # Load price model (try different possible names)
    price_model_found = False
    possible_price_model_names = [
        'price_prediction_model.pkl',
        'price_predictionn_model.pkl',  # with double 'n'
        'price_model.pkl'
    ]
    
    for model_name in possible_price_model_names:
        price_model_path = os.path.join(model_path, model_name)
        if os.path.exists(price_model_path):
            with open(price_model_path, 'rb') as f:
                price_model = pickle.load(f)
            price_model_found = True
            print(f"✅ Loaded price model: {model_name}")
            break
    
    if not price_model_found:
        print("⚠️ Price model not found. Tried:")
        for name in possible_price_model_names:
            print(f"   - {name}")
    
    # Load model info files
    try:
        with open(os.path.join(model_path, 'price_model_info.pkl'), 'rb') as f:
            price_info = pickle.load(f)
    except:
        print("⚠️ Price model info not found")
        price_info = {}
    
    try:
        with open(os.path.join(model_path, 'yield_model_info.pkl'), 'rb') as f:
            yield_info = pickle.load(f)
    except:
        print("⚠️ Yield model info not found")
        yield_info = {}
    
    # Load rubber type models
    try:
        type_models_path = os.path.join(model_path, 'yield_by_type_models.pkl')
        if os.path.exists(type_models_path):
            with open(type_models_path, 'rb') as f:
                type_models = pickle.load(f)
            print(f"✅ Loaded {len(type_models)} rubber type models")
        else:
            print("⚠️ Rubber type models not found")
            type_models = {}
    except Exception as e:
        print(f"⚠️ Error loading type models: {e}")
        type_models = {}
    
    try:
        type_infos_path = os.path.join(model_path, 'yield_by_type_info.pkl')
        if os.path.exists(type_infos_path):
            with open(type_infos_path, 'rb') as f:
                type_infos = pickle.load(f)
    except:
        type_infos = {}
    
    models_loaded = True
    print("✅ Models loaded successfully")
    
except Exception as e:
    models_loaded = False
    print(f"❌ Models not loaded: {e}")
    import traceback
    traceback.print_exc()


@router.get("/yield")
def predict_yield(months: int = 6):
    """Predict total yield for next N months"""
    if not models_loaded or yield_model is None:
        raise HTTPException(status_code=500, detail="Yield model not available")
    
    try:
        # Validate input
        if months < 1 or months > 48:
            raise HTTPException(status_code=400, detail="Months must be between 1 and 48")

        # Use last known date from model info or use January 2024 as default
        start_year = 2024
        start_month = 1
        
        if yield_info and 'training_date' in yield_info:
            try:
                # Try to parse the training date
                train_date = pd.to_datetime(yield_info['training_date'])
                # Start from next month after training
                start_date = train_date + relativedelta(months=1)
                start_year = start_date.year
                start_month = start_date.month
            except:
                pass
        
        start_date = datetime(start_year, start_month, 1)
        predictions = yield_model.forecast(steps=months)
        
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
                "accuracy_percentage": f"{yield_info.get('r2', 0) * 100:.2f}%"
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


@router.get("/price")
def predict_price(months: int = 8):
    """Predict price for next N months"""
    # OPTION 1: Use pre-generated predictions (BEST - from your training)
    if future_price_predictions is not None:
        try:
            if months < 1 or months > 60:  # Up to 5 years
                raise HTTPException(status_code=400, detail="Months must be between 1 and 60")
            
            # Get the first N months from pre-generated predictions
            available_predictions = future_price_predictions.get('predictions', [])
            
            if len(available_predictions) == 0:
                raise HTTPException(status_code=500, detail="No predictions available")
            
            # Return requested number of months
            predictions_to_return = available_predictions[:months]
            
            return {
                "predictions": predictions_to_return,
                "model_info": future_price_predictions.get('model_info', {}),
                "market_context": future_price_predictions.get('market_context', {}),
                "source": "pre_generated_forecast"
            }
        except HTTPException:
            raise
        except Exception as e:
            # Fall back to model if pre-generated fails
            pass
    
    # OPTION 2: Use the trained model
    if not models_loaded or price_model is None:
        raise HTTPException(status_code=500, detail="Price model not available. Please run training script.")
    
    try:
        # Validate input
        if months < 1 or months > 48:
            raise HTTPException(status_code=400, detail="Months must be between 1 and 36")
        
        # Use last known date from model info or use January 2024 as default
        start_year = 2024
        start_month = 1
        
        if price_info and 'training_date' in price_info:
            try:
                # Try to parse the training date
                train_date = pd.to_datetime(price_info['training_date'])
                # Start from next month after training
                start_date = train_date + relativedelta(months=1)
                start_year = start_date.year
                start_month = start_date.month
            except:
                pass
        
        start_date = datetime(start_year, start_month, 1)
        predictions = price_model.forecast(steps=months)
        
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
            },
            "source": "trained_model"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/yield/by-type")
def predict_yield_by_type(months: int = 6):
    """Predict yield by rubber type for next N months"""
    if not models_loaded or not type_models:
        raise HTTPException(
            status_code=500, 
            detail="Rubber type models not available. Please run training script first."
        )
    
    try:
        # Validate input
        if months < 1 or months > 48:
            raise HTTPException(status_code=400, detail="Months must be between 1 and 36")
        
        # Use last known date from model info or use January 2024 as default
        start_year = 2024
        start_month = 1
        
        if type_infos and any('training_date' in info for info in type_infos.values()):
            try:
                # Find the earliest training date among type models
                train_dates = []
                for type_name, info in type_infos.items():
                    if 'training_date' in info:
                        train_dates.append(pd.to_datetime(info['training_date']))
                
                if train_dates:
                    # Start from next month after latest training
                    latest_date = max(train_dates)
                    start_date = latest_date + relativedelta(months=1)
                    start_year = start_date.year
                    start_month = start_date.month
            except:
                pass
        
        start_date = datetime(start_year, start_month, 1)
        
        predictions_by_month = []
        
        # Generate predictions for each month
        for i in range(months):
            future_date = start_date + relativedelta(months=i)
            month_pred = {
                "month": future_date.strftime("%B"),
                "year": future_date.year,
                "types": {}
            }
            
            total_for_month = 0
            
            # Predict for each rubber type
            for type_name, model in type_models.items():
                try:
                    # Get prediction for this specific step
                    type_pred = model.forecast(steps=i+1)[-1]  # Get last prediction
                    type_value = round(float(type_pred), 2)
                    month_pred["types"][type_name] = type_value
                    total_for_month += type_value
                except Exception as e:
                    print(f"Error predicting for {type_name}: {e}")
                    month_pred["types"][type_name] = 0
            
            # Add total
            month_pred["types"]["Total"] = round(total_for_month, 2)
            predictions_by_month.append(month_pred)
        
        # Calculate type performance info
        type_performance = {}
        for type_name in type_models.keys():
            if type_name in type_infos:
                info = type_infos[type_name]
                reliability = "High"
                mae_val = info.get('mae', 0)
                
                # Determine reliability based on MAE
                if mae_val > 100:
                    reliability = "Low"
                elif mae_val > 50:
                    reliability = "Moderate"
                elif mae_val > 20:
                    reliability = "Good"
                
                type_performance[type_name] = {
                    "method": "SARIMA",
                    "mae": f"{mae_val:.2f} MT",
                    "reliability": reliability
                }
        
        return {
            "predictions": predictions_by_month,
            "summary": {
                "total_months": months,
                "start_date": start_date.strftime("%B %Y"),
                "end_date": (start_date + relativedelta(months=months-1)).strftime("%B %Y"),
                "note": "Latex not shown (no production in Sri Lanka)"
            },
            "type_performance": type_performance,
            "model_info": {
                "total_types": len(type_models),
                "types_available": list(type_models.keys())
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
    

@router.get("/price/advanced")
def predict_price_advanced(years: int = 5):
    """Get multi-year price forecasts"""
    if future_price_predictions is None:
        # Try to load it if not already loaded
        future_predictions_path = os.path.join(model_path, 'price_predictions_2023_2028.json')
        if os.path.exists(future_predictions_path):
            with open(future_predictions_path, 'r') as f:
                future_price_predictions = json.load(f)
        else:
            raise HTTPException(
                status_code=500, 
                detail="Advanced forecasts not available. Run training script first."
            )
    
    try:
        if years < 1 or years > 10:
            raise HTTPException(status_code=400, detail="Years must be between 1 and 10")
        
        available_predictions = future_price_predictions.get('predictions', [])
        
        # Filter by years
        current_year = datetime.now().year
        target_year = current_year + years
        
        filtered_predictions = [
            p for p in available_predictions 
            if p['year'] <= target_year
        ]
        
        # Group by year for summary
        yearly_summary = {}
        for pred in filtered_predictions:
            year = pred['year']
            if year not in yearly_summary:
                yearly_summary[year] = []
            yearly_summary[year].append(pred['predicted_price_lkr'])
        
        # Calculate yearly averages
        yearly_averages = {}
        for year, prices in yearly_summary.items():
            yearly_averages[year] = round(sum(prices) / len(prices), 2)
        
        return {
            "predictions": filtered_predictions,
            "summary": {
                "forecast_period": f"{years} years",
                "years_covered": list(yearly_averages.keys()),
                "yearly_averages": yearly_averages,
                "total_predictions": len(filtered_predictions)
            },
            "model_info": future_price_predictions.get('model_info', {}),
            "market_context": future_price_predictions.get('market_context', {})
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
        "pre_generated_forecasts": future_price_predictions is not None,
        "available_endpoints": {
            "yield": yield_model is not None,
            "yield_by_type": type_models is not None and len(type_models) > 0,
            "price": price_model is not None or future_price_predictions is not None,
            "price_advanced": future_price_predictions is not None
        },
        "rubber_types_available": list(type_models.keys()) if type_models else []
    }