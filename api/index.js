import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());

/* ================================
   VERCEL OPTIMIZED FUNCTION
================================ */
const terabox = async (url) => {
  // Method 1: GuruAPI (Fast & Reliable)
  try {
    const { data } = await axios.get(`https://www.guruapi.tech/api/terabox?url=${url}`, {
      timeout: 8000 // Vercel has 10s limit, so keeping it 8s
    });

    if (data.success && data.result && data.result.url) {
      return {
        server: "GuruAPI",
        file_name: data.result.fileName || "Terabox File",
        size: data.result.size || "Unknown",
        d_link: data.result.url,
        note: "Link usually expires in 10-15 mins"
      };
    }
  } catch (e) {
    console.log("GuruAPI Failed:", e.message);
  }

  // Method 2: Rull API (Backup)
  try {
    const { data } = await axios.get(`https://api.rull.cc/api/terabox?url=${url}`, {
      timeout: 8000
    });

    if (data && data.data && data.data.dlink) {
      return {
        server: "Rull.cc",
        file_name: data.data.filename,
        d_link: data.data.dlink
      };
    }
  } catch (e) {
    console.log("Rull API Failed:", e.message);
  }

  throw new Error("Server Busy or Link Expired. Try again.");
};

/* ================================
   API ROUTE
================================ */
app.get("/api/terabox", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, message: "Url missing" });

    const result = await terabox(url);
    
    // Cache Control (Optional: to make it faster)
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    
    res.json({ status: true, creator: "Akshay-Eypz", result });

  } catch (err) {
    res.status(500).json({ status: false, message: "Failed", error: err.message });
  }
});

app.get("/", (req, res) => res.send("Terabox API Running on Vercel"));

// Vercel needs this export, NOT app.listen
export default app;
        
