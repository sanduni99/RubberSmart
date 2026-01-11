import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:admin123@localhost/rubbersmart"
engine = create_engine(DATABASE_URL)

print("Importing Dataset of Rubber.xlsx...")
excel_file = pd.ExcelFile("../data/Dataset of Rubber.xlsx")
print(f"Found {len(excel_file.sheet_names)} sheets")

for sheet_name in excel_file.sheet_names:
    df = pd.read_excel(excel_file, sheet_name=sheet_name)
    table_name = sheet_name.lower().replace(' ', '_')
    df.to_sql(table_name, engine, if_exists='replace', index=False)
    print(f"Imported: {sheet_name} → {table_name}")
print(" Done!")
