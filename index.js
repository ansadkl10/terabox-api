import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ================================
   TERABOX LOGIC FUNCTION
================================ */
const terabox = async (url) => {
  if (!url) throw new Error("Terabox URL is required");

  // FIX: This string must be on a SINGLE LINE without enter/return
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  try {
    // Step 1: Solve Cloudflare Turnstile
    const { data: cf } = await axios.post(
      "https://api.nekolabs.web.id/tools/bypass/cf-turnstile",
      {
        url: "https://teraboxdl.site/",
        siteKey: "0x4AAAAAACG0B7jzIiua8JFj"
      },
      { headers: { "content-type": "application/json" } }
    );

    if (!cf?.result) throw new Error("Failed to solve Turnstile");

    // Step 2: Request teraboxdl proxy
    const { data } = await axios.post(
      "https://teraboxdl.site/api/proxy",
      {
        url: url,
        cf_token: cf.result
      },
      {
        headers: {
          authority: "teraboxdl.site",
          accept: "*/*",
          "content-type": "application/json",
          origin: "https://teraboxdl.site",
          referer: "https://teraboxdl.site/",
          "user-agent": userAgent
        },
        timeout: 30000
      }
    );

    if (!data?.list || !data.list.length) {
      throw new Error("No files found or Link expired");
    }

    const file = data.list[0];

    return {
      file_name: file.server_filename || file.path?.replace("/", ""),
      size: file.size,
      d_link: file.dlink,
      headers: {
        "User-Agent": userAgent,
        "Referer": "https://terabox.com/"
      }
    };

  } catch (error) {
    console.error("Internal Error:", error.message);
    throw error;
  }
};

/* ================================
   API ROUTE
================================ */
app.get("/api/terabox", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, message: "Provide url" });

    const result = await terabox(url);
    res.json({ status: true, creator: "Akshay-Eypz", result: result });

  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

app.get("/", (req, res) => res.send("Terabox API Running"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
