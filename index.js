import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ================================
   NEW STRATEGY TERABOX FUNCTION
================================ */
const terabox = async (url) => {
  let errors = [];

  // 1. AA.XO.MU API (ഏറ്റവും പുതിയത്, മിക്കവാറും വർക്ക് ആകും)
  try {
    console.log("Trying Method 1 (AA.XO.MU)...");
    const { data } = await axios.get(`https://aa.xo.mu/api/video?url=${url}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
      }
    });

    if (data && data.url) {
      return {
        server: "AA.XO.MU",
        file_name: data.filename || "Terabox Video",
        size: data.size || "Unknown",
        d_link: data.url,
        thumb: data.thumb
      };
    }
  } catch (e) {
    errors.push(`Method 1 Failed: ${e.message}`);
  }

  // 2. INDOWN.IO LOGIC (POST Request via Proxy)
  try {
    console.log("Trying Method 2 (InDown)...");
    // Using CodeTabs Proxy (More powerful than corsproxy)
    const proxyUrl = "https://api.codetabs.com/v1/proxy?quest=";
    const targetUrl = "https://indown.io/download";
    
    // First, we need to check link (Simplified logic for now)
    // Note: InDown often requires cookies, skipping complex scrape for now.
    // Switching to 'Pickle' API logic via Proxy
    
    const { data } = await axios.get(`${proxyUrl}https://terabox-dl.qtcloud.workers.dev/api/get-info?shorturl=${url.split('/').pop()}`);
    
    if (data && data.downloadLink) {
       return {
        server: "QtCloud-Proxy",
        file_name: data.filename,
        size: data.size,
        d_link: data.downloadLink
      };
    }

  } catch (e) {
    errors.push(`Method 2 Failed: ${e.message}`);
  }

  // 3. RAPID-API FREE TIER (Fallback)
  // If user has a key, they can add it. Trying a public endpoint.
  try {
     console.log("Trying Method 3 (Hera)...");
     const { data } = await axios.get(`https://era-tera.cw.backend.heradown.com/api/tera?url=${url}`);
     if (data && data.url) {
         return {
             server: "Hera",
             file_name: data.filename || "File",
             d_link: data.url
         };
     }
  } catch (e) {
      errors.push(`Method 3 Failed: ${e.message}`);
  }

  throw new Error(`Koyeb IP is fully blocked. Try running locally. Errors: ${errors.join(" | ")}`);
};

/* ================================
   API ROUTE
================================ */
app.get("/api/terabox", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, message: "Url missing" });

    const result = await terabox(url);
    res.json({ status: true, creator: "Akshay-Eypz", result });

  } catch (err) {
    console.error(err.message); // Log to console
    res.status(500).json({ status: false, message: "Failed", error: err.message });
  }
});

app.get("/", (req, res) => res.send("Terabox Final API Running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
