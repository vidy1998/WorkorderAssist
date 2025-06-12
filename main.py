from fastapi import FastAPI, UploadFile, File, Form, Depends, APIRouter, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import os, shutil, json
from email.message import EmailMessage
import smtplib
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import get_db
from models import Travel, Part

router = APIRouter()

# Load environment variables from .env
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
EMAIL_TO = os.getenv("EMAIL_TO")

def send_email(subject, body):
    msg = EmailMessage()
    msg["From"] = EMAIL_USER
    msg["To"] = EMAIL_TO
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_USER, EMAIL_PASS)
        smtp.send_message(msg)

@router.get("/travel-time/")
def get_travel_time_partial(location: str, db: Session = Depends(get_db)):
    results = db.query(Travel).filter(Travel.location.ilike(f"%{location}%")).all()
    return [
        {
            "location": travel.location,
            "travel_time_hours": travel.travel_time_hours
        }
        for travel in results
    ]

@router.post("/travel/")
def add_travel(location: str = Form(...), travel_time_hours: float = Form(...), db: Session = Depends(get_db)):
    new_travel = Travel(
        location=location,
        travel_time_hours=travel_time_hours
    )
    db.add(new_travel)
    db.commit()
    db.refresh(new_travel)
    return {"message": "Travel entry added", "travel": new_travel}

@router.put("/travel/{travel_id}")
def update_travel(travel_id: int, location: str = Form(...), travel_time_hours: float = Form(...), db: Session = Depends(get_db)):
    travel = db.query(Travel).get(travel_id)
    if not travel:
        raise HTTPException(status_code=404, detail="Travel entry not found")

    travel.location = location
    travel.travel_time_hours = travel_time_hours

    db.commit()
    return {"message": "Travel entry updated", "travel": travel}

@router.delete("/travel/{travel_id}")
def delete_travel(travel_id: int, db: Session = Depends(get_db)):
    travel = db.query(Travel).get(travel_id)
    if not travel:
        raise HTTPException(status_code=404, detail="Travel entry not found")

    db.delete(travel)
    db.commit()
    return {"message": "Travel entry deleted"}


@router.get("/parts/")
def get_matching_parts(part_name: str, db: Session = Depends(get_db)):
    results = db.query(Part).filter(Part.part_name.ilike(f"%{part_name}%")).all()
    return [
        {
            "part_id": part.part_id,
            "part_name": part.part_name,
            "part_number": part.part_number,
            "unit_cost": part.unit_cost,
            "unit_price": part.unit_price,
            "part_pic": part.part_pic
        }
        for part in results
    ]

@router.post("/parts/")
def add_part(part_name: str = Form(...), part_number: str = Form(...), unit_cost: float = Form(...), unit_price: float = Form(...), part_pic: str = Form(...), db: Session = Depends(get_db)):
    new_part = Part(
        part_name=part_name,
        part_number=part_number,
        unit_cost=unit_cost,
        unit_price=unit_price,
        part_pic=part_pic
    )
    db.add(new_part)
    db.commit()
    db.refresh(new_part)
    return {"message": "Part added", "part": new_part}

