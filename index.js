import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ================================
   MULTI-API TERABOX FUNCTION
================================ */
const terabox = async (url) => {
  let errorLog = [];

  // --- METHOD 1: Ryzendesu API ---
  try {
    console.log("Trying API 1...");
    const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/terabox?url=${url}`, {
      timeout: 10000 // 10s timeout
    });

    if (data.status && data.data) {
      return {
        server: "API-1",
        file_name: data.data.filename || "Terabox File",
        size: data.data.size || "Unknown",
        d_link: data.data.url || data.data.dlink,
        fast_download: data.data.hd_url
      };
    }
  } catch (e) {
    console.log("API 1 Failed:", e.message);
    errorLog.push(`API 1: ${e.message}`);
  }

  // --- METHOD 2: GuruAPI (Backup) ---
  try {
    console.log("Trying API 2 (Backup)...");
    const { data } = await axios.get(`https://www.guruapi.tech/api/terabox?url=${url}`, {
      timeout: 15000
    });

    // GuruAPI response structure check
    if (data.success && data.result) {
      return {
        server: "API-2",
        file_name: data.result.fileName || "Terabox File",
        size: data.result.size || "Unknown",
        d_link: data.result.url,
        note: "Link usually expires in 10-15 mins"
      };
    }
  } catch (e) {
    console.log("API 2 Failed:", e.message);
    errorLog.push(`API 2: ${e.message}`);
  }

  // If all failed
  throw new Error(`All APIs failed. Errors: ${errorLog.join(", ")}`);
};

/* ================================
   API ROUTE
================================ */
app.get("/api/terabox", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "Provide Terabox url using ?url="
      });
    }

    const result = await terabox(url);

    res.json({
      status: true,
      creator: "Akshay-Eypz",
      result: result
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
});

// Home Route
app.get("/", (req, res) => {
  res.send("Terabox Downloader API (Multi-Server) is Running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
