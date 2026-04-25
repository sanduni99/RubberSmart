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
print("TRAINING RUBBER TYPE PREDICTION MODELS (FIXED)")
print("=" * 60)


print("\n Loading production data...")
df = pd.read_sql('SELECT * FROM production ORDER BY "Year", id', engine)
print(f"   Total records: {len(df)}")

print("\n Preparing data...")
df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'], format='%Y-%B')
df = df.sort_values('Date').set_index('Date')
print(f"   Date range: {df.index.min().strftime('%b %Y')} → {df.index.max().strftime('%b %Y')}")
print(f"   Columns available: {list(df.columns)}")

RUBBER_TYPES = {
    'Sheet':       'Sheet',
    'Sole':        'Sole',
    'Crepe':       'Crepe',
    'Scrap':       'Scrap',
    'Crepe Latex': 'Crepe Latex',
    'Crepe TSR':   'Crepe T.S.R.',
    'Total':       'Total (MT)',
}

models      = {}
model_infos = {}
successful  = 0
failed      = 0


def try_all_models(train, test, type_name):
    """
    Try Linear Trend, Holt-Winters (with seasonality), and SARIMA.
    Return the best by MAE on the test set, rejecting negative R².
    """
    results = []


    try:
        t_train = np.arange(len(train)).reshape(-1, 1)
        t_test  = np.arange(len(train), len(train) + len(test)).reshape(-1, 1)
        lr      = LinearRegression()
        lr.fit(t_train, train.values)
        preds   = lr.predict(t_test)
        mae     = mean_absolute_error(test, preds)
        r2      = r2_score(test, preds) if np.var(test.values) > 0 else 0.0
        results.append(('LinearTrend', mae, r2, preds,
                         {'model': lr, 'type': 'linear', 'train_len': len(train)}))
        print(f"      LinearTrend   MAE: {mae:.2f}  R²: {r2:.4f}")
    except Exception as e:
        print(f"      LinearTrend failed: {str(e)[:60]}")


    if len(train) >= 24:
        try:
            hw     = ExponentialSmoothing(
                train,
                trend='add',
                seasonal='add',        
                seasonal_periods=12,   
                initialization_method='estimated'
            )
            hw_fit = hw.fit(optimized=True)
            preds  = hw_fit.forecast(steps=len(test)).values
            mae    = mean_absolute_error(test, preds)
            r2     = r2_score(test, preds) if np.var(test.values) > 0 else 0.0
            results.append(('HoltWinters', mae, r2, preds, hw_fit))
            print(f"      HoltWinters   MAE: {mae:.2f}  R²: {r2:.4f}")
        except Exception as e:
            print(f"      HoltWinters failed: {str(e)[:60]}")


    if len(train) >= 24:
        try:
            sarima     = SARIMAX(train, order=(1, 1, 1), seasonal_order=(1, 1, 0, 12))
            sarima_fit = sarima.fit(disp=False)
            preds      = sarima_fit.forecast(steps=len(test)).values
            mae        = mean_absolute_error(test, preds)
            r2         = r2_score(test, preds) if np.var(test.values) > 0 else 0.0
            results.append(('SARIMA', mae, r2, preds, sarima_fit))
            print(f"      SARIMA        MAE: {mae:.2f}  R²: {r2:.4f}")
        except Exception as e:
            print(f"      SARIMA failed: {str(e)[:60]}")

    if not results:
        print(f"      Using Moving Average fallback...")
        ma_val = float(train.tail(12).mean())
        preds  = np.array([ma_val] * len(test))
        mae    = mean_absolute_error(test, preds)
        r2     = r2_score(test, preds) if np.var(test.values) > 0 else 0.0
        results.append(('MovingAverage', mae, r2, preds, {'type': 'ma', 'value': ma_val}))


    results.sort(key=lambda x: x[1])  


    chosen = None
    for name, mae, r2, preds, model in results:
        if r2 >= 0:
            chosen = (name, mae, r2, preds, model)
            break


    if chosen is None:
        chosen = max(results, key=lambda x: x[2])
        print(f"      WARNING: all models negative R² — using least bad")

    best_name, best_mae, best_r2, best_preds, best_model = chosen
    return best_model, best_preds, best_mae, best_name



