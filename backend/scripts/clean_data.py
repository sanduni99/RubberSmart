import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print("="*60)
print("DATA CLEANING")
print("="*60)

# Clean Production
print("\n🧹 Cleaning: production")
prod_df = pd.read_sql("SELECT * FROM production", engine)
print(f"   Original rows: {len(prod_df)}")

prod_clean = prod_df.drop_duplicates()
prod_clean = prod_clean.dropna(how='all')
numeric_cols = prod_clean.select_dtypes(include=['float64', 'int64']).columns
prod_clean[numeric_cols] = prod_clean[numeric_cols].fillna(0)

prod_clean.to_sql('production', engine, if_exists='replace', index=False)
print(f"   Clean rows: {len(prod_clean)}")
print("   ✅ Saved to: production")

# Clean Prices
print("\n🧹 Cleaning: prices")
price_df = pd.read_sql("SELECT * FROM prices", engine)
print(f"   Original rows: {len(price_df)}")

price_clean = price_df.drop_duplicates()
price_clean = price_clean.dropna(how='all')
numeric_cols = price_clean.select_dtypes(include=['float64', 'int64']).columns
price_clean[numeric_cols] = price_clean[numeric_cols].fillna(0)

price_clean.to_sql('prices', engine, if_exists='replace', index=False)
print(f"   Clean rows: {len(price_clean)}")
print("   ✅ Saved to: prices")

print("\n✅ Data cleaning complete!")