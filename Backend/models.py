from sqlalchemy import Column, Integer, String, Float
from database import Base

class Travel(Base):
    __tablename__ = "travel"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, unique=True, nullable=False)
    travel_time_hours = Column(Float, nullable=False)

class Part(Base):
    __tablename__ = "parts"

    part_id = Column(Integer, primary_key=True, index=True)
    part_name = Column(String, nullable=False)
    part_number = Column(String)
    unit_cost = Column(Float)
    unit_price = Column(Float)
    part_pic = Column(String)  # This could be a filename or URL
# vidy was here