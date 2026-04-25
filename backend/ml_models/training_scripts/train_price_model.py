import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from dateutil.relativedelta import relativedelta
import pickle
import warnings
import os
import json
warnings.filterwarnings('ignore')
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print("="*60)
print("FUTURE PRICE PREDICTION MODEL (2024-2030)")

print("="*60)


print("\n Loading price data...")
df = pd.read_sql("SELECT * FROM prices ORDER BY \"Year\", id", engine)
print(f"   Total records: {len(df)}")


print("\n Preparing data...")
df['Year'] = df['Year'].astype(float).astype(int)
df['Month'] = df['Month'].astype(str).str.strip()
df = df[df['Year'] >= 1900]


df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'], format='%Y-%B', errors='coerce')
df = df.dropna(subset=['Date'])
df = df.sort_values('Date')
df.set_index('Date', inplace=True)


y = df['Price per Liter (LKR)']
y = y.dropna()

current_price = y.iloc[-1]
last_date = y.index[-1]

print(f"\n CURRENT MARKET (Last data point):")
print(f"   Date: {last_date.strftime('%B %Y')}")
print(f"   Price: {current_price:.2f} LKR")

print(f"\n HISTORICAL TREND ANALYSIS FOR LONG-TERM FORECASTING:")

periods = {
    "Recent (1 year)": 12,
    "Short-term (3 years)": 36,
    "Medium-term (5 years)": 60,
    "Long-term (10 years)": 120,
    "Very long-term (20 years)": min(240, len(y)-1)
}

growth_rates = {}
for period_name, months in periods.items():
    if len(y) >= months + 1:
        start_price = y.iloc[-months-1]
        end_price = y.iloc[-1]
        total_growth = ((end_price - start_price) / start_price) * 100
        annual_growth = total_growth / (months / 12)
        growth_rates[period_name] = annual_growth
        print(f"   {period_name}: {annual_growth:.2f}% annual")


weights = {
    "Recent (1 year)": 0.10,      
    "Short-term (3 years)": 0.20,  
    "Medium-term (5 years)": 0.30, 
    "Long-term (10 years)": 0.25,  
    "Very long-term (20 years)": 0.15  
}


available_weights = {k: v for k, v in weights.items() if k in growth_rates}
if available_weights:
    total_weight = sum(available_weights.values())
    normalized_weights = {k: v/total_weight for k, v in available_weights.items()}
    
    weighted_growth = sum(growth_rates[k] * normalized_weights[k] for k in available_weights.keys())
else:

    weighted_growth = 2.0

print(f"\n Selected long-term growth rate: {weighted_growth:.2f}% annual")

try:
    choice = input("   Select option (1-4): ").strip()
    
    if choice == '1':
        years_to_forecast = 3
    elif choice == '2':
        years_to_forecast = 5
    elif choice == '3':
        years_to_forecast = 7
    elif choice == '4':
        custom_years = int(input("   Enter number of years to forecast: "))
        years_to_forecast = min(custom_years, 20) 
    else:
        years_to_forecast = 5  # Default
        
except:
    years_to_forecast = 5  

total_months = years_to_forecast * 12

print(f"\n GENERATING {years_to_forecast}-YEAR FORECAST ({total_months} months)...")


if years_to_forecast > 10:

    adjusted_growth = weighted_growth * 0.7 
    print(f"   Note: Adjusted growth to {adjusted_growth:.2f}% for long-term sustainability")
else:
    adjusted_growth = weighted_growth

monthly_growth_rate = (1 + adjusted_growth/100) ** (1/12)


all_predictions = []
json_predictions = []

