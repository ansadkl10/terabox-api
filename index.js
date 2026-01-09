import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ================================
   NEW TERABOX FUNCTION (Mirror API)
================================ */
const terabox = async (url) => {
  try {
    // Using a different provider API to bypass Koyeb IP block
    // Provider: Ryzendesu API (Free Tier)
    const apiUrl = `https://api.ryzendesu.vip/api/downloader/terabox?url=${url}`;
    
    const { data } = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 30000 // 30 seconds timeout
    });

    // Check if the API returned a valid result
    if (!data || !data.status) {
      throw new Error("API failed to fetch data");
    }

    // Adjusting response to your format
    return {
      file_name: data.data.filename || "Unknown File",
      size: data.data.size || "Unknown",
      d_link: data.data.url || data.data.dlink, // Direct Download Link
      thumb: data.data.thumb,
      fast_download: data.data.hd_url // Sometimes HD link is faster
    };

  } catch (error) {
    console.error("API Error:", error.message);
    throw new Error("Failed to fetch link. The file might be deleted or the API is busy.");
  }
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

// Home Route to check if server is running
app.get("/", (req, res) => {
  res.send("Terabox Downloader API is Running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
