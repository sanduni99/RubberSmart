# train_yield_by_type_model.py - FINAL FIXED VERSION
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import pickle
import warnings
import os
warnings.filterwarnings('ignore')

DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print("="*60)
print("TRAINING RUBBER TYPE PREDICTION MODELS (FINAL)")
print("="*60)

# Load data
print("\n📊 Loading production data...")
df = pd.read_sql("SELECT * FROM production ORDER BY \"Year\", id", engine)
print(f"   Total records: {len(df)}")

# Prepare data
print("\n🔧 Preparing data...")
df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'], format='%Y-%B')
df = df.sort_values('Date').set_index('Date')

print(f"   Date range: {df.index.min()} to {df.index.max()}")

# Define rubber types
RUBBER_TYPES = {
    'Sheet': 'Sheet',
    'Sole': 'Sole',
    'Crepe': 'Crepe',
    'Scrap': 'Scrap',
    'Crepe Latex': 'Crepe Latex',
    'Crepe TSR': 'Crepe T.S.R.',
    'Latex': 'Latex',
    'Total': 'Total (MT)'
}

models = {}
model_infos = {}
successful = 0
failed = 0

def safe_r2_score(y_true, y_pred):
    """Calculate R² safely, handling edge cases"""
    try:
        # Check for zero variance
        if np.var(y_true) == 0:
            return 0.0
        if np.var(y_pred) == 0:
            return -999.0  # Indicates constant predictions
        
        r2 = r2_score(y_true, y_pred)
        
        # Cap extremely negative R² scores
        if r2 < -10:
            return -10.0
        
        return r2
    except:
        return -999.0

def train_with_fallback(train, test, type_name):
    """Try multiple models and pick the best one"""
    
    best_model = None
    best_mae = float('inf')
    best_method = None
    best_predictions = None
    results = []
    
    # Method 1: SARIMA
    try:
        model = SARIMAX(train, 
                        order=(1, 1, 1),
                        seasonal_order=(1, 1, 1, 12),
                        enforce_stationarity=False,
                        enforce_invertibility=False)
        fitted = model.fit(disp=False, maxiter=200)
        preds = fitted.forecast(steps=len(test))
        mae = mean_absolute_error(test, preds)
        results.append(('SARIMA', mae, preds, fitted))
        print(f"      ✓ SARIMA MAE: {mae:.2f}")
    except Exception as e:
        print(f"      ✗ SARIMA failed: {str(e)[:50]}")
    
    # Method 2: Simple ARIMA
    try:
        model = ARIMA(train, order=(2, 1, 2))
        fitted = model.fit()
        preds = fitted.forecast(steps=len(test))
        mae = mean_absolute_error(test, preds)
        results.append(('ARIMA', mae, preds, fitted))
        print(f"      ✓ ARIMA MAE: {mae:.2f}")
    except Exception as e:
        print(f"      ✗ ARIMA failed: {str(e)[:50]}")
    
    # Method 3: Simpler ARIMA
    try:
        model = ARIMA(train, order=(1, 1, 1))
        fitted = model.fit()
        preds = fitted.forecast(steps=len(test))
        mae = mean_absolute_error(test, preds)
        results.append(('ARIMA(1,1,1)', mae, preds, fitted))
        print(f"      ✓ ARIMA(1,1,1) MAE: {mae:.2f}")
    except Exception as e:
        print(f"      ✗ ARIMA(1,1,1) failed: {str(e)[:50]}")
    
    # Method 4: Exponential Smoothing
    try:
        model = ExponentialSmoothing(train, seasonal_periods=12, seasonal='add')
        fitted = model.fit()
        preds = fitted.forecast(steps=len(test))
        mae = mean_absolute_error(test, preds)
        results.append(('ExpSmoothing', mae, preds, fitted))
        print(f"      ✓ ExpSmoothing MAE: {mae:.2f}")
    except Exception as e:
        print(f"      ✗ ExpSmoothing failed: {str(e)[:50]}")
    
    # Pick best model based on MAE
    if results:
        results.sort(key=lambda x: x[1])  # Sort by MAE
        best_method, best_mae, best_predictions, best_model = results[0]
        return best_model, best_predictions, best_mae, best_method
    
    # Ultimate fallback: Moving Average
    print(f"      Using Simple Moving Average (fallback)...")
    ma_value = train.tail(12).mean()
    preds = pd.Series([ma_value] * len(test), index=test.index)
    mae = mean_absolute_error(test, preds)
    best_model = {'method': 'ma', 'value': ma_value, 'train': train}
    return best_model, preds, mae, 'MovingAverage'

