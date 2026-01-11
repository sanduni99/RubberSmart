import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print("="*60)
print("DATA CLEANING")
print("="*60)

tables = ['sheet1_clean']
for table in tables:
    print(f"\n📊 Verifying: {table}")
    print("-"*60)
    
    try:
        df = pd.read_sql(f"SELECT * FROM {table}", engine)
        

        print(f"✓ Total records: {len(df)}")
        

        nulls = df.isnull().sum().sum()
        if nulls == 0:
            print(f" No null values")
        else:
            print(f" Found {nulls} null values")
        

        dupes = df.duplicated().sum()
        if dupes == 0:
            print(f" No duplicates")
        else:
            print(f" Found {dupes} duplicates")
        
        if 'year' in df.columns:
            print(f" Year range: {df['year'].min()} - {df['year'].max()}")
        
        print(f"\n📈 Statistics:")
        print(df.describe())
        
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "="*60)
print("✅ VERIFICATION COMPLETE!")
print("="*60)