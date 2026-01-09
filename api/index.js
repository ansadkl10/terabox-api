import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());

/* ================================
   VERCEL OPTIMIZED FUNCTION
================================ */
const terabox = async (url) => {
  // Method 1: GuruAPI (Currently Working)
  try {
    const { data } = await axios.get(`https://www.guruapi.tech/api/terabox?url=${url}`, {
      timeout: 8000 // Vercel Timeout limit
    });

    if (data.success && data.result && data.result.url) {
      return {
        server: "GuruAPI",
        file_name: data.result.fileName || "Terabox File",
        size: data.result.size || "Unknown",
        d_link: data.result.url,
        note: "Link expires in 10 mins"
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

  throw new Error("All APIs are busy. Please try again.");
};

/* ================================
   API ROUTE
================================ */
app.get("/api/terabox", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, message: "Url missing" });

    const result = await terabox(url);
    
    // Cache Control for speed
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    
    res.json({ status: true, creator: "Akshay-Eypz", result });

  } catch (err) {
    res.status(500).json({ status: false, message: "Failed", error: err.message });
  }
});

app.get("/", (req, res) => res.send("Terabox API Vercel Running"));

// Vercel-ൽ app.listen ആവശ്യമില്ല, ഇത് നിർബന്ധമാണ്:
export default app;
