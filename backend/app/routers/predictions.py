from fastapi import APIRouter, HTTPException
import pickle
import os
import json
import glob
from datetime import datetime
from dateutil.relativedelta import relativedelta
import numpy as np
import pandas as pd

router = APIRouter()

model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_models')

yield_model           = None
yield_model_type      = None
yield_info            = None
price_model           = None
price_info            = None
type_models           = None
type_infos            = None
future_price_predictions = None
models_loaded         = False


def _sarima_forecast(model, steps):
    """
    Always use get_forecast() for SARIMA — never forecast().
    forecast() on a model trained on the full series returns
    in-sample fitted values, not genuine future predictions.
    """
    return list(model.get_forecast(steps=steps).predicted_mean)


def _holtwinters_forecast(model, steps):
    return list(model.forecast(steps=steps))


def _predict_steps(model, model_type, steps, train_len=None):
    """
    Unified prediction dispatcher. Returns a list of float values.
    """
    if isinstance(model, dict):
        if model.get('type') == 'linear':
            lr = model['model']
            tlen = model.get('train_len', train_len or 288)
            t = np.arange(tlen, tlen + steps).reshape(-1, 1)
            return [float(v) for v in lr.predict(t)]
        elif model.get('type') == 'ma':
            return [float(model['value'])] * steps


    if model_type == 'sarima':

        return [float(v) for v in _sarima_forecast(model, steps)]
    else:

        return [float(v) for v in _holtwinters_forecast(model, steps)]


try:
    print(f"Looking for models in: {model_path}")
    if os.path.exists(model_path):
        print("Files:", os.listdir(model_path))


    yield_model_path = os.path.join(model_path, 'yield_prediction_model.pkl')
    if os.path.exists(yield_model_path):
        with open(yield_model_path, 'rb') as f:
            raw = pickle.load(f)

        if isinstance(raw, dict):

            yield_model_type = raw.get('type', 'holtwinters')
            yield_model = raw.get('bundle') or raw.get('model') or raw
        else:

            yield_model = raw
            yield_model_type = 'holtwinters'

        print("Yield model loaded — type:", yield_model_type, "| object:", type(yield_model).__name__)
    else:
        print("Yield model NOT found at", yield_model_path)

    try:
        with open(os.path.join(model_path, 'yield_model_info.pkl'), 'rb') as f:
            yield_info = pickle.load(f)
    except Exception:
        yield_info = {}


    price_json_files = glob.glob(os.path.join(model_path, 'price_predictions_*.json'))
    if price_json_files:

        latest_json = max(price_json_files, key=os.path.getmtime)
        with open(latest_json, 'r') as f:
            future_price_predictions = json.load(f)
        print(f"Price JSON loaded: {os.path.basename(latest_json)}")
    else:
        print("No price prediction JSON found")

    for name in ['price_prediction_model.pkl', 'price_model.pkl']:
        path = os.path.join(model_path, name)
        if os.path.exists(path):
            with open(path, 'rb') as f:
                price_model = pickle.load(f)
            print(f"Price pkl model loaded: {name}")
            break

    try:
        with open(os.path.join(model_path, 'price_model_info.pkl'), 'rb') as f:
            price_info = pickle.load(f)
    except Exception:
        price_info = {}


    try:
        type_path = os.path.join(model_path, 'yield_by_type_models.pkl')
        if os.path.exists(type_path):
            with open(type_path, 'rb') as f:
                type_models = pickle.load(f)
        else:
            type_models = {}
    except Exception:
        type_models = {}

    try:
        type_info_path = os.path.join(model_path, 'yield_by_type_info.pkl')
        if os.path.exists(type_info_path):
            with open(type_info_path, 'rb') as f:
                type_infos = pickle.load(f)
        else:
            type_infos = {}
    except Exception:
        type_infos = {}

    models_loaded = True
    print("All models loaded successfully")

except Exception as e:
    models_loaded = False
    print("Model loading failed:", e)


