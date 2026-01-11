import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from statsmodels.tsa.arima.model import ARIMA
import pickle
import warnings
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

print("\n🔧 Preparing data...")

# Fix data types
df['Year'] = pd.to_numeric(df['Year'], errors='coerce')
df['Month'] = df['Month'].astype(str).str.strip()

# Remove invalid rows
df = df[
    df['Year'].notna() &
    (df['Year'] >= 1900) &
    df['Month'].notna() &
    (df['Month'] != 'None')
]

# Convert Year to int AFTER cleaning
df['Year'] = df['Year'].astype(int)

# Create Date safely
df['Date'] = pd.to_datetime(
    df['Year'].astype(str) + '-' + df['Month'],
    format='%Y-%B',
    errors='coerce'
)

# Drop rows where Date still failed
df = df.dropna(subset=['Date'])


df = df.sort_values('Date')
df.set_index('Date', inplace=True)
df = df.asfreq('MS')


# Use Price per Liter as target
y = df['Price per Liter (LKR)']

print(f"   Date range: {df.index.min()} to {df.index.max()}")
print(f"   Mean price: {y.mean():.2f} LKR")
print(f"   Std deviation: {y.std():.2f} LKR")

# Split data
train_size = int(len(y) * 0.8)
train, test = y[:train_size], y[train_size:]

print(f"\n✂️ Train/Test split:")
print(f"   Training: {len(train)} records")
print(f"   Testing: {len(test)} records")

# Train ARIMA model
print("\n🤖 Training ARIMA model...")
print("   Finding best parameters...")

best_aic = float('inf')
best_order = None
best_model = None

for p in range(0, 3):
    for d in range(0, 2):
        for q in range(0, 3):
            try:
                model = ARIMA(train, order=(p, d, q))
                fitted_model = model.fit()
                if fitted_model.aic < best_aic:
                    best_aic = fitted_model.aic
                    best_order = (p, d, q)
                    best_model = fitted_model
            except:
                continue

print(f"   Best ARIMA order: {best_order}")
print(f"   AIC: {best_aic:.2f}")

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

# Save model
print("\n💾 Saving model...")
with open('price_prediction_model.pkl', 'wb') as f:
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

with open('price_model_info.pkl', 'wb') as f:
    pickle.dump(model_info, f)

print("   ✅ Model saved: price_prediction_model.pkl")

# Predict next 6 months
print("\n🔮 Predicting next 6 months...")
future_predictions = best_model.forecast(steps=6)

print("\n📅 Price Predictions:")
last_date = df.index.max()
for i, pred in enumerate(future_predictions, 1):
    future_date = last_date + pd.DateOffset(months=i)
    print(f"   {future_date.strftime('%B %Y')}: {pred:.2f} LKR/L")

print("\n" + "="*60)
print("✅ PRICE MODEL TRAINING COMPLETE!")
print("="*60)