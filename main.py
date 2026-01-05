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
        
        headers = {
            "Cookie": f"ndus={NDUS.strip()}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.terabox.com/main"
        }

        response = requests.get(api_url, headers=headers, timeout=15)
        data = response.json()

        if "list" in data:
            return {
                "success": True,
                "data": data["list"]
            }
        else:
            return {
                "success": False,
                "terabox_response": data
            }

    except Exception as e:
        return {"success": False, "error": str(e)}
                                               