for month_offset in range(1, total_months + 1):
    future_date = last_date + relativedelta(months=month_offset)
    

    base_price = current_price * (monthly_growth_rate ** month_offset)
    

    cycle_period = 84  
    cycle_variation = 0.03 * np.sin(2 * np.pi * month_offset / cycle_period)
    

    month_num = future_date.month
    seasonal_factor = 1.0
    if month_num in [1, 2, 11, 12]: 
        seasonal_factor = 1 + 0.02
    elif month_num in [6, 7, 8]:  
        seasonal_factor = 1 - 0.015
    

    predicted_price = base_price * (1 + cycle_variation) * seasonal_factor
    

    years_ahead = month_offset / 12
    if years_ahead <= 2:
        ci_multiplier = 0.08  
        confidence = "High"
    elif years_ahead <= 5:
        ci_multiplier = 0.12  
        confidence = "Moderate"
    elif years_ahead <= 10:
        ci_multiplier = 0.18  
        confidence = "Low"
    else:
        ci_multiplier = 0.25  
        confidence = "Very Low"
    
    lower_bound = predicted_price * (1 - ci_multiplier)
    upper_bound = predicted_price * (1 + ci_multiplier)
    

    historical_min = y.min()
    historical_max = y.max()
    

    future_max = historical_max * (1 + (years_ahead * 0.03))  
    lower_bound = max(lower_bound, historical_min * 0.9)
    upper_bound = min(upper_bound, future_max)
    
    prediction_data = {
        'date': future_date.strftime('%Y-%m-%d'),
        'month': future_date.strftime('%B'),
        'year': int(future_date.year),
        'quarter': f"Q{(future_date.month-1)//3 + 1}",
        'predicted_price': round(predicted_price, 2),
        'lower_bound': round(lower_bound, 2),
        'upper_bound': round(upper_bound, 2),
        'confidence_level': confidence,
        'years_ahead': round(years_ahead, 1)
    }
    
    all_predictions.append(prediction_data)
    

    json_predictions.append({
        'month': future_date.strftime('%B'),
        'year': int(future_date.year),
        'predicted_price_lkr': round(predicted_price, 2),
        'confidence_level': confidence
    })


print(f"\n YEARLY PREDICTION SUMMARY ({last_date.year + 1}-{last_date.year + years_to_forecast}):")

yearly_summaries = {}
for pred in all_predictions:
    year = pred['year']
    if year not in yearly_summaries:
        yearly_summaries[year] = []
    yearly_summaries[year].append(pred)

for year in sorted(yearly_summaries.keys()):
    year_data = yearly_summaries[year]
    prices = [p['predicted_price'] for p in year_data]
    avg_price = np.mean(prices)
    min_price = min(prices)
    max_price = max(prices)
    
  
    jan_pred = next((p for p in year_data if p['month'] == 'January'), None)
    jul_pred = next((p for p in year_data if p['month'] == 'July'), None)
    dec_pred = next((p for p in year_data if p['month'] == 'December'), None)
    
    print(f"\n   {year}:")
    print(f"     Average: {avg_price:.2f} LKR")
    print(f"     Range: {min_price:.2f} - {max_price:.2f} LKR")
    
    if jan_pred:
        print(f"     January: {jan_pred['predicted_price']:.2f} LKR")
    if jul_pred:
        print(f"     July: {jul_pred['predicted_price']:.2f} LKR")
    if dec_pred:
        print(f"     December: {dec_pred['predicted_price']:.2f} LKR")


all_pred_prices = [p['predicted_price'] for p in all_predictions]
overall_avg = np.mean(all_pred_prices)
overall_min = min(all_pred_prices)
overall_max = max(all_pred_prices)
final_growth = ((all_pred_prices[-1] - current_price) / current_price * 100)

print(f"\n {years_to_forecast}-YEAR FORECAST SUMMARY:")
print(f"   Starting price ({last_date.strftime('%B %Y')}): {current_price:.2f} LKR")
print(f"   Ending price ({all_predictions[-1]['month']} {all_predictions[-1]['year']}): {all_pred_prices[-1]:.2f} LKR")
print(f"   Projected {years_to_forecast}-year growth: {final_growth:.2f}%")
print(f"   Total average: {overall_avg:.2f} LKR")
print(f"   Overall range: {overall_min:.2f} - {overall_max:.2f} LKR")


print(f"\n Preparing JSON output for API...")

model_info = {
    "model_type": "Long-term Trend Projection",
    "base_growth_rate": f"{weighted_growth:.2f}%",
    "adjusted_growth_rate": f"{adjusted_growth:.2f}%",
    "forecast_period": f"{years_to_forecast} years ({total_months} months)",
    "forecast_end_year": last_date.year + years_to_forecast,
    "historical_data_points": len(y),
    "data_range": f"{y.index[0].strftime('%Y-%m')} to {y.index[-1].strftime('%Y-%m')}"
}

