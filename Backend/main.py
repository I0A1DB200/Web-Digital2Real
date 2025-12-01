from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MEDIA_DIR = BASE_DIR / "media"
VIDEO_DIR = MEDIA_DIR / "videos"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="SCADA Web API")

# CORS: permite que el frontend (otro puerto) llame al backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # en local simplificamos
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir estáticos (vídeos)
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

@app.get("/")
def home():
    return {"mensaje": "Servidor FastAPI funcionando correctamente 🚀"}

# --- Datos de ejemplo (ajusta los nombres a tus ficheros reales) ---
VIDEOS = [
    {"id": 1, "title": "Video 1", "file": "video1.mp4", "description": "PID básico en PLC"},
    {"id": 2, "title": "Video 2", "file": "video2.mp4", "description": "SCADA y telemetría"},
    {"id": 3, "title": "Video 3", "file": "video3.mp4", "description": "Modbus/TCP"},
]

POSTS = [
    {"id": 1, "title": "SCADA vs DCS", "content": "Diferencias clave, arquitectura y casos de uso."},
    {"id": 2, "title": "Protocolos industriales", "content": "Resumen de Modbus, Profinet y OPC UA."},
]

@app.get("/api/videos")
def get_videos():
    return [
        {
            "id": v["id"],
            "title": v["title"],
            "url": f"/media/videos/{v['file']}",
            "description": v.get("description", ""),
        }
        for v in VIDEOS
    ]

@app.get("/api/posts")
def get_posts():
    return POSTS
