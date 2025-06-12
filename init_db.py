from database import engine
from models import Base, Travel, Part  # 👈 Add Part here

# Create all tables
Base.metadata.create_all(bind=engine)