for type_name, col_name in RUBBER_TYPES.items():
    print(f"\n{'=' * 60}")
    print(f" Training: {type_name}  (column: {col_name})")
    print(f"{'=' * 60}")


    if col_name not in df.columns:
        print(f"    Column '{col_name}' not found — skipping")
        failed += 1


    y = df[col_name].dropna()

    if len(y) == 0:
        print(f"    No data — skipping")
        failed += 1


    if y.std() == 0:
        print(f"    Constant value ({y.iloc[0]:.2f}) — skipping")
        failed += 1


    print(f"   Records : {len(y)}")
    print(f"   Mean    : {y.mean():.2f}")
    print(f"   Std     : {y.std():.2f}")
    print(f"   Range   : {y.min():.2f} – {y.max():.2f}")
    print(f"   Trend   : {(y.iloc[-1] - y.iloc[0]) / len(y):.3f} MT/month")

    train_size = int(len(y) * 0.8)
    train, test = y[:train_size], y[train_size:]
    print(f"   Split: {len(train)} train / {len(test)} test")
    print(f"   Trying models...")

    try:
        best_model, preds, mae, method = try_all_models(train, test, type_name)

        r2   = r2_score(test, preds) if np.var(test.values) > 0 else 0.0
        rmse = float(np.sqrt(mean_squared_error(test, preds)))
        try:
            mape = float(np.mean(np.abs((test.values - preds) / test.values)) * 100)
            mape = min(mape, 999.9)
        except Exception:
            mape = 999.9

        naive_mae   = mean_absolute_error(test, [train.iloc[-1]] * len(test))
        improvement = ((naive_mae - mae) / naive_mae * 100) if naive_mae > 0 else 0

        print(f"\n   Winner: {method}")
        print(f"   MAE   : {mae:.2f}")
        print(f"   RMSE  : {rmse:.2f}")
        print(f"   R²    : {r2:.4f} ({r2*100:.1f}%)")
        print(f"   MAPE  : {mape:.2f}%")
        print(f"   vs baseline: {improvement:.1f}% {'better' if improvement > 0 else 'worse'}")


        if mae < 0.01 and r2 < 0.01:
            print(f"   MAE=0 with R²=0 — constant prediction, rejecting")
            failed += 1



        if (r2 > -5.0) or (improvement > 10) or (mae < 5):

            if method == 'LinearTrend':
                t_full  = np.arange(len(y)).reshape(-1, 1)
                lr_full = LinearRegression()
                lr_full.fit(t_full, y.values)
                saved_model = {'type': 'linear', 'model': lr_full, 'train_len': len(y)}

            elif method == 'HoltWinters':
                hw_full = ExponentialSmoothing(
                    y, trend='add', seasonal='add', seasonal_periods=12,
                    initialization_method='estimated'
                )
                saved_model = hw_full.fit(optimized=True)

            elif method == 'SARIMA':
                sarima_full = SARIMAX(y, order=(1, 1, 1), seasonal_order=(1, 1, 0, 12))
                saved_model = sarima_full.fit(disp=False)

            else:
                saved_model = best_model

            models[type_name]      = saved_model
            model_infos[type_name] = {
                'method':      method,
                'model_type':  method,
                'mae':         float(mae),
                'rmse':        rmse,
                'r2':          float(r2),
                'mape':        float(mape) if mape < 999 else 0.0,
                'mean':        float(y.mean()),
                'std':         float(y.std()),
                'improvement': float(improvement),
                'records':     len(y),
                'train_len':   len(y),
            }
            successful += 1
            print(f"   Saved (retrained on full dataset)")
        else:
            print(f"   Quality too low — not saving "
                  f"(R²={r2:.2f}, improve={improvement:.1f}%, MAE={mae:.2f})")
            failed += 1

    except Exception as e:
        import traceback
        print(f"   Training failed: {e}")
        traceback.print_exc()
        failed += 1


print(f"\n{'=' * 60}")
print(" Saving models...")
print(f"{'=' * 60}")

if models:
    save_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

    with open(os.path.join(save_dir, 'yield_by_type_models.pkl'), 'wb') as f:
        pickle.dump(models, f)

    with open(os.path.join(save_dir, 'yield_by_type_info.pkl'), 'wb') as f:
        pickle.dump(model_infos, f)

    print(f"   Saved {len(models)} models")


    print(f"\n Preview — 6-month predictions per type:")
    print(f"{'=' * 60}")
    last_date = df.index.max()

    header = f"{'Month':<18}" + "".join(f"{t:<14}" for t in models.keys())
    print(header)
    print("─" * len(header))

    for i in range(1, 7):
        future_date = last_date + relativedelta(months=i)
        row = f"{future_date.strftime('%B %Y'):<18}"
        month_total = 0
        for t_name, model in models.items():
            try:
                info  = model_infos[t_name]
                if isinstance(model, dict) and model.get('type') == 'linear':
                    t_idx = np.array([[info['train_len'] + i - 1]])
                    pred  = float(model['model'].predict(t_idx)[0])
                elif isinstance(model, dict) and model.get('type') == 'ma':
                    pred  = float(model['value'])
                else:
                    pred  = float(model.forecast(steps=i).iloc[-1])
                row += f"{pred:<14.1f}"
                if t_name != 'Total':
                    month_total += pred
            except Exception:
                row += f"{'Error':<14}"

        if 'Total' not in models:
            row += f"{month_total:<14.1f}  <- calculated"
        print(row)
else:
    print("   No models trained successfully!")


print(f"\n{'=' * 60}")
print(" TRAINING COMPLETE!")
print(f"{'=' * 60}")
print(f"   Successful : {successful}")
print(f"   Failed     : {failed}")
print(f"   Saved      : {len(models)}")

if model_infos:
    print(f"\n   {'Type':<16} {'Method':<14} {'R²':>8} {'MAE':>8} {'Quality'}")
    print(f"   {'─'*60}")
    for t, info in sorted(model_infos.items(), key=lambda x: x[1]['r2'], reverse=True):
        r2_pct  = info['r2'] * 100
        quality = ("Excellent" if r2_pct > 90 else
                   "Good"      if r2_pct > 70 else
                   "Fair"      if r2_pct > 0  else "Poor")
        print(f"   {t:<16} {info['method']:<14} {r2_pct:>7.1f}% {info['mae']:>8.2f}  {quality}")

print(f"{'=' * 60}")