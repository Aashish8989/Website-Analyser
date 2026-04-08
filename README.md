# 🛡️ WebGuard — Smart Website Behavior Analyzer

> **An AI-powered web application that analyzes any website for safety, trustworthiness, and suspicious behavior using content inspection, structural validation, and behavior simulation.**

![WebGuard Banner](https://img.shields.io/badge/WebGuard-AI%20Powered-4F46E5?style=for-the-badge&logo=shield&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)
![HTML CSS JS](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-F59E0B?style=flat-square)

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [Proposed Solution](#-proposed-solution)
4. [Features](#-features)
5. [System Architecture](#-system-architecture)
6. [How It Works](#-how-it-works-step-by-step)
7. [Technologies Used](#-technologies-used)
8. [Project Structure](#-project-structure)
9. [Installation & Setup](#-installation--setup)
10. [Running the Application](#-running-the-application)
11. [API Reference](#-api-reference)
12. [Analysis Modules](#-analysis-modules)
13. [Trust Score Logic](#-trust-score-logic)
14. [Sample Output](#-sample-output)
15. [Real-World Applications](#-real-world-applications)
16. [Conclusion](#-conclusion)

---

## 🌐 Project Overview

**WebGuard** is a full-stack web application designed to protect users from unsafe websites by performing a multi-layered analysis of any given URL. The system studies three key dimensions of a website:

- **Content** — What the website says (spam, phishing keywords, ad abuse)
- **Structure** — How the website is built (HTTPS, navigation, privacy policies)
- **Behavior** — How the website acts (redirects, obfuscated code, load time)

These are combined by a **Risk Engine** to produce a **Trust Score** (0–100) along with a risk level and actionable recommendation.

---

## ❗ Problem Statement

Every day, millions of users visit unknown websites and face serious risks:

| Threat | Description |
|---|---|
| 🛒 **Fake shopping sites** | Collect payment details and never deliver goods |
| 🎣 **Phishing attacks** | Steal login credentials by impersonating trusted sites |
| 🦠 **Scam pages** | Trick users into installing malware or sharing sensitive data |
| ❌ **Misleading content** | Spread misinformation using spam-heavy, low-quality content |

**Existing tools fail because:**
- They only check basic domain reputation
- They do not analyze website content, layout, or behavior
- They give no explanation or actionable advice to the user

---

## ✅ Proposed Solution

WebGuard solves this problem by:

1. **Fetching and parsing** the full HTML of any website
2. **Running 4 independent analysis modules** in parallel
3. **Combining 30+ risk signals** into a weighted Trust Score
4. **Displaying results** in a clear, beautiful dashboard with plain-English recommendations

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **URL Analysis** | Analyze any public website by URL |
| 📄 **Content Inspection** | Detects 40+ spam/phishing keywords and ad overload |
| 🏗️ **Structure Validation** | Checks HTTPS, contact pages, privacy policy, TLD |
| 🕵️ **Behavior Simulation** | Tracks redirects, load time, obfuscated JS |
| 🛡️ **Trust Score** | 0–100 score with risk level (Low / Medium / High / Critical) |
| 💡 **Recommendations** | Plain-English advice for every result |
| 🔗 **Redirect Chain** | Visual display of all HTTP redirects |
| 💅 **Premium UI** | White comic-style design with particle animations and custom cursor |
| ⚡ **Fast Results** | Typical analysis completes in 3–8 seconds |
| 🔐 **Private** | No data stored; all analysis is real-time and ephemeral |

---

## 🧩 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER (Frontend)                  │
│         HTML + CSS (Comic Theme) + JavaScript               │
│      Particle System · Animated Gauge · Step Stepper        │
└────────────────────────┬────────────────────────────────────┘
                         │ POST /analyze { url }
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               FLASK BACKEND (app.py :5000)                  │
│                   Validates & Fetches URL                   │
└───────┬──────────────┬──────────────┬───────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐
│   Content    │ │  Structure   │ │    Behavior          │
│  Analyzer   │ │  Analyzer    │ │    Analyzer          │
│             │ │              │ │                      │
│ • Spam KWs  │ │ • HTTPS      │ │ • Redirect chain     │
│ • Ad density│ │ • Contact pg │ │ • Load time          │
│ • Text ratio│ │ • Privacy pg │ │ • Meta-refresh       │
│ • Word count│ │ • Navigation │ │ • Obfuscated JS      │
│             │ │ • Suspic.TLD │ │ • Popup triggers     │
└──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘
       │                │                    │
       └────────────────┴────────────────────┘
                                │
                                ▼
              ┌─────────────────────────────┐
              │        RISK ENGINE          │
              │  Content  30% weight        │
              │  Structure 40% weight       │
              │  Behavior  30% weight       │
              │  + Critical override flags  │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Trust Score · Risk Level    │
              │  Issues · Strengths · Advice │
              └──────────────────────────────┘
```

---

## ⚙️ How It Works (Step-by-Step)

### 🟢 Step 1 — User Input
The user enters a website URL into the search bar:
```
https://example.com
```

### 🔵 Step 2 — Data Collection
The Flask backend:
- Sends an HTTP GET request with a realistic browser User-Agent
- Follows all redirects and records the redirect chain
- Measures the total response time
- Parses the HTML using BeautifulSoup

### 🟡 Step 3 — Content Analysis
The Content Analyzer scans the page text for:
- **40+ spam/phishing keywords** (e.g., "win", "click here", "verify your account", "limited offer")
- **Ad signal density** (iframes, ad network script sources)
- **Text-to-HTML ratio** (legitimate sites have more text than code)
- **Word count** (very short pages are suspicious)

📊 Output: `content_score` (0–100) + `content_quality` (Low / Medium / High)

### 🔴 Step 4 — Structure Analysis
The Structure Analyzer checks:
- ✅ / ❌ HTTPS encryption
- ✅ / ❌ Contact page presence
- ✅ / ❌ Privacy policy link
- ✅ / ❌ Navigation structure (`<nav>`, `<header>`, `<footer>`)
- ✅ / ❌ About page
- ⚠️ Suspicious TLDs (`.xyz`, `.top`, `.tk`, `.click`, etc.)
- ⚠️ External link ratio (link farms)
- ⚠️ Login / payment form presence

📊 Output: `structure_score` (0–100) + `structure_label` (Good / Moderate / Poor)

### 🟣 Step 5 — Behavior Simulation
The Behavior Analyzer inspects:
- **Redirect count & chain** — Too many redirects = suspicious
- **Load time** — Very slow servers may be overloaded or suspicious
- **Meta-refresh redirects** — Automatic page redirect without user action
- **Obfuscated JavaScript** — `eval()`, `unescape()`, `fromCharCode()` patterns
- **Popup / alert triggers** — `window.open()`, `onbeforeunload`
- **Inline event handler density** — High count is unusual

📊 Output: `behavior_score` (0–100) + `behavior_label` (Normal / Suspicious / Highly Suspicious)

### 🟠 Step 6 — Risk Engine
Combines all three module scores using a weighted formula:

```
Trust Score = (Content × 0.30) + (Structure × 0.40) + (Behavior × 0.30)
```

**Critical Override Flags** (each deducts up to 15 points):
- No HTTPS → −15
- Excessive redirects → −15
- Suspicious TLD → −15
- Obfuscated JavaScript → −15
- High spam keyword count → −15

### 🟤 Step 7 — Output to User
```
Trust Score:    72 / 100
Risk Level:     Medium
Recommendation: Proceed with caution. Avoid sharing personal information.

Issues Found:   ⚠️ No privacy policy detected
                🔴 2 redirects detected
Trust Signals:  ✅ HTTPS encryption enabled
                ✅ Contact page present
                ✅ No spam keywords detected
```

---

## 🛠️ Technologies Used

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.9+** | Core backend language |
| **Flask 3.0** | Web framework and REST API server |
| **Flask-CORS** | Cross-Origin Resource Sharing support |
| **requests** | HTTP client for fetching website data |
| **BeautifulSoup4** | HTML parsing and content extraction |
| **validators** | URL validation before analysis |
| **lxml** | Fast HTML parser (BS4 backend) |

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Semantic page structure |
| **CSS3** | White comic-style design with animations |
| **Vanilla JavaScript** | App logic, API calls, animations |
| **Canvas API** | Animated Trust Score gauge ring |
| **Canvas API** | Particle system (80 dots + cursor trail) |
| **Google Fonts** | Bangers (comic font) + Inter (body font) |

---

## 📁 Project Structure

```
cis/
├── backend/
│   ├── app.py                    # Flask server, /analyze endpoint
│   ├── requirements.txt          # Python dependencies
│   └── analyzers/
│       ├── __init__.py           # Package init
│       ├── content_analyzer.py   # Spam, ad, text quality checks
│       ├── structure_analyzer.py # HTTPS, nav, TLD, link checks
│       ├── behavior_analyzer.py  # Redirects, load time, JS checks
│       └── risk_engine.py        # Weighted scoring + risk assessment
│
├── frontend/
│   ├── index.html                # Main page structure
│   ├── style.css                 # Comic white theme + animations
│   └── app.js                    # App logic + particle system
│
└── README.md                     # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)
- A modern browser (Brave, Chrome, Firefox, Edge)

### 1. Clone or download the project
```bash
# Navigate to the cis project folder
cd cis
```

### 2. Install Python dependencies
```bash
cd backend
pip install flask flask-cors requests beautifulsoup4 validators lxml
```
Or using the requirements file:
```bash
pip install -r requirements.txt
```

---

## ▶️ Running the Application

### Start the Flask server
```bash
cd backend
python app.py
```

You will see:
```
🚀 Smart Website Behavior Analyzer
   Server running at: http://localhost:5000
```

### Open in Browser
Open your browser and navigate to:
```
http://localhost:5000
```

> ⚠️ The Flask server must be running for the analyzer to work. Do not close the terminal.

---

## 📡 API Reference

### `POST /analyze`
Analyzes a website and returns a full trust assessment.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "page_title": "Example Domain",
  "content": {
    "content_score": 80,
    "content_quality": "High",
    "spam_count": 0,
    "spam_words_found": [],
    "ad_signals": 0,
    "word_count": 243,
    "text_ratio": 22.5
  },
  "structure": {
    "structure_score": 60,
    "structure_label": "Moderate",
    "has_https": true,
    "has_nav": false,
    "has_footer": false,
    "has_contact": false,
    "has_about": false,
    "has_privacy": false,
    "has_suspicious_tld": false,
    "external_link_ratio": 100.0,
    "issues": ["No contact page found", "No privacy policy detected"]
  },
  "behavior": {
    "behavior_score": 100,
    "behavior_label": "Normal",
    "redirect_count": 0,
    "redirect_chain": [],
    "load_time_ms": 312,
    "final_status": 200,
    "has_meta_refresh": false,
    "has_obfuscated_js": false,
    "has_popup_triggers": false,
    "issues": []
  },
  "risk": {
    "trust_score": 78,
    "risk_level": "Low",
    "risk_color": "safe",
    "recommendation": "This website appears trustworthy...",
    "critical_flags": [],
    "all_issues": ["⚠️ No contact page found", "⚠️ No privacy policy detected"],
    "strengths": ["✅ HTTPS encryption enabled", "✅ No spam keywords detected", "✅ No redirects"],
    "breakdown": { "content": 80, "structure": 60, "behavior": 100 }
  }
}
```

### `GET /health`
Health check endpoint.
```json
{ "status": "ok", "version": "1.0.0" }
```

---

## 🔬 Analysis Modules

### 📄 Content Analyzer (`content_analyzer.py`)

**Spam Keywords Detected (40+):**
```
"click here", "free", "win", "winner", "congratulations",
"limited offer", "act now", "urgent", "verify your account",
"bank account", "credit card", "prize", "lottery",
"earn money", "make money fast", "get rich", "lose weight",
"miracle", "secret", "you won", "claim your prize" ...
```

**Scoring:**
| Signal | Penalty |
|---|---|
| Each spam keyword found | −5 points (max −50) |
| Each ad signal (iframe/ad script) | −5 points (max −30) |
| Word count < 50 | −20 points |
| Word count 50–150 | −10 points |
| Text ratio < 5% | −15 points |

---

### 🏗️ Structure Analyzer (`structure_analyzer.py`)

**Suspicious TLDs checked:**
`.xyz`, `.top`, `.click`, `.loan`, `.gq`, `.tk`, `.ml`, `.cf`, `.ga`, `.bid`

**Scoring:**
| Signal | Penalty |
|---|---|
| No HTTPS | −40 points |
| No navigation | −10 points |
| No footer | −5 points |
| No contact page | −10 points |
| No privacy policy | −10 points |
| No about page | −5 points |
| Suspicious TLD | −20 points |
| 60%+ external links | −10 points |

---

### 🕵️ Behavior Analyzer (`behavior_analyzer.py`)

**Scoring:**
| Signal | Penalty |
|---|---|
| 6+ redirects | −40 points |
| 4–5 redirects | −25 points |
| 2–3 redirects | −10 points |
| Load time > 5000ms | −15 points |
| Load time > 3000ms | −8 points |
| Meta-refresh detected | −20 points |
| Obfuscated JavaScript | −25 points |
| Popup/alert triggers | −10 points |
| 20+ inline event handlers | −10 points |

---

## 🧠 Trust Score Logic

```python
# Weighted combination
raw_score = (content_score × 0.30) + (structure_score × 0.40) + (behavior_score × 0.30)

# Critical flag penalties (−15 each, max −40 total)
critical_penalty = min(len(critical_flags) × 15, 40)

# Final score
trust_score = max(0, raw_score - critical_penalty)
```

**Risk Level Mapping:**
| Score | Risk Level | Recommendation |
|---|---|---|
| 75 – 100 | 🟢 Low | Safe to browse |
| 50 – 74 | 🟡 Medium | Use with caution |
| 25 – 49 | 🔴 High | Avoid sharing personal info |
| 0 – 24 | 💀 Critical | Do NOT visit this site |

---

## 📊 Sample Output

### Safe Website — `https://github.com`
```
Trust Score:  87 / 100    Risk: 🟢 Low
Content:      75 / 100    Structure: 95 / 100    Behavior: 100 / 100
Trust Signals: ✅ HTTPS, ✅ Contact page, ✅ Privacy policy,
               ✅ No redirects, ✅ Fast load, ✅ No spam keywords
```

### Risky Website — `http://example-phish.tk`
```
Trust Score:  22 / 100    Risk: 💀 Critical
Content:      30 / 100    Structure: 10 / 100    Behavior: 50 / 100
Issues: 🔴 No HTTPS, ⚠️ Suspicious TLD, 🚩 Spam keywords: "win", "free", "claim"
```

---

## 🎯 Real-World Applications

| Use Case | Description |
|---|---|
| 🛒 **E-commerce Safety** | Check if an online store is genuine before purchasing |
| 🎣 **Phishing Detection** | Identify fake bank or login pages |
| 📧 **Email Link Checker** | Verify URLs received in emails or messages |
| 🧒 **Parental Controls** | Check visited sites for inappropriate content signals |
| 🏢 **Corporate Security** | Validate third-party vendor websites |
| 📚 **Education** | Teach students about web security concepts |

---

## 🔐 Privacy & Security

- **No data is stored** — analysis is completely ephemeral (real-time only)
- **No user tracking** — no cookies, no analytics
- **All analysis happens server-side** — the user's IP is never sent to the analyzed site
- **SSL handling** — if HTTPS fails, falls back gracefully with a flag

---

## ⚠️ Limitations

- Some websites (Google, Cloudflare-protected) block automated requests
- Results may vary for very dynamic (JavaScript-heavy) single-page apps
- This tool uses rule-based logic — not a machine learning model
- Not a replacement for professional cybersecurity tools (e.g., VirusTotal)

---

## 🎤 Conclusion

**WebGuard** demonstrates how a full-stack web application can meaningfully improve online safety without requiring expensive infrastructure or complex machine learning. By combining:

- **Content analysis** (what a site says)
- **Structural validation** (how a site is built)
- **Behavior simulation** (how a site acts)

…it produces a **transparent, explainable Trust Score** that helps everyday users make informed decisions about the websites they visit — all in seconds.

---

## 👨‍💻 Project Info

| Field | Details |
|---|---|
| **Project Name** | WebGuard — Smart Website Behavior Analyzer |
| **Type** | Full-Stack Web Application (Academic Project) |
| **Domain** | Cybersecurity / Web Intelligence |
| **Backend** | Python + Flask |
| **Frontend** | HTML + CSS + Vanilla JavaScript |
| **Status** | ✅ Fully Functional |

---

*Built with ❤️ for safer browsing — WebGuard AI*
