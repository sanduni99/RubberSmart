import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX
import pickle
import warnings
import os
from dateutil.relativedelta import relativedelta
warnings.filterwarnings('ignore')

DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print("=" * 60)
print("TRAINING YIELD PREDICTION MODEL (FIXED)")
print("=" * 60)


print("\n Loading production data...")
df = pd.read_sql('SELECT * FROM production ORDER BY "Year", id', engine)
print(f"   Total records: {len(df)}")

print("\n Preparing data...")
df['Date'] = pd.to_datetime(
    df['Year'].astype(str) + '-' + df['Month'], format='%Y-%B'
)
df = df.sort_values('Date').set_index('Date')

TARGET_COL = 'Total_MT'
if TARGET_COL not in df.columns:
    TARGET_COL = 'Total (MT)'

y = df[TARGET_COL].dropna()

print(f"   Date range : {y.index.min().strftime('%B %Y')} → {y.index.max().strftime('%B %Y')}")
print(f"   Records    : {len(y)}")
print(f"   Mean       : {y.mean():.2f} MT")
print(f"   Std        : {y.std():.2f} MT")
print(f"   Min        : {y.min():.2f} MT")
print(f"   Max        : {y.max():.2f} MT")
print(f"   Trend/month: {(y.iloc[-1] - y.iloc[0]) / len(y):.2f} MT")


train_size = int(len(y) * 0.8)
train, test = y[:train_size], y[train_size:]

print(f"\n Train/Test split:")
print(f"   Training : {len(train)} records "
      f"({train.index.min().strftime('%b %Y')} → {train.index.max().strftime('%b %Y')})")
print(f"   Testing  : {len(test)} records "
      f"({test.index.min().strftime('%b %Y')} → {test.index.max().strftime('%b %Y')})")

results = {}


print("\n" + "─" * 60)
print(" Model 1: Linear Trend Regression")
print("─" * 60)

try:
    t_train = np.arange(len(train)).reshape(-1, 1)
    t_test  = np.arange(len(train), len(train) + len(test)).reshape(-1, 1)

    lr = LinearRegression()
    lr.fit(t_train, train.values)
    lr_preds = lr.predict(t_test)

    lr_mae  = mean_absolute_error(test, lr_preds)
    lr_r2   = r2_score(test, lr_preds)
    lr_rmse = np.sqrt(mean_squared_error(test, lr_preds))

    print(f"   Slope (MT/month) : {lr.coef_[0]:.4f}")
    print(f"   Intercept        : {lr.intercept_:.2f}")
    print(f"   MAE  : {lr_mae:.2f} MT")
    print(f"   RMSE : {lr_rmse:.2f} MT")
    print(f"   R²   : {lr_r2:.4f} ({lr_r2*100:.2f}%)")

    results['LinearTrend'] = {
        'model': lr, 'type': 'linear',
        'mae': lr_mae, 'rmse': lr_rmse, 'r2': lr_r2,
        'train_len': len(train), 'total_len': len(y),
    }
    print("    Linear Trend trained successfully")
except Exception as e:
    print(f"    Linear Trend failed: {e}")


print("\n" + "─" * 60)
print(" Model 2: Holt-Winters Exponential Smoothing (trend + seasonal)")
print("─" * 60)

try:

    if len(train) >= 24:
        hw = ExponentialSmoothing(
            train,
            trend='add',
            seasonal='add',       
            seasonal_periods=12,  
            initialization_method='estimated'
        )
        hw_fit  = hw.fit(optimized=True)
        hw_preds = hw_fit.forecast(steps=len(test))

        hw_mae  = mean_absolute_error(test, hw_preds)
        hw_r2   = r2_score(test, hw_preds)
        hw_rmse = np.sqrt(mean_squared_error(test, hw_preds))

        print(f"   Smoothing level (α) : {hw_fit.params.get('smoothing_level', 'N/A'):.4f}")
        print(f"   Smoothing trend (β) : {hw_fit.params.get('smoothing_trend', 'N/A'):.4f}")
        print(f"   MAE  : {hw_mae:.2f} MT")
        print(f"   RMSE : {hw_rmse:.2f} MT")
        print(f"   R²   : {hw_r2:.4f} ({hw_r2*100:.2f}%)")

        results['HoltWinters'] = {
            'model': hw_fit, 'type': 'holtwinters',
            'mae': hw_mae, 'rmse': hw_rmse, 'r2': hw_r2,
        }
        print("    Holt-Winters trained successfully")
    else:
        print(f"   Skipped — need >= 24 training records for seasonal model (have {len(train)})")
except Exception as e:
    print(f"    Holt-Winters failed: {e}")


print("\n" + "─" * 60)
print(" Model 3: SARIMA(1,1,1)(1,1,0,12) — with seasonal terms")
print("─" * 60)