@router.put("/parts/{part_id}")
def update_part(part_id: int, part_name: str = Form(...), part_number: str = Form(...), unit_cost: float = Form(...), unit_price: float = Form(...), part_pic: str = Form(...), db: Session = Depends(get_db)):
    part = db.query(Part).get(part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    part.part_name = part_name
    part.part_number = part_number
    part.unit_cost = unit_cost
    part.unit_price = unit_price
    part.part_pic = part_pic

    db.commit()
    return {"message": "Part updated", "part": part}

@router.delete("/parts/{part_id}")
def delete_part(part_id: int, db: Session = Depends(get_db)):
    part = db.query(Part).get(part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    db.delete(part)
    db.commit()
    return {"message": "Part deleted"}


@router.get("/search-workorders/")
def search_workorders(query: str):
    matching = []

    for folder in os.listdir(MEDIA_ROOT):
        folder_path = os.path.join(MEDIA_ROOT, folder)
        json_file = os.path.join(folder_path, f"{folder}.json")

        if os.path.exists(json_file):
            with open(json_file, "r") as f:
                data = json.load(f)
                if (
                    query.lower() in data.get("customer", "").lower()
                    or query.lower() in data.get("site_address", "").lower()
                    or query.lower() in data.get("po_number", "").lower()
                    or query.lower() in data.get("site_contact", "").lower()
                ):
                    matching.append({
                        "folder": folder,
                        "customer": data.get("customer", "N/A"),
                        "site_address": data.get("site_address", "N/A"),
                        "po_number": data.get("po_number", "N/A"),
                        "site_contact": data.get("site_contact", "N/A"),
                    })

    return {"matches": matching}
app = FastAPI()
app.include_router(router)
MEDIA_ROOT = "media"
os.makedirs(MEDIA_ROOT, exist_ok=True)

app.mount("/media", StaticFiles(directory=MEDIA_ROOT), name="media")


# 1. Upload workorder PDF + JSON
@app.post("/create-workorder/")
async def create_workorder(
    folder_name: str = Form(...),
    json_file: UploadFile = File(...),
    pdf_file: UploadFile = File(...)
):
    workorder_path = os.path.join(MEDIA_ROOT, folder_name)
    os.makedirs(workorder_path, exist_ok=True)

    json_path = os.path.join(workorder_path, json_file.filename)
    pdf_path = os.path.join(workorder_path, pdf_file.filename)

    with open(json_path, "wb") as jf:
        shutil.copyfileobj(json_file.file, jf)

    with open(pdf_path, "wb") as pf:
        shutil.copyfileobj(pdf_file.file, pf)

    return {"message": "workorder files uploaded", "folder": folder_name}

# 2. Upload Images
@app.post("/upload-images/")
async def upload_images(folder_name: str = Form(...), files: list[UploadFile] = File(...)):
    folder_path = os.path.join(MEDIA_ROOT, folder_name)
    os.makedirs(folder_path, exist_ok=True)

    saved_files = []
    for img in files:
        img_path = os.path.join(folder_path, img.filename)
        with open(img_path, "wb") as f:
            shutil.copyfileobj(img.file, f)
        saved_files.append(img.filename)

    # 📬 Load workorder JSON (if it exists) and send email
    json_path = os.path.join(folder_path, f"{folder_name}.json")
    if os.path.exists(json_path):
        with open(json_path, "r") as jf:
            workorder_data = json.load(jf)
            workorder_subject_number = f"{workorder_data.get('work_order_number', 'N/A')}"
            workorder_info = f"Customer: {workorder_data.get('customer', 'N/A')}\nSite Address: {workorder_data.get('site_address', 'N/A')}\nStatus: {workorder_data.get('job_status', 'N/A')}"
    else:
        workorder_info = "No workorder data found."

    folder_url = f"http://127.0.0.1:8000/album/{folder_name}/"
    current_date = datetime.now().strftime("%m/%d/%Y")
    send_email(
        subject=f"{current_date} - {workorder_subject_number}",
        body=f"{workorder_info}\n\nFiles available at: {folder_url}"
    )

    return {"message": "Images uploaded", "files": saved_files}

from fastapi import UploadFile, File, Form

@app.put("/workorder/")
def update_workorder(
    folder_name: str = Form(...),
    updated_json: UploadFile = File(...)
):
    workorder_path = os.path.join(MEDIA_ROOT, folder_name)
    json_path = os.path.join(workorder_path, f"{folder_name}.json")

    # 🧩 Check if the folder exists
    if not os.path.exists(workorder_path):
        return JSONResponse(status_code=404, content={"error": "Workorder folder not found"})

    # ✅ Overwrite the existing JSON file
    try:
        with open(json_path, "wb") as f:
            shutil.copyfileobj(updated_json.file, f)
        return {"message": "Workorder JSON successfully updated", "path": json_path}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/album/{folder_name}", response_class=HTMLResponse)
def album(folder_name: str):
    folder_path = os.path.join(MEDIA_ROOT, folder_name)
    if not os.path.exists(folder_path):
        return HTMLResponse(f"<h2>Folder '{folder_name}' not found.</h2>", status_code=404)

    files = os.listdir(folder_path)
    images = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png", ".heic", ".webp", ".gif"))]

    html_content = f"<h2>Album: {folder_name}</h2><div style='display:flex;flex-wrap:wrap;gap:12px;'>"
    for img in images:
        img_url = f"/media/{folder_name}/{img}"
        html_content += f"<div><img src='{img_url}' style='max-width:200px'><p>{img}</p></div>"
    html_content += "</div>"

    return HTMLResponse(content=html_content)

@app.get("/workorders")
def list_workorders():
    try:
        folders = [
            name for name in os.listdir(MEDIA_ROOT)
            if os.path.isdir(os.path.join(MEDIA_ROOT, name))
        ]
        return {"workorders": folders}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/workorder/{folder_name}")
def get_workorder(folder_name: str):
    json_path = os.path.join(MEDIA_ROOT, folder_name, f"{folder_name}.json")
    if not os.path.exists(json_path):
        return JSONResponse(status_code=404, content={"error": "Workorder not found"})
    with open(json_path) as f:
        data = json.load(f)
    return data

@app.delete("/workorder/{folder_name}")
def delete_workorder(folder_name: str):
    folder_path = os.path.join(MEDIA_ROOT, folder_name)

    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Workorder not found")

    try:
        shutil.rmtree(folder_path)
        return {"message": f"Workorder '{folder_name}' deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting workorder: {str(e)}")


