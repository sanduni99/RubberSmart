import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from statsmodels.tsa.arima.model import ARIMA
import pickle
import warnings
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

print(f"   Date range: {df.index.min()} to {df.index.max()}")
print(f"   Mean production: {y.mean():.2f} MT")
print(f"   Std deviation: {y.std():.2f} MT")

# Split data (80% train, 20% test)
train_size = int(len(y) * 0.8)
train, test = y[:train_size], y[train_size:]

print(f"\n✂️ Train/Test split:")
print(f"   Training: {len(train)} records ({train.index.min()} to {train.index.max()})")
print(f"   Testing: {len(test)} records ({test.index.min()} to {test.index.max()})")

# Train ARIMA model
print("\n🤖 Training ARIMA model...")
print("   This may take 1-2 minutes...")

# Find best ARIMA parameters (simplified)
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

# Make predictions on test set
print("\n📈 Evaluating model...")
predictions = best_model.forecast(steps=len(test))

# Calculate accuracy metrics
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(test, predictions)
rmse = np.sqrt(mean_squared_error(test, predictions))
r2 = r2_score(test, predictions)
mape = np.mean(np.abs((test - predictions) / test)) * 100

print(f"\n📊 Model Performance:")
print(f"   MAE: {mae:.2f} MT")
print(f"   RMSE: {rmse:.2f} MT")
print(f"   R² Score: {r2:.4f}")
print(f"   MAPE: {mape:.2f}%")
print(f"   Accuracy: {100 - mape:.2f}%")

# Save model
print("\n💾 Saving model...")
with open('yield_prediction_model.pkl', 'wb') as f:
    pickle.dump(best_model, f)

# Save model info
model_info = {
    'order': best_order,
    'mae': mae,
    'rmse': rmse,
    'r2': r2,
    'accuracy': 100 - mape,
    'train_size': len(train),
    'test_size': len(test)
}

with open('yield_model_info.pkl', 'wb') as f:
    pickle.dump(model_info, f)

print("   ✅ Model saved: yield_prediction_model.pkl")
print("   ✅ Info saved: yield_model_info.pkl")

# Predict next 6 months
print("\n🔮 Predicting next 6 months...")
future_predictions = best_model.forecast(steps=6)

print("\n📅 Predictions:")
last_date = df.index.max()
for i, pred in enumerate(future_predictions, 1):
    future_date = last_date + pd.DateOffset(months=i)
    print(f"   {future_date.strftime('%B %Y')}: {pred:.2f} MT")

print("\n" + "="*60)
print("✅ YIELD MODEL TRAINING COMPLETE!")
print("="*60)