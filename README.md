# 🚀 Work Order Assist App

A **React Native + FastAPI-powered mobile application** built to help field technicians efficiently create, manage, and submit work orders — in real time. Developed using **Expo Go** for seamless testing and usage across multiple devices without requiring app store deployment.

> ⚡️ **Goal**: Replace paper-based workflows with a mobile-first solution that simplifies job logging, reduces admin time, and automates reporting.

---

## 🎯 Key Features

* ✅ **End-to-End Work Order Management**

  * Add/edit work orders with auto-generated date, week number, and technician profile
  * Dynamic form fields: customer/site info, work performed, travel log, parts used, time log
  * Auto-calculated part totals based on real-time pricing

* 🧾 **PDF + JSON Data Export**

  * Submissions saved as both PDF and JSON
  * Structured folders named `MMDDYYYY_<work_order_number>`
  * Files include all form data, cost breakdown, and uploaded media

* 📱 **Expo Go Deployment (Real-Time Use)**

  * Built with **React Native using Expo**
  * Technicians simply scan a QR code to launch the app in **Expo Go**
  * Works across multiple devices instantly — no App Store or sideloading required

* 🔍 **Smart Input UX**

  * Autocomplete part selection with price lookup
  * Travel location suggestions with auto-filled hours
  * Quantity-based price calculations, clean and modern UI

* 🖼 **Image/Video Uploads with Thumbnails**

  * Upload photos/videos from job sites
  * Thumbnails generated for videos using FFmpeg

* 📬 **Automated Email Notifications**

  * Sends summary emails with links when media is uploaded (if matching JSON exists)

---

## 🧱 Tech Stack

| Layer              | Technology                                          |
| ------------------ | --------------------------------------------------- |
| **Frontend**       | React Native (Expo Go), SwiftUI-inspired components |
| **Backend**        | FastAPI (Python)                                    |
| **Database**       | PostgreSQL                                          |
| **Media Handling** | FFmpeg, SSDs on Raspberry Pi 4B                     |
| **Hosting**        | Local Raspberry Pi 4B server with mounted storage   |

---

## 🗃 Folder Structure (Server)

```
/media/
  └── MMDDYYYY_<workorder_number>/
        ├── workorder.json
        ├── workorder.pdf
        ├── image1.jpg
        ├── video1.mp4
        └── video1_thumb.jpg
```

---

## 🌐 Sample API Endpoints

| Method | Endpoint                         | Description                        |
| ------ | -------------------------------- | ---------------------------------- |
| `GET`  | `/parts/`                        | Fetch searchable parts list        |
| `GET`  | `/travel-time/?location=Toronto` | Auto-fill travel time              |
| `POST` | `/add-workorder/`                | Submit work order with metadata    |
| `PUT`  | `/update-workorder/`             | Edit saved JSON file               |
| `POST` | `/upload-images/`                | Upload job media and trigger email |

---

## 💡 Why This Project Stands Out

* **Real-World Use Case**: Built for actual on-site technician use in an electrical business
* **Expo Go Deployment**: Accessible across devices instantly, without builds or installs
* **Full-Stack Architecture**: Frontend, backend, database, file storage, and server scripting
* **Custom Raspberry Pi Hosting**: Lightweight, cost-efficient server with SSD media management and automation

---

## 🧪 How to Use

### Run the App (Expo Go)

```bash
npm install
npx expo start
```

* Scan the QR code with the Expo Go app
* App runs instantly on your iPhone or Android — no install or test account needed

### Start Backend (FastAPI)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

* Ensure your `/media/` SSD is mounted and PostgreSQL is running

---

## 👥 Contributors

| Name              | Role                                                                      | Connect
| ----------------- | ------------------------------------------------------------------------- | ----------------------------------------
| **Maria Labeeba** | Frontend Development – React Native, UI/UX, Expo Go, real-time form logic | [@mlabeeba](https://github.com/mlabeeba)
| **Vidy Matadeen** | Backend Development – FastAPI, PostgreSQL, server setup, media handling   | [@vidy1998](https://github.com/vidy1998)