market_context = {
    "current_market": {
        "last_price": f"{current_price:.2f} LKR",
        "last_date": last_date.strftime("%B %Y"),
        "historical_average": f"{y.mean():.2f} LKR",
        "historical_min": f"{y.min():.2f} LKR",
        "historical_max": f"{y.max():.2f} LKR"
    },
    "growth_assumptions": {
        "short_term": f"{growth_rates.get('Recent (1 year)', 'N/A'):.2f}%" if 'Recent (1 year)' in growth_rates else "N/A",
        "medium_term": f"{growth_rates.get('Medium-term (5 years)', 'N/A'):.2f}%" if 'Medium-term (5 years)' in growth_rates else "N/A",
        "long_term": f"{growth_rates.get('Long-term (10 years)', 'N/A'):.2f}%" if 'Long-term (10 years)' in growth_rates else "N/A"
    },
    "market_outlook": f"Projected {adjusted_growth:.2f}% annual growth over {years_to_forecast} years",
    "uncertainty_note": "Longer-term forecasts have higher uncertainty",
    "recommendations": [
        "Monitor actual prices quarterly",
        "Update forecasts annually with new data",
        "Consider external factors (global prices, exchange rates)"
    ]
}


json_output = {
    "metadata": {
        "generated_date": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
        "version": "2.0",
        "forecast_type": "long_term"
    },
    "predictions": json_predictions,
    "model_info": model_info,
    "market_context": market_context,
    "summary_statistics": {
        "starting_price": current_price,
        "ending_price": all_pred_prices[-1],
        "total_growth_percentage": round(final_growth, 2),
        "average_price": round(overall_avg, 2),
        "price_range": {
            "min": round(overall_min, 2),
            "max": round(overall_max, 2)
        },
        "yearly_averages": {year: round(np.mean([p['predicted_price'] for p in data]), 2) 
                          for year, data in yearly_summaries.items()}
    }
}


save_dir = os.path.join(os.path.dirname(__file__), '..')


current_year = last_date.year
end_year = last_date.year + years_to_forecast
json_filename = f"price_predictions_{current_year}_{end_year}.json"
json_path = os.path.join(save_dir, json_filename)

with open(json_path, 'w') as f:
    json.dump(json_output, f, indent=2)

print(f"   ✓ JSON saved: {json_path}")


csv_filename = f"detailed_price_predictions_{current_year}_{end_year}.csv"
csv_path = os.path.join(save_dir, csv_filename)

df_predictions = pd.DataFrame(all_predictions)
df_predictions.to_csv(csv_path, index=False)
print(f"   ✓ CSV saved: {csv_path}")


pkl_path = os.path.join(save_dir, 'future_price_predictions.pkl')
with open(pkl_path, 'wb') as f:
    pickle.dump({
        'detailed_predictions': all_predictions,
        'json_predictions': json_predictions,
        'model_info': model_info
    }, f)
print(f"   ✓ Pickle saved: {pkl_path}")


print(f"\n SAMPLE PREDICTIONS (first 6 months):")
sample = json_output['predictions'][:6]
print(json.dumps({"predictions": sample}, indent=2))

print(f"\n MODEL CHARACTERISTICS:")
print(f"   • Forecast horizon: {years_to_forecast} years ({total_months} months)")
print(f"   • Growth rate: {adjusted_growth:.2f}% annual")
print(f"   • Includes: Seasonal patterns + Business cycles")
print(f"   • Confidence: Decreases with forecast horizon")
print(f"   • Data points: {len(json_predictions)} monthly predictions")

print(f"\n BUSINESS APPLICATION:")
print(f"   • Use for: Long-term planning, investment decisions")
print(f"   • Best for: {years_to_forecast}-year strategic planning")
print(f"   • Update: Recommended annually or when market conditions change")

print("\n" + "="*60)
print(f" {years_to_forecast}-YEAR PRICE FORECAST COMPLETE!")
print("="*60)


print(f"\n QUICK ACCESS:")
print(f"   JSON API data: {json_path}")
print(f"   Detailed data: {csv_path}")
print(f"   Years covered: {current_year+1} to {end_year}")