try:
    if len(train) >= 24:
        sarima = SARIMAX(
            train,
            order=(1, 1, 1),           
            seasonal_order=(1, 1, 0, 12) 
        )
        sarima_fit  = sarima.fit(disp=False)
        sarima_preds = sarima_fit.forecast(steps=len(test))

        sarima_mae  = mean_absolute_error(test, sarima_preds)
        sarima_r2   = r2_score(test, sarima_preds)
        sarima_rmse = np.sqrt(mean_squared_error(test, sarima_preds))

        print(f"   AIC  : {sarima_fit.aic:.2f}")
        print(f"   MAE  : {sarima_mae:.2f} MT")
        print(f"   RMSE : {sarima_rmse:.2f} MT")
        print(f"   R²   : {sarima_r2:.4f} ({sarima_r2*100:.2f}%)")

        results['SARIMA'] = {
            'model': sarima_fit, 'type': 'sarima',
            'mae': sarima_mae, 'rmse': sarima_rmse, 'r2': sarima_r2,
        }
        print("    SARIMA trained successfully")
    else:
        print(f"   Skipped — need >= 24 training records for SARIMA (have {len(train)})")
except Exception as e:
    print(f"    SARIMA failed: {e}")


print("\n" + "=" * 60)
print(" MODEL COMPARISON")
print("=" * 60)
print(f"{'Model':<20} {'MAE':>10} {'RMSE':>10} {'R²':>10}")
print("─" * 52)
for name, info in sorted(results.items(), key=lambda x: x[1]['mae']):
    print(f"{name:<20} {info['mae']:>10.2f} {info['rmse']:>10.2f} {info['r2']:>10.4f}")


sorted_results = sorted(results.items(), key=lambda x: x[1]['mae'])
best_name, best_info = None, None

for name, info in sorted_results:
    if info['r2'] >= 0:
        best_name = name
        best_info = info
        print(f"\n Winner: {name} (MAE: {info['mae']:.2f} MT, R²: {info['r2']:.4f})")
        break

if best_name is None:
    best_name, best_info = max(results.items(), key=lambda x: x[1]['r2'])
    print(f"\n WARNING: All models have negative R². Using least bad: {best_name}")
    print(f"   This indicates the data may need more features (weather, seasonal dummies)")

best_model = best_info['model']
best_type  = best_info['type']
mae   = best_info['mae']
rmse  = best_info['rmse']
r2    = best_info['r2']


try:
    if best_type == 'linear':
        t_test = np.arange(best_info['train_len'],
                           best_info['train_len'] + len(test)).reshape(-1, 1)
        winner_preds = best_model.predict(t_test)
    else:
        winner_preds = best_model.forecast(steps=len(test))
    mape = float(np.mean(np.abs((test.values - np.array(winner_preds)) / test.values)) * 100)
except Exception:
    mape = 0.0

naive_mae = mean_absolute_error(test, [train.iloc[-1]] * len(test))
improvement = ((naive_mae - mae) / naive_mae) * 100 if naive_mae > 0 else 0

print(f"\n Performance vs naive baseline:")
print(f"   Naive (last-value) MAE : {naive_mae:.2f} MT")
print(f"   {best_name} MAE        : {mae:.2f} MT")
print(f"   Improvement            : {improvement:.1f}%")
print(f"   MAPE                   : {mape:.2f}%")


print("\n Saving model...")
save_dir   = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
model_path = os.path.join(save_dir, 'yield_prediction_model.pkl')
info_path  = os.path.join(save_dir, 'yield_model_info.pkl')

if best_type == 'linear':
    model_bundle = {'model': best_model, 'type': 'linear', 'train_len': len(y)}
else:
    print(f"   Retraining {best_name} on full dataset...")
    if best_type == 'holtwinters':
        full_hw = ExponentialSmoothing(
            y, trend='add', seasonal='add', seasonal_periods=12,
            initialization_method='estimated'
        )
        model_bundle = full_hw.fit(optimized=True)
    else:
        full_sarima = SARIMAX(y, order=(1, 1, 1), seasonal_order=(1, 1, 0, 12))
        model_bundle = full_sarima.fit(disp=False)

with open(model_path, 'wb') as f:
    pickle.dump(model_bundle, f)

model_info = {
    'model_name': best_name,
    'model_type': best_type,
    'mae': float(mae),
    'rmse': float(rmse),
    'r2': float(r2),
    'mape': float(mape),
    'accuracy': float(r2 * 100),
    'train_size': len(train),
    'test_size': len(test),
    'total_size': len(y),
    'improvement_over_baseline': float(improvement),
    'last_actual_value': float(y.iloc[-1]),
    'last_actual_date': str(y.index[-1]),
    'monthly_trend': float((y.iloc[-1] - y.iloc[0]) / len(y)),
}

with open(info_path, 'wb') as f:
    pickle.dump(model_info, f)

print(f"    Model saved : {model_path}")
print(f"    Info saved  : {info_path}")


print("\n Preview — Next 12 months forecast:")
print("─" * 40)
last_date = y.index.max()

for i in range(1, 13):
    future_date = last_date + relativedelta(months=i)
    if best_type == 'linear':
        t_future = np.array([[len(y) + i - 1]])
        pred = float(best_model.predict(t_future)[0])
    else:
        pred = float(model_bundle.forecast(steps=i).iloc[-1])
    print(f"   {future_date.strftime('%B %Y')}: {pred:,.2f} MT")

print("\n" + "=" * 60)
print(" TRAINING COMPLETE!")
print("=" * 60)
print(f"   Best Model : {best_name}")
print(f"   R² Score   : {r2:.4f} ({r2*100:.2f}%)")
print(f"   MAE        : {mae:.2f} MT")
print(f"   RMSE       : {rmse:.2f} MT")
print(f"   MAPE       : {mape:.2f}%")
print(f"   vs Baseline: {improvement:.1f}% better")
print("=" * 60)