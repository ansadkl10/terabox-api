from fastapi import FastAPI, Query
import requests
import os

app = FastAPI()

# Render-ൽ സെറ്റ് ചെയ്ത NDUS വാല്യൂ എടുക്കുന്നു
NDUS = os.getenv("NDUS")

@app.get("/")
def home():
    return {"status": "Live", "message": "Terabox Python API"}

@app.get("/fetch")
def fetch_data(url: str = Query(..., description="Terabox URL")):
    if not NDUS:
        return {"success": False, "error": "NDUS missing in environment variables"}

    try:
        # URL-ൽ നിന്ന് SURL കണ്ടെത്തുന്നു
        if "surl=" in url:
            surl = url.split("surl=")[1].split("&")[0]
        else:
            surl = url.split("/")[-1]

        # Terabox Internal API
        api_url = f"https://www.terabox.com/share/list?app_id=250528&shorturl={surl}&root=1"
        
                # main.py-ൽ ഈ ഹെഡറുകൾ മാറ്റി നൽകുക
        headers = {
            "Cookie": f"ndus={NDUS.strip()}",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.terabox.com/",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "X-Requested-With": "XMLHttpRequest"
        }
