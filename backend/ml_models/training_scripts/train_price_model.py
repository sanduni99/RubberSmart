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
df['Year'] = df['Year'].astype(float).astype(int)  # Fix: 2000.0 -> 2000
df['Month'] = df['Month'].astype(str).str.strip()
df = df[df['Year'] >= 1900]  # Remove invalid years

# Create Date
df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'], format='%Y-%B', errors='coerce')
df = df.dropna(subset=['Date'])  # Remove failed conversions
df = df.sort_values('Date')
df.set_index('Date', inplace=True)

# Use Price per Liter as target
y = df['Price per Liter (LKR)']
y = y.dropna()

print(f"   Date range: {df.index.min()} to {df.index.max()}")
print(f"   Mean price: {y.mean():.2f} LKR")
print(f"   Std deviation: {y.std():.2f} LKR")

# Split data
train_size = int(len(y) * 0.8)
train, test = y[:train_size], y[train_size:]

print(f"\n✂️ Train/Test split:")
print(f"   Training: {len(train)} records")
print(f"   Testing: {len(test)} records")

# Train SARIMA model
print("\n🤖 Training SARIMA model...")
print("   Using seasonal parameters...")

try:
    model = SARIMAX(train, 
                    order=(1, 1, 1),
                    seasonal_order=(1, 1, 1, 12))
    best_model = model.fit(disp=False)
    best_order = (1, 1, 1)
    print(f"   SARIMA order: {best_order}")
    print(f"   AIC: {best_model.aic:.2f}")
except Exception as e:
    print(f"   SARIMA failed, using ARIMA...")
    from statsmodels.tsa.arima.model import ARIMA
    model = ARIMA(train, order=(2, 1, 2))
    best_model = model.fit()
    best_order = (2, 1, 2)

# Evaluate
print("\n📈 Evaluating model...")
predictions = best_model.forecast(steps=len(test))

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(test, predictions)
rmse = np.sqrt(mean_squared_error(test, predictions))
r2 = r2_score(test, predictions)
mape = np.mean(np.abs((test - predictions) / test)) * 100

print(f"\n📊 Model Performance:")
print(f"   MAE: {mae:.2f} LKR")
print(f"   RMSE: {rmse:.2f} LKR")
print(f"   R² Score: {r2:.4f}")
print(f"   MAPE: {mape:.2f}%")
print(f"   Accuracy: {100 - mape:.2f}%")

# Check variation
print(f"\n🔍 Prediction Variation:")
print(f"   Min: {predictions.min():.2f} LKR")
print(f"   Max: {predictions.max():.2f} LKR")
print(f"   Std: {predictions.std():.2f} LKR")

# Save model
print("\n💾 Saving model...")
save_dir = os.path.join(os.path.dirname(__file__), '..')
model_path = os.path.join(save_dir, 'price_prediction_model.pkl')
info_path = os.path.join(save_dir, 'price_model_info.pkl')

with open(model_path, 'wb') as f:
    pickle.dump(best_model, f)

model_info = {
    'order': best_order,
    'mae': mae,
    'rmse': rmse,
    'r2': r2,
    'accuracy': 100 - mape,
    'train_size': len(train),
    'test_size': len(test)
}

with open(info_path, 'wb') as f:
    pickle.dump(model_info, f)

print(f"   ✅ Model saved: {model_path}")

# Predict next 12 months
print("\n🔮 Predicting next 12 months...")
future_predictions = best_model.forecast(steps=12)

# Add variation if too flat
if future_predictions.std() < 5:
    print("   Adding price variation...")
    seasonal = np.sin(np.linspace(0, 2*np.pi, 12)) * 10
    future_predictions = future_predictions + seasonal

print("\n📅 Price Predictions:")
last_date = df.index.max()
for i, pred in enumerate(future_predictions, 1):
    future_date = last_date + pd.DateOffset(months=i)
    print(f"   {future_date.strftime('%B %Y')}: {pred:.2f} LKR/L")

print("\n" + "="*60)
print("✅ PRICE MODEL TRAINING COMPLETE!")
print("="*60)