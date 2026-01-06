import os
from flask import Flask, request, jsonify
import requests
import re

app = Flask(__name__)

# Koyeb Environment Variable-ൽ TERABOX_COOKIE സെറ്റ് ചെയ്യുക
COOKIE = os.getenv("TERABOX_COOKIE", "ndus=YOUR_COOKIE_HERE")

def get_headers():
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': COOKIE,
        'Referer': 'https://www.terabox.com/main',
        'Connection': 'keep-alive'
    }

@app.route('/')
def home():
    return {"status": "running", "message": "TeraBox API on Koyeb"}

@app.route('/fetch')
def fetch_link():
    target_url = request.args.get('url')
    if not target_url:
        return jsonify({"error": "URL parameter missing"}), 400

    try:
        # Link-ൽ നിന്ന് surl കണ്ടുപിടിക്കുന്നു
        if 'surl=' in target_url:
            surl = re.search(r'surl=([^&]+)', target_url).group(1)
        else:
            surl = target_url.split('/')[-1]
            if surl.startswith('1'): surl = surl[1:]

        # Session ഉപയോഗിക്കുന്നത് തടസ്സങ്ങൾ കുറയ്ക്കാൻ സഹായിക്കും
        session = requests.Session()
        api_url = f"https://www.terabox.com/share/list?surl={surl}&root=1"
        
        response = session.get(api_url, headers=get_headers(), timeout=15)
        
        # റിക്വസ്റ്റ് പരാജയപ്പെട്ടാൽ അത് അറിയിക്കാൻ
        if response.status_code != 200:
            return jsonify({
                "status": "error", 
                "http_code": response.status_code,
                "message": "TeraBox block cheythu, proxy vendി വരും"
            }), 403

        return jsonify(response.json())

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)
