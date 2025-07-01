from fastapi import FastAPI, UploadFile, File, Form, Depends, APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import os, shutil, json, subprocess, mimetypes
from email.message import EmailMessage
import smtplib
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import get_db
from models import Travel, Part
from typing import List

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

@router.post("/create-workorder/")
async def create_workorder(
        folder_name: str = Form(...),
        json_data: str = Form(...),
        pdf_file: UploadFile = File(...)
):
    print("=== Folder Name ===")
    print(folder_name)

    print("=== Raw JSON Data String ===")
    print(json_data)

    import json
    try:
        data = json.loads(json_data)
        print("=== Parsed JSON ===")
        print(data)
    except Exception as e:
        print("JSON parse error:", e)
        return {"error": "Invalid JSON"}

    # ✅ Create folder
    folder_path = os.path.join("media", folder_name)
    os.makedirs(folder_path, exist_ok=True)

    # ✅ Save JSON
    json_path = os.path.join(folder_path, f"{folder_name}.json")
    with open(json_path, "w") as f:
        json.dump(data, f, indent=4)

    # ✅ Save PDF
    pdf_path = os.path.join(folder_path, "workorder.pdf")
    with open(pdf_path, "wb") as f:
        f.write(await pdf_file.read())

    return {"status": "saved", "folder": folder_name}


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
def update_travel(travel_id: int, location: str = Form(...), travel_time_hours: float = Form(...),
                  db: Session = Depends(get_db)):
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
def add_part(part_name: str = Form(...), part_number: str = Form(...), unit_cost: float = Form(...),
             unit_price: float = Form(...), part_pic: str = Form(...), db: Session = Depends(get_db)):
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
def update_part(part_id: int, part_name: str = Form(...), part_number: str = Form(...), unit_cost: float = Form(...),
                unit_price: float = Form(...), part_pic: str = Form(...), db: Session = Depends(get_db)):
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
app.mount("/parts-media", StaticFiles(directory="parts_media"), name="parts-media")