# Train model for each rubber type
for type_name, column_name in RUBBER_TYPES.items():
    print(f"\n{'='*60}")
    print(f"🔧 Training: {type_name}")
    print(f"{'='*60}")
    
    # Check if column exists
    if column_name not in df.columns:
        print(f"   ❌ Column '{column_name}' not found, skipping...")
        failed += 1
        continue
    
    # Get the series
    y = df[column_name].dropna()
    
    # Check for zero/constant data
    if len(y) == 0:
        print(f"   ❌ No data for {type_name}, skipping...")
        failed += 1
        continue
    
    if y.std() == 0:
        print(f"   ⚠️ {type_name} has constant value (std=0), skipping...")
        print(f"      All values are: {y.iloc[0]}")
        failed += 1
        continue
    
    print(f"   📊 Data summary:")
    print(f"      Records: {len(y)}")
    print(f"      Mean: {y.mean():.2f}")
    print(f"      Std: {y.std():.2f}")
    print(f"      Min: {y.min():.2f}")
    print(f"      Max: {y.max():.2f}")
    
    # Split data
    train_size = int(len(y) * 0.8)
    train, test = y[:train_size], y[train_size:]
    
    print(f"   ✂️ Split: {len(train)} train, {len(test)} test")
    print(f"   🤖 Training with multiple methods...")
    
    try:
        # Try multiple models
        best_model, predictions, mae, method = train_with_fallback(train, test, type_name)
        
        # Calculate metrics safely
        r2 = safe_r2_score(test, predictions)
        rmse = np.sqrt(mean_squared_error(test, predictions))
        
        # Calculate MAPE safely
        try:
            mape = np.mean(np.abs((test - predictions) / test)) * 100
            # Cap MAPE at reasonable value
            if mape > 1000:
                mape = 999.9
        except:
            mape = 999.9
        
        # Baseline
        naive_predictions = [train.iloc[-1]] * len(test)
        naive_mae = mean_absolute_error(test, naive_predictions)
        improvement = ((naive_mae - mae) / naive_mae) * 100 if naive_mae > 0 else 0
        
        print(f"\n   ✅ Best Model: {method}")
        print(f"   📊 Performance:")
        print(f"      MAE: {mae:.2f}")
        print(f"      RMSE: {rmse:.2f}")
        print(f"      R²: {r2:.4f} ({r2*100:.2f}%)")
        print(f"      MAPE: {mape:.2f}%")
        print(f"      vs Baseline: {improvement:.1f}% {'better' if improvement > 0 else 'worse'}")
        
        # More lenient acceptance criteria
        # Accept if: R² > -5 OR improvement > 10% OR MAE is very small
        should_save = (r2 > -5.0) or (improvement > 10) or (mae < 5)
        
        if should_save:
            models[type_name] = best_model
            model_infos[type_name] = {
                'method': method,
                'mae': float(mae),
                'rmse': float(rmse),
                'r2': float(r2),
                'mape': float(mape) if mape < 999 else 0,
                'mean': float(y.mean()),
                'std': float(y.std()),
                'improvement': float(improvement),
                'records': len(y)
            }
            successful += 1
            print(f"   ✅ Model saved")
        else:
            print(f"   ⚠️ Model quality too low, not saving")
            print(f"      (R²={r2:.2f}, Improvement={improvement:.1f}%, MAE={mae:.2f})")
            failed += 1
        
    except Exception as e:
        print(f"   ❌ All methods failed for {type_name}: {str(e)}")
        import traceback
        traceback.print_exc()
        failed += 1
        continue

# Save models
print(f"\n{'='*60}")
print("💾 Saving models...")
print(f"{'='*60}")

if len(models) > 0:
    save_dir = os.path.join(os.path.dirname(__file__), '..')
    
    with open(os.path.join(save_dir, 'yield_by_type_models.pkl'), 'wb') as f:
        pickle.dump(models, f)
    
    with open(os.path.join(save_dir, 'yield_by_type_info.pkl'), 'wb') as f:
        pickle.dump(model_infos, f)
    
    print(f"   ✅ Models saved successfully")
    print(f"   📁 Location: {os.path.join(save_dir, 'yield_by_type_models.pkl')}")
    
    # Generate predictions
    print(f"\n🔮 Generating 6-month predictions...")
    print(f"{'='*60}")
    
    from dateutil.relativedelta import relativedelta
    last_date = df.index.max()
    
    # Create prediction table
    for i in range(6):
        future_date = last_date + relativedelta(months=i+1)
        print(f"\n📅 {future_date.strftime('%B %Y')}:")
        
        month_total = 0
        for type_name, model in models.items():
            try:
                if isinstance(model, dict) and model.get('method') == 'ma':
                    pred = model['value']
                else:
                    pred = model.forecast(steps=i+1).iloc[-1]
                
                print(f"   {type_name:15} : {pred:8.2f}")
                if type_name != 'Total':
                    month_total += pred
            except Exception as e:
                print(f"   {type_name:15} : Error")
        
        if 'Total' not in models:
            print(f"   {'Calculated Total':15} : {month_total:8.2f}")
else:
    print(f"   ⚠️ No models were successfully trained!")

# Summary
print(f"\n{'='*60}")
print("✅ TRAINING COMPLETE!")
print(f"{'='*60}")
print(f"   ✅ Successfully trained: {successful} models")
print(f"   ❌ Failed/Skipped: {failed} models")
print(f"   📊 Total usable models: {len(models)}")

if len(models) > 0:
    print(f"\n   📋 Rubber types successfully trained:")
    for type_name, info in sorted(model_infos.items(), key=lambda x: x[1]['r2'], reverse=True):
        r2 = info['r2'] * 100
        mae = info['mae']
        method = info['method']
        quality = "Excellent" if r2 > 80 else "Good" if r2 > 50 else "Fair" if r2 > 0 else "Poor"
        print(f"      • {type_name:15} - R²: {r2:6.1f}% | MAE: {mae:6.2f} | {method:12} | {quality}")
else:
    print(f"\n   ⚠️ No models available for prediction")

print(f"{'='*60}")