import os
import time
import validators
import requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from bs4 import BeautifulSoup

from analyzers.content_analyzer import analyze_content
from analyzers.structure_analyzer import analyze_structure
from analyzers.behavior_analyzer import analyze_behavior
from analyzers.risk_engine import calculate_trust_score

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

REQUEST_TIMEOUT = 12
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    url = (data or {}).get("url", "").strip()

    # ── Validate URL ──────────────────────────────────────────────────────────
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Auto-prefix http if missing
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    if not validators.url(url):
        return jsonify({"error": f"Invalid URL: {url}"}), 400

    # ── Fetch Website ─────────────────────────────────────────────────────────
    try:
        start = time.time()
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=True,
            verify=True
        )
        elapsed_ms = (time.time() - start) * 1000
        raw_html = response.text
        final_url = response.url

    except requests.exceptions.SSLError:
        # Retry without SSL verification to at least get structure data
        try:
            start = time.time()
            response = requests.get(
                url,
                headers=HEADERS,
                timeout=REQUEST_TIMEOUT,
                allow_redirects=True,
                verify=False
            )
            elapsed_ms = (time.time() - start) * 1000
            raw_html = response.text
            final_url = response.url
        except Exception as e:
            return jsonify({"error": f"SSL error and fallback failed: {str(e)}"}), 502

    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to the website. It may be offline or blocking automated requests."}), 502

    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out (>12s). The website may be very slow or unreachable."}), 504

    except requests.exceptions.TooManyRedirects:
        return jsonify({"error": "Too many redirects — this is a strong indicator of a suspicious or misconfigured site."}), 502

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    # ── Parse HTML ────────────────────────────────────────────────────────────
    try:
        soup = BeautifulSoup(raw_html, "lxml")
    except Exception:
        soup = BeautifulSoup(raw_html, "html.parser")

    page_title = soup.title.string.strip() if soup.title and soup.title.string else "Unknown"

    # ── Run Analysis Modules ──────────────────────────────────────────────────
    content_result = analyze_content(soup, raw_html)
    structure_result = analyze_structure(soup, final_url)
    behavior_result = analyze_behavior(url, response, soup, elapsed_ms)
    risk_result = calculate_trust_score(content_result, structure_result, behavior_result)

    # ── Compile Response ──────────────────────────────────────────────────────
    return jsonify({
        "url": final_url,
        "page_title": page_title,
        "content": content_result,
        "structure": structure_result,
        "behavior": behavior_result,
        "risk": risk_result
    })


@app.route("/health")
def health():
    return jsonify({"status": "ok", "version": "1.0.0"})


if __name__ == "__main__":
    print("\n🚀 Smart Website Behavior Analyzer")
    print("   Server running at: http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
