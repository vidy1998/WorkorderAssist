import csv
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Travel

def bulk_insert_from_csv(csv_path):
    db: Session = SessionLocal()
    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                travel = Travel(
                    id=int(row["travel_id"]),
                    location=row["location"],
                    travel_time_hours=float(row["travel_time_hours"])
                )
                db.add(travel)
            except Exception as e:
                print(f"Error with row {row}: {e}")
        db.commit()
    db.close()

if __name__ == "__main__":
    bulk_insert_from_csv("travel_data.csv")
