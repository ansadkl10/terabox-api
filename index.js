import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ================================
   PROXY-BASED TERABOX FUNCTION
================================ */
const terabox = async (url) => {
  let errors = [];

  // API ലിസ്റ്റ് (ഈ API-കൾ നേരിട്ട് വിളിച്ചാൽ ബ്ലോക്ക് ആകും, അതുകൊണ്ട് Proxy വഴി വിളിക്കുന്നു)
  const apis = [
    `https://teraboxvideodownloader.nepcoderdevs.workers.dev/?url=${url}`,
    `https://terabox-dl.qtcloud.workers.dev/api/get-info?shorturl=${url.split('/').pop()}`,
    `https://terabox.khmn.app/api/resolve?url=${url}`
  ];

  // Web Proxies (ഇവ Host IP Block മാറ്റാൻ സഹായിക്കും)
  const proxies = [
    "https://corsproxy.io/?", 
    "https://api.allorigins.win/raw?url=",
    "" // Direct attempt (Last try)
  ];

  // Loop through APIs and Proxies
  for (const api of apis) {
    for (const proxy of proxies) {
      try {
        const fullUrl = proxy ? `${proxy}${encodeURIComponent(api)}` : api;
        console.log(`Trying: ${proxy ? "Proxy -> " : "Direct -> "} ${new URL(api).hostname}`);
        
        const { data } = await axios.get(fullUrl, {
          timeout: 10000,
          headers: {
            // Browser പോലെ തോന്നിക്കാൻ User-Agent മാറ്റുന്നു
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });

        // 1. NepCoder Response Check
        if (data?.data?.file) {
          return {
            server: "NepCoder",
            file_name: data.data.file.title,
            size: data.data.file.totalSize,
            d_link: data.data.file.url,
            thumb: data.data.file.thumbnail
          };
        }

        // 2. QtCloud Response Check
        if (data?.downloadLink) {
          return {
            server: "QtCloud",
            file_name: data.filename,
            size: data.size,
            d_link: data.downloadLink
          };
        }

        // 3. Khmn Response Check
        if (data?.download_link) {
          return {
            server: "Khmn",
            file_name: data.filename,
            d_link: data.download_link
          };
        }

      } catch (e) {
        // Just continue to next proxy
      }
    }
  }

  throw new Error("All Proxies Failed. Server IP is strictly blocked.");
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
    res.status(500).json({ status: false, message: "Failed", error: err.message });
  }
});

app.get("/", (req, res) => res.send("Terabox Proxy API Running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
