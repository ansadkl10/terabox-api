package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

func main() {
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/fetch", fetchHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "10000"
	}

	fmt.Printf("Server starting on port %s...\n", port)
	http.ListenAndServe("0.0.0.0:"+port, nil)
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Terabox Go API is Live!")
}

func fetchHandler(w http.ResponseWriter, r *http.Request) {
	targetUrl := r.URL.Query().Get("url")
	ndus := os.Getenv("NDUS")

	if targetUrl == "" || ndus == "" {
		http.Error(w, "URL or NDUS missing", http.StatusBadRequest)
		return
	}

	// SURL കണ്ടുപിടിക്കുന്നു
	parts := strings.Split(targetUrl, "surl=")
	var surl string
	if len(parts) > 1 {
		surl = strings.Split(parts[1], "&")[0]
	} else {
		temp := strings.Split(targetUrl, "/")
		surl = temp[len(temp)-1]
	}

	apiUrl := fmt.Sprintf("https://www.terabox.com/share/list?app_id=250528&shorturl=%s&root=1", surl)

	client := &http.Client{}
	req, _ := http.NewRequest("GET", apiUrl, nil)
	req.Header.Set("Cookie", "ndus="+ndus)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Referer", "https://www.terabox.com/main")

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
