from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Production(Base):
    __tablename__ = 'production'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    Year = Column(Integer)
    Month = Column(String)
    Sheet = Column(Float)
    Sole = Column(Float)
    Crepe = Column(Float)
    Scrap = Column(Float)
    Crepe_Latex = Column("Crepe Latex", Float)
    Crepe_TSR = Column("Crepe T.S.R.", Float)
    Latex = Column(Float)
    Total_MT = Column("Total (MT)", Float)

class Price(Base):
    __tablename__ = 'prices'
    
    id = Column(Integer, primary_key=True, index=True)
    Year = Column(Integer)
    Month = Column(String)
    Price_per_Liter_LKR = Column("Price per Liter (LKR)", Float)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    password_hash = Column(String)
    district = Column(String)
    preferred_language = Column(String, default="en")
