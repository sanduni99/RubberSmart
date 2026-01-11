import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print ("="*60)
print("DATA EXPLORATION")
print ("="*60)

tables_query = """
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
"""
tables_df = pd.read_sql(tables_query, engine)
print(f"Found {len(tables_df)} tables in the database.")
for table_name in tables_df['table_name']:
    print("-"*60)
    print(f"Table: {table_name}")
    df = pd.read_sql(f'SELECT * FROM "{table_name}" LIMIT 5', engine)
    print(df)
    
    print(f"\n Total rows: {len(df)}")
    print(f" Columns: {list(df.columns)}")
    print("\n🔍 First 5 rows:")
    print(df.head())
    
    print("\n❓ Null values:")
    null_counts = df.isnull().sum()
    if null_counts.sum() > 0:
        print(null_counts[null_counts > 0])
    else:
        print("   ✅ No null values")
        
        print("\n📊 Data types:")
    print(df.dtypes)
    
    print("-"*60)
    
print(" Exploration complete!")
    
    