@router.get("/yield")
def predict_yield(months: int = 6):
    """Predict total rubber yield for next N months."""
    if not models_loaded or yield_model is None:
        raise HTTPException(status_code=500, detail="Yield model not available")

    if months < 1 or months > 48:
        raise HTTPException(status_code=400, detail="months must be between 1 and 48")

    try:
        total_size = yield_info.get('total_size', 288) if yield_info else 288
        train_len  = total_size 


        model_obj  = yield_model
        if isinstance(yield_model, dict) and yield_model.get('type') == 'linear':
            train_len = yield_model.get('train_len', total_size)

        preds = _predict_steps(model_obj, yield_model_type, months, train_len)


        last_date_str = yield_info.get('last_actual_date', '') if yield_info else ''
        try:
            start_date = pd.to_datetime(last_date_str) + relativedelta(months=1)
        except Exception:
            start_date = datetime(2024, 1, 1)

        results = []
        for i, pred in enumerate(preds):
            future_date = start_date + relativedelta(months=i)
            results.append({
                "month": future_date.strftime("%B"),
                "year": int(future_date.year),
                "predicted_yield_mt": round(pred, 2),
                "confidence_level": "High" if i < 3 else "Moderate"
            })

        return {
            "predictions": results,
            "model_info": {
                "model_type":          yield_info.get('model_name', yield_model_type) if yield_info else yield_model_type,
                "r2_score":            f"{yield_info.get('r2', 0):.4f}" if yield_info else "N/A",
                "mae":                 f"{yield_info.get('mae', 0):.2f} MT" if yield_info else "N/A",
                "improvement_baseline":f"{yield_info.get('improvement_over_baseline', 0):.1f}%" if yield_info else "N/A"
            },
            "market_context": {
                "trend": "Stable with seasonal variation",
                "note":  "Predictions reflect historical production patterns including seasonal cycles"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Yield prediction error:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/price")
def predict_price(months: int = 8):
    """Predict rubber price for next N months."""
    if months < 1 or months > 60:
        raise HTTPException(status_code=400, detail="months must be between 1 and 60")


    if future_price_predictions is not None:
        try:
            available = future_price_predictions.get('predictions', [])
            if not available:
                raise ValueError("Empty predictions list in JSON")
            return {
                "predictions":    available[:months],
                "model_info":     future_price_predictions.get('model_info', {}),
                "market_context": future_price_predictions.get('market_context', {}),
                "source":         "pre_generated_forecast"
            }
        except Exception as e:
            print("Pre-generated price forecast failed, trying pkl fallback:", e)


    if not models_loaded or price_model is None:
        raise HTTPException(status_code=500, detail="Price model not available. Run train_price_model.py first.")

    try:
        last_date_str = price_info.get('last_actual_date', '') if price_info else ''
        try:
            start_date = pd.to_datetime(last_date_str) + relativedelta(months=1)
        except Exception:
            start_date = datetime(2024, 1, 1)

        raw_preds = price_model.forecast(steps=months)
        results = []
        for i, pred in enumerate(raw_preds):
            future_date = start_date + relativedelta(months=i)
            results.append({
                "month":               future_date.strftime("%B"),
                "year":                int(future_date.year),
                "predicted_price_lkr": round(float(pred), 2),
                "confidence_level":    "Moderate"
            })

        return {
            "predictions":    results,
            "model_info":     {"model_type": "SARIMA (fallback)"},
            "market_context": {"note": "Prices show seasonal variation and market dynamics"},
            "source":         "trained_model_fallback"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/yield/by-type")
def predict_yield_by_type(months: int = 6):
    """Predict rubber yield by product type for next N months."""
    if not models_loaded or not type_models:
        raise HTTPException(status_code=500, detail="Rubber type models not available. Run train_yield_by_type_model.py first.")

    if months < 1 or months > 48:
        raise HTTPException(status_code=400, detail="months must be between 1 and 48")

    try:

        last_date_str = ''
        if type_infos:
            for info in type_infos.values():
                if 'last_actual_date' in info:
                    last_date_str = info['last_actual_date']
                    break
        try:
            start_date = pd.to_datetime(last_date_str) + relativedelta(months=1)
        except Exception:
            start_date = datetime(2024, 1, 1)

        predictions_by_month = []

        for i in range(months):
            future_date = start_date + relativedelta(months=i)
            month_pred  = {
                "month": future_date.strftime("%B"),
                "year":  int(future_date.year),
                "types": {}
            }
            total_for_month = 0
            step = i + 1  

            for type_name, model in type_models.items():
                try:
                    info      = type_infos.get(type_name, {})
                    mtype     = info.get('model_type', 'holtwinters')
                    train_len = info.get('train_len', 288)


                    all_preds = _predict_steps(model, mtype, step, train_len)
                    type_value = round(all_preds[-1], 2)

                    month_pred["types"][type_name] = type_value
                    if type_name != "Total":
                        total_for_month += type_value

                except Exception as e:
                    print(f"Error predicting {type_name}: {e}")
                    month_pred["types"][type_name] = 0

            if "Total" not in month_pred["types"]:
                month_pred["types"]["Total"] = round(total_for_month, 2)

            predictions_by_month.append(month_pred)


        type_performance = {}
        for type_name in type_models.keys():
            info = type_infos.get(type_name, {})
            r2   = info.get('r2', 0)
            type_performance[type_name] = {
                "method":      info.get('method', 'Unknown'),
                "mae":         f"{info.get('mae', 0):.2f} MT",
                "r2":          round(r2, 4),
                "reliability": ("High"     if r2 > 0.90 else
                                "Good"     if r2 > 0.70 else
                                "Moderate" if r2 > 0.50 else "Low")
            }

        end_date = start_date + relativedelta(months=months - 1)
        return {
            "predictions":       predictions_by_month,
            "summary": {
                "total_months": months,
                "start_date":   start_date.strftime("%B %Y"),
                "end_date":     end_date.strftime("%B %Y"),
                "note":         "Latex excluded — no production in Sri Lanka"
            },
            "type_performance": type_performance,
            "model_info": {
                "total_types":      len(type_models),
                "types_available":  list(type_models.keys())
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
    """Get multi-year price forecasts from pre-generated JSON."""
    if years < 1 or years > 10:
        raise HTTPException(status_code=400, detail="years must be between 1 and 10")


    data = future_price_predictions
    if data is None:
        price_json_files = glob.glob(os.path.join(model_path, 'price_predictions_*.json'))
        if not price_json_files:
            raise HTTPException(status_code=500, detail="Advanced forecasts not available. Run train_price_model.py first.")
        with open(max(price_json_files, key=os.path.getmtime), 'r') as f:
            data = json.load(f)

    try:
        available = data.get('predictions', [])
        target_year = datetime.now().year + years
        filtered = [p for p in available if p['year'] <= target_year]

        yearly_summary = {}
        for pred in filtered:
            yr = pred['year']
            yearly_summary.setdefault(yr, []).append(pred['predicted_price_lkr'])

        yearly_averages = {yr: round(sum(v) / len(v), 2) for yr, v in yearly_summary.items()}

        return {
            "predictions": filtered,
            "summary": {
                "forecast_period":   f"{years} years",
                "years_covered":     list(yearly_averages.keys()),
                "yearly_averages":   yearly_averages,
                "total_predictions": len(filtered)
            },
            "model_info":     data.get('model_info', {}),
            "market_context": data.get('market_context', {})
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
def health_check():
    """Check if models are loaded and ready."""
    return {
        "status":                 "healthy" if models_loaded else "unhealthy",
        "models_loaded":          models_loaded,
        "yield_model_type":       yield_model_type,
        "pre_generated_forecasts": future_price_predictions is not None,
        "available_endpoints": {
            "yield":          yield_model is not None,
            "yield_by_type":  bool(type_models),
            "price":          price_model is not None or future_price_predictions is not None,
            "price_advanced": future_price_predictions is not None
        },
        "rubber_types_available": list(type_models.keys()) if type_models else []
    }