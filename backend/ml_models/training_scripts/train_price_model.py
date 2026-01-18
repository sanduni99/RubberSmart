import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from statsmodels.tsa.statespace.sarimax import SARIMAX
import pickle
import warnings
import os
warnings.filterwarnings('ignore')

DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print("="*60)
print("TRAINING PRICE PREDICTION MODEL")
print("="*60)

# Load data
print("\n📊 Loading price data...")
df = pd.read_sql("SELECT * FROM prices ORDER BY \"Year\", id", engine)
print(f"   Total records: {len(df)}")

# Prepare data
print("\n🔧 Preparing data...")
df['Year'] = df['Year'].astype(float).astype(int)
df['Month'] = df['Month'].astype(str).str.strip()
df = df[df['Year'] >= 1900]

# Create Date
df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'], format='%Y-%B', errors='coerce')
df = df.dropna(subset=['Date'])
df = df.sort_values('Date')
df.set_index('Date', inplace=True)

# Use Price per Liter as target
y = df['Price per Liter (LKR)']
y = y.dropna()

print(f"   Date range: {df.index.min()} to {df.index.max()}")
print(f"   Mean price: {y.mean():.2f} LKR")
print(f"   Std deviation: {y.std():.2f} LKR")
print(f"   Min price: {y.min():.2f} LKR")
print(f"   Max price: {y.max():.2f} LKR")

# Split data - IMPORTANT: Don't shuffle time series!
train_size = int(len(y) * 0.8)
train, test = y[:train_size], y[train_size:]

print(f"\n📊 Train/Test split:")
print(f"   Training: {len(train)} records ({y.index[0]} to {y.index[train_size-1]})")
print(f"   Testing: {len(test)} records ({y.index[train_size]} to {y.index[-1]})")

# Train SARIMA model
print("\n🤖 Training SARIMA model...")
try:
    model = SARIMAX(train, 
                    order=(1, 1, 1),
                    seasonal_order=(1, 1, 1, 12),
                    enforce_stationarity=False,
                    enforce_invertibility=False)
    best_model = model.fit(disp=False, maxiter=200)
    best_order = (1, 1, 1)
    print(f"   ✓ SARIMA order: {best_order}")
    print(f"   ✓ AIC: {best_model.aic:.2f}")
except Exception as e:
    print(f"   ⚠️ SARIMA failed: {e}")
    print(f"   ↪️ Using ARIMA instead...")
    from statsmodels.tsa.arima.model import ARIMA
    model = ARIMA(train, order=(2, 1, 2))
    best_model = model.fit()
    best_order = (2, 1, 2)

# Evaluate on TEST data
print("\n📈 Evaluating model...")
predictions = best_model.forecast(steps=len(test))

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(test, predictions)
rmse = np.sqrt(mean_squared_error(test, predictions))
r2 = r2_score(test, predictions)
mape = np.mean(np.abs((test - predictions) / test)) * 100

# Calculate baseline (naive forecast = last known value)
naive_predictions = [train.iloc[-1]] * len(test)
naive_mae = mean_absolute_error(test, naive_predictions)

print(f"\n📊 Model Performance Metrics:")
print(f"   MAE:  {mae:.2f} LKR")
print(f"   RMSE: {rmse:.2f} LKR")
print(f"   R² Score: {r2:.4f} ({r2*100:.2f}%)")
print(f"   MAPE: {mape:.2f}%")

print(f"\n🎯 Comparison with Baseline:")
print(f"   Naive MAE: {naive_mae:.2f} LKR")
print(f"   Model MAE: {mae:.2f} LKR")
improvement = ((naive_mae - mae) / naive_mae) * 100
print(f"   Improvement: {improvement:.2f}%")

print(f"\n📊 Prediction Analysis:")
print(f"   Test actual - Mean: {test.mean():.2f}, Std: {test.std():.2f}")
print(f"   Predictions - Mean: {predictions.mean():.2f}, Std: {predictions.std():.2f}")
print(f"   Price range (actual): {test.min():.2f} - {test.max():.2f} LKR")
print(f"   Price range (predicted): {predictions.min():.2f} - {predictions.max():.2f} LKR")

# WARNING: Check if model is just predicting flat line
if predictions.std() < test.std() * 0.3:
    print(f"\n   ⚠️ WARNING: Predictions show low variation!")
    print(f"   ⚠️ Model may be underfitting or data may lack seasonality")

# Save model
print("\n💾 Saving model...")
save_dir = os.path.join(os.path.dirname(__file__), '..')
model_path = os.path.join(save_dir, 'price_prediction_model.pkl')
info_path = os.path.join(save_dir, 'price_model_info.pkl')

with open(model_path, 'wb') as f:
    pickle.dump(best_model, f)

# Store REALISTIC metrics
model_info = {
    'order': best_order,
    'mae': mae,
    'rmse': rmse,
    'r2': r2,
    'mape': mape,
    'accuracy': r2 * 100,  # ← Use R² instead of (100-MAPE)
    'train_size': len(train),
    'test_size': len(test),
    'improvement_over_baseline': improvement
}

with open(info_path, 'wb') as f:
    pickle.dump(model_info, f)

print(f"   ✓ Model saved: {model_path}")

# Predict next 12 months WITHOUT artificial variation
print("\n🔮 Predicting next 12 months...")
future_predictions = best_model.forecast(steps=12)

# DON'T add artificial variation - let the model speak for itself

print("\n📅 Future Price Predictions:")
from dateutil.relativedelta import relativedelta
last_date = df.index.max()

for i, pred in enumerate(future_predictions, 1):
    future_date = last_date + relativedelta(months=i)
    print(f"   {future_date.strftime('%B %Y')}: {pred:.2f} LKR/L")

print(f"\n   Predicted range: {future_predictions.min():.2f} - {future_predictions.max():.2f} LKR")
print(f"   Predicted std: {future_predictions.std():.2f} LKR")

print("\n" + "="*60)
print("✅ PRICE MODEL TRAINING COMPLETE!")
print("="*60)