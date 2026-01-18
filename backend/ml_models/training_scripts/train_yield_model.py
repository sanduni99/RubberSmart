import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.arima.model import ARIMA
import pickle
import warnings
import os
warnings.filterwarnings('ignore')

# Database connection
DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print("="*60)
print("TRAINING YIELD PREDICTION MODEL")
print("="*60)

# Load data
print("\n📊 Loading production data...")
df = pd.read_sql("SELECT * FROM production ORDER BY \"Year\", id", engine)
print(f"   Total records: {len(df)}")

# Prepare data
print("\n🔧 Preparing data...")
df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'], format='%Y-%B')
df = df.sort_values('Date')
df.set_index('Date', inplace=True)

# Use Total (MT) as target
y = df['Total (MT)']
y = y.dropna()

print(f"   Date range: {df.index.min()} to {df.index.max()}")
print(f"   Mean production: {y.mean():.2f} MT")
print(f"   Std deviation: {y.std():.2f} MT")
print(f"   Min production: {y.min():.2f} MT")
print(f"   Max production: {y.max():.2f} MT")

# Split data (80% train, 20% test) - NO SHUFFLE for time series!
train_size = int(len(y) * 0.8)
train, test = y[:train_size], y[train_size:]

print(f"\n✂️ Train/Test split:")
print(f"   Training: {len(train)} records ({train.index.min()} to {train.index.max()})")
print(f"   Testing: {len(test)} records ({test.index.min()} to {test.index.max()})")

# Train SARIMA model (seasonal)
print("\n🤖 Training SARIMA model...")
print("   Using seasonal parameters to capture monthly patterns...")

try:
    # SARIMA with monthly seasonality
    model = SARIMAX(train, 
                    order=(1, 1, 1),              # ARIMA order
                    seasonal_order=(1, 1, 1, 12),  # Seasonal: 12 months
                    enforce_stationarity=False,
                    enforce_invertibility=False)
    best_model = model.fit(disp=False, maxiter=200)
    best_order = (1, 1, 1)
    seasonal_order = (1, 1, 1, 12)
    print(f"   ✓ SARIMA order: {best_order}")
    print(f"   ✓ Seasonal order: {seasonal_order}")
    print(f"   ✓ AIC: {best_model.aic:.2f}")
except Exception as e:
    print(f"   ⚠️ SARIMA failed: {str(e)}")
    print(f"   ↪️ Falling back to ARIMA(2,1,2)...")
    model = ARIMA(train, order=(2, 1, 2))
    best_model = model.fit()
    best_order = (2, 1, 2)
    seasonal_order = None

# Make predictions on test set
print("\n📈 Evaluating model on test data...")
predictions = best_model.forecast(steps=len(test))

# Calculate accuracy metrics
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(test, predictions)
rmse = np.sqrt(mean_squared_error(test, predictions))
r2 = r2_score(test, predictions)
mape = np.mean(np.abs((test - predictions) / test)) * 100

# Baseline comparison (naive forecast = last value)
naive_predictions = [train.iloc[-1]] * len(test)
naive_mae = mean_absolute_error(test, naive_predictions)

print(f"\n📊 Model Performance Metrics:")
print(f"   MAE:  {mae:.2f} MT")
print(f"   RMSE: {rmse:.2f} MT")
print(f"   R² Score: {r2:.4f} ({r2*100:.2f}%)")
print(f"   MAPE: {mape:.2f}%")

print(f"\n🎯 Comparison with Baseline:")
print(f"   Naive forecast MAE: {naive_mae:.2f} MT")
print(f"   Model MAE: {mae:.2f} MT")
improvement = ((naive_mae - mae) / naive_mae) * 100
print(f"   Improvement over baseline: {improvement:.2f}%")

# Diagnostic analysis
print(f"\n🔍 Prediction Analysis:")
print(f"   Test actual   - Mean: {test.mean():.2f} MT, Std: {test.std():.2f} MT")
print(f"   Predictions   - Mean: {predictions.mean():.2f} MT, Std: {predictions.std():.2f} MT")
print(f"   Actual range:    {test.min():.2f} - {test.max():.2f} MT")
print(f"   Predicted range: {predictions.min():.2f} - {predictions.max():.2f} MT")

# WARNING: Check if model is underfitting
if predictions.std() < test.std() * 0.3:
    print(f"\n   ⚠️ WARNING: Predictions show very low variation!")
    print(f"   ⚠️ Model may be underfitting or predicting near-constant values")
    print(f"   ⚠️ Consider: More features, different model, or data issues")
else:
    print(f"\n   ✓ Predictions show reasonable variation")

# DO NOT ADD ARTIFICIAL VARIATION - Let metrics reflect true performance

# Save model
print("\n💾 Saving model...")
save_dir = os.path.join(os.path.dirname(__file__), '..')
model_path = os.path.join(save_dir, 'yield_prediction_model.pkl')
info_path = os.path.join(save_dir, 'yield_model_info.pkl')

with open(model_path, 'wb') as f:
    pickle.dump(best_model, f)

# Save HONEST model info with realistic metrics
model_info = {
    'order': best_order,
    'seasonal_order': seasonal_order,
    'mae': mae,
    'rmse': rmse,
    'r2': r2,
    'mape': mape,
    'accuracy': r2 * 100,  # ← Use R² as accuracy, not (100-MAPE)
    'train_size': len(train),
    'test_size': len(test),
    'improvement_over_baseline': improvement,
    'test_mean': float(test.mean()),
    'test_std': float(test.std())
}

with open(info_path, 'wb') as f:
    pickle.dump(model_info, f)

print(f"   ✅ Model saved: {model_path}")
print(f"   ✅ Info saved: {info_path}")

# Predict next 12 months WITHOUT artificial manipulation
print("\n🔮 Predicting next 12 months...")
future_predictions = best_model.forecast(steps=12)

# DO NOT add artificial seasonality - the model should learn this naturally
# If predictions are flat, that's what the model actually predicts!

print("\n📅 Future Yield Predictions:")
from dateutil.relativedelta import relativedelta
last_date = df.index.max()

for i, pred in enumerate(future_predictions, 1):
    future_date = last_date + relativedelta(months=i)
    print(f"   {future_date.strftime('%B %Y')}: {pred:.2f} MT")

print(f"\n   Future predicted range: {future_predictions.min():.2f} - {future_predictions.max():.2f} MT")
print(f"   Future predicted std: {future_predictions.std():.2f} MT")

if future_predictions.std() < 50:
    print(f"\n   ℹ️ Note: Future predictions show low variation")
    print(f"   ℹ️ This suggests stable production or limited seasonal patterns in data")

print("\n" + "="*60)
print("✅ YIELD MODEL TRAINING COMPLETE!")
print("="*60)
print("\nℹ️  Model Interpretation:")
print(f"   • R² score represents how well the model explains variance")
print(f"   • MAE shows average prediction error in MT")
print(f"   • If predictions are flat, consider adding external features")
print(f"     (weather, prices, rainfall, etc.)")
print("="*60)