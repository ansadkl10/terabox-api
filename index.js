import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000; // പോർട്ട് സെറ്റ് ചെയ്യുന്നു

// JSON ബോഡി പാർസ് ചെയ്യാൻ
app.use(express.json());

/* ================================
   TERABOX LOGIC FUNCTION
================================ */
const terabox = async (url) => {
  if (!url) throw new Error("Terabox URL is required");

  // User-Agent: റിക്വസ്റ്റിനും ഡൗൺലോഡിനും ഒരേപോലെ ഉപയോഗിക്കണം
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Ap>

  try {
    // Step 1: Solve Cloudflare Turnstile (using nekolabs)
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