# 1. Upload workorder PDF + JSON

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

        # Generate thumbnail if it's a video
        if img.filename.lower().endswith((".mp4", ".webm", ".mov")):
            thumb_name = f"{os.path.splitext(img.filename)[0]}_thumb.jpg"
            thumb_path = os.path.join(folder_path, thumb_name)
            print(f"Saving thumbnail: {thumb_path}")
            # Use ffmpeg to extract thumbnail at 1-second mark
            subprocess.run([
                "ffmpeg", "-i", img_path,
                "-ss", "00:00:01", "-vframes", "1",
                "-q:v", "2", thumb_path
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 📬 Load workorder JSON (if it exists) and send email
    json_path = os.path.join(folder_path, f"{folder_name}.json")
    if os.path.exists(json_path):
        with open(json_path, "r") as jf:
            workorder_data = json.load(jf)
            workorder_subject_number = f"{workorder_data.get('workOrderNumber', 'N/A')}"
            workorder_info = f"Customer: {workorder_data.get('customer', 'N/A')}\nSite Address: {workorder_data.get('siteAddress', 'N/A')}\nStatus: {workorder_data.get('jobStatus', 'N/A')}"
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

from fastapi.responses import FileResponse
from fastapi import HTTPException


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_PATH = os.path.join(BASE_DIR, "media")

@app.get("/workorders/week/{week_number}", response_model=List[str])
async def get_workorders_by_week(week_number: str):
    workorders = []
    try:
        for folder_name in os.listdir(MEDIA_PATH):
            folder_path = os.path.join(MEDIA_PATH, folder_name)
            print(f"Checking folder: {folder_path}")

            if os.path.isdir(folder_path):
                for file in os.listdir(folder_path):
                    if file.endswith(".json"):
                        json_path = os.path.join(folder_path, file)
                        print(f"Reading json: {json_path}")

                        with open(json_path, 'r') as f:
                            data = json.load(f)

                        print(f"Week in JSON: {data.get('week')}")

                        if str(data.get("week")) == str(week_number):
                            workorders.append(folder_name)
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return workorders



@app.get("/list-Images")
def list_media_files(folder_name: str):
    folder_path = os.path.join(MEDIA_ROOT, folder_name)
    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Folder not found")

    media_urls = []
    for file in os.listdir(folder_path):
        ext = file.lower().split('.')[-1]
        if ext in ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "webm"]:
            url = f"/media/{folder_name}/{file}"
            media_urls.append(url)

    return JSONResponse(content={"media": media_urls})


@app.post("/add-Images/")
async def add_images(folder_name: str = Form(...), files: list[UploadFile] = File(...)):
    folder_path = os.path.join(MEDIA_ROOT, folder_name)
    os.makedirs(folder_path, exist_ok=True)

    saved_files = []
    for file in files:
        file_path = os.path.join(folder_path, file.filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        saved_files.append(file.filename)

        # Generate thumbnail if it's a video
        if file.filename.lower().endswith((".mp4", ".webm", ".mov")):
            thumb_name = f"{os.path.splitext(file.filename)[0]}_thumb.jpg"
            thumb_path = os.path.join(folder_path, thumb_name)
            subprocess.run([
                "ffmpeg", "-i", file_path,
                "-ss", "00:00:01", "-vframes", "1",
                "-q:v", "2", thumb_path
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    return JSONResponse(content={"message": "Media uploaded", "files": saved_files})


@app.delete("/delete-Image/")
def delete_Image(folder_name: str, filename: str):
    folder_path = os.path.join(MEDIA_ROOT, folder_name)
    file_path = os.path.join(folder_path, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Determine what to delete
    deleted = []

    # If it's a video, delete its thumbnail too
    if filename.lower().endswith((".mp4", ".mov", ".webm")):
        thumb_name = f"{os.path.splitext(filename)[0]}_thumb.jpg"
        thumb_path = os.path.join(folder_path, thumb_name)
        if os.path.exists(thumb_path):
            os.remove(thumb_path)
            deleted.append(thumb_name)

    # If it's a thumbnail, delete the corresponding video
    elif filename.endswith("_thumb.jpg"):
        video_base = filename.replace("_thumb.jpg", "")
        for ext in ["mp4", "mov", "webm"]:
            video_path = os.path.join(folder_path, f"{video_base}.{ext}")
            if os.path.exists(video_path):
                os.remove(video_path)
                deleted.append(f"{video_base}.{ext}")

    # Finally delete the given file
    os.remove(file_path)
    deleted.append(filename)

    return JSONResponse(content={"message": "Deleted", "files": deleted})


@app.put("/workorder/")
def update_workorder(
        folder_name: str = Form(...),
        updated_json: str = Form(...)  # receive as plain string form field
):
    workorder_path = os.path.join(MEDIA_ROOT, folder_name)
    json_path = os.path.join(workorder_path, f"{folder_name}.json")

    # 🧩 Check if the folder exists
    if not os.path.exists(workorder_path):
        return JSONResponse(status_code=404, content={"error": "Workorder folder not found"})

    # ✅ Overwrite the existing JSON file with the string content
    try:
        with open(json_path, "w") as f:
            f.write(updated_json)
        return {"message": "Workorder JSON successfully updated", "path": json_path}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


from fastapi.responses import HTMLResponse
import os
import json


@app.get("/album/{folder_name}/", response_class=HTMLResponse)
def view_album(folder_name: str):
    folder_path = os.path.join(MEDIA_ROOT, folder_name)
    if not os.path.exists(folder_path):
        return HTMLResponse(content="Folder not found", status_code=404)

    files = os.listdir(folder_path)
    media_items = []

    for file in files:
        if file.endswith("_thumb.jpg"):
            continue  # skip thumbnails

        ext = file.split(".")[-1].lower()
        if ext in ["jpg", "jpeg", "png", "gif", "webp"]:
            media_items.append({"type": "image", "src": f"/media/{folder_name}/{file}"})
        elif ext in ["mp4", "mov", "webm"]:
            thumb = f"{os.path.splitext(file)[0]}_thumb.jpg"
            media_items.append({
                "type": "video",
                "src": f"/media/{folder_name}/{file}",
                "thumb": f"/media/{folder_name}/{thumb}"
            })

    # Inject HTML with media_items
    items_html = ""
    for item in media_items:
        if item["type"] == "image":
            items_html += f'<img class="thumb" src="{item["src"]}" onclick="openModal(\'{item["src"]}\', \'image\')">'
        else:
            items_html += f'<img class="thumb" src="{item["thumb"]}" onclick="openModal(\'{item["src"]}\', \'video\')">'

    return f"""
    <html>
    <head>
        <title>Gallery - {folder_name}</title>
        <style>
            body {{
                font-family: sans-serif;
                background: #f0f0f0;
                padding: 20px;
                text-align: center;
            }}
            .thumb {{
                width: 260px;
                height: 340px;
                object-fit: cover;
                margin: 10px;
                border: 2px solid #ccc;
                cursor: pointer;
                transition: 0.3s;
            }}
            .thumb:hover {{
                transform: scale(1.05);
            }}
            #modal {{
                display: none;
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.9);
                justify-content: center;
                align-items: center;
                z-index: 1000;
                flex-direction: column;
            }}
            #modalContent {{
                max-width: 90%;
                max-height: 80%;
            }}
            .nav {{
                color: white;
                font-size: 80px;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                cursor: pointer;
                z-index: 1001;
                padding 20px;
            }}
            #prevBtn {{ left: 30px; }}
            #nextBtn {{ right: 30px; }}
            #closeBtn {{
                position: absolute;
                top: 20px;
                right: 30px;
                font-size: 60px;
                cursor: pointer;
                color: white;
                z-index: 1002;
                padding 10px;
            }}
        </style>
    </head>
    <body>
        <h2>📂 Gallery for {folder_name}</h2>
        <div id="gallery">{items_html}</div>

        <div id="modal" onclick="handleBackdropClick(event)">
            <span id="closeBtn" onclick="closeModal()">&times;</span>
            <span class="nav" id="prevBtn" onclick="navigate(-1)">&#10094;</span>
            <div id="modalContent"></div>
            <span class="nav" id="nextBtn" onclick="navigate(1)">&#10095;</span>
        </div>


        <script>
            let items = {media_items};
            let currentIndex = 0;

            function openModal(src, type) {{
                currentIndex = items.findIndex(item => item.src === src);
                showCurrent();
                document.getElementById("modal").style.display = "flex";
            }}

            function showCurrent() {{
                const item = items[currentIndex];
                const modalContent = document.getElementById("modalContent");
                if (item.type === "image") {{
                    modalContent.innerHTML = `<img src="${{item.src}}" style="max-width: 100%; max-height: 100%;">`;
                }} else {{
                    modalContent.innerHTML = `<video controls autoplay src="${{item.src}}" style="max-width: 100%; max-height: 100%; background:black;"></video>`;
                }}
            }}

            function closeModal() {{
                document.getElementById("modal").style.display = "none";
            }}

            function navigate(dir) {{
                currentIndex = (currentIndex + dir + items.length) % items.length;
                showCurrent();
            }}
            
            let touchStartX = 0;
            let touchEndX = 0;
        
            document.getElementById("modal").addEventListener("touchstart", e => {{
                touchStartX = e.changedTouches[0].screenX;
            }});
        
            document.getElementById("modal").addEventListener("touchend", e => {{
                touchEndX = e.changedTouches[0].screenX;
                handleGesture();
            }});
        
            function handleGesture() {{
                if (touchEndX < touchStartX - 50) navigate(1);   // Swipe left
                if (touchEndX > touchStartX + 50) navigate(-1);  // Swipe right
            }}
            
            function handleBackdropClick(event) {{
                const modalContent = document.getElementById("modalContent");
                if (!modalContent.contains(event.target)) {{
                    closeModal();
                }}
            }}
            
        </script>
    </body>
    </html>
    """


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


PARTS_MEDIA_ROOT = "/WorkorderAssist/parts_media"


@app.get("/parts_media/{filename}")
async def get_part_image(filename: str):
    file_path = os.path.join(PARTS_MEDIA_ROOT, filename)

    if os.path.isfile(file_path):
        return FileResponse(file_path)
    else:
        return {"error": "File not found"}


@app.get("/WorkorderAssist/parts-media/")
async def list_part_images():
    files = os.listdir(PARTS_MEDIA_ROOT)
    return {"files": files}
