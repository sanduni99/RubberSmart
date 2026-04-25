import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print("="*60)
print("IMPORTING RUBBER DATASETS")
print("="*60)


print("\n Importing Production Data...")
production_file = "../data/Dataset of Rubber.xlsx" 
production_df = pd.read_excel(production_file)
print(production_df['Year'].max())

print(f"   Rows: {len(production_df)}")
print(f"   Columns: {list(production_df.columns)}")


production_df.to_sql('production', engine, if_exists='replace', index=False)
print("    Imported to table: production")


print("\n Importing Price Data...")
price_file = "../data/Dataset of Rubber Price.xlsx"  
price_df = pd.read_excel(price_file)

print(f"   Rows: {len(price_df)}")
print(f"   Columns: {list(price_df.columns)}")


price_df.to_sql('prices', engine, if_exists='replace', index=False)
print("    Imported to table: prices")

print("\n" + "="*60)
print(" BOTH DATASETS IMPORTED SUCCESSFULLY!")
print("="*60)
print("\nTables created:")
print("  • production")
print("  • prices")
