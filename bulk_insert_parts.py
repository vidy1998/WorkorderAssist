import csv
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Part

def bulk_insert_parts(csv_path):
    db: Session = SessionLocal()
    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                part = Part(
                    part_id=int(row["part_id"]),
                    part_name=row["part_name"],
                    part_number=row["part_number"] or None,
                    unit_cost=float(row["unit_cost"]) if row["unit_cost"] else None,
                    unit_price=float(row["unit_price"]) if row["unit_price"] else None,
                    part_pic=row["part_pic"] or None
                )
                db.add(part)
            except Exception as e:
                print(f"❌ Error on row {row['part_id']}: {e}")
        db.commit()
        db.close()
        print("✅ Parts imported successfully.")

if __name__ == "__main__":
    bulk_insert_parts("parts_data.csv")
