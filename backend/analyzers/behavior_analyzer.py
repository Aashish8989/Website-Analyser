import time
import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

MAX_REDIRECTS = 10


def analyze_behavior(url: str, response: requests.Response, soup: BeautifulSoup, elapsed_ms: float) -> dict:
    """Analyze website behavior: redirects, load time, meta-refresh, popups."""
    
    issues = []
    
    # --- Redirect Chain ---
    redirect_chain = []
    for r in response.history:
        redirect_chain.append({
            "url": r.url,
            "status": r.status_code
        })
    redirect_count = len(redirect_chain)

    if redirect_count > 3:
        issues.append(f"Excessive redirects ({redirect_count}) — common in phishing chains")
    elif redirect_count > 1:
        issues.append(f"Multiple redirects detected ({redirect_count})")

    # --- Load Time ---
    load_time_ms = round(elapsed_ms, 0)
    if load_time_ms > 5000:
        issues.append(f"Very slow load time ({load_time_ms}ms) — possibly overloaded or suspicious server")
    elif load_time_ms > 3000:
        issues.append(f"Slow load time ({load_time_ms}ms)")

    # --- Meta Refresh Redirect ---
    meta_refresh = soup.find("meta", attrs={"http-equiv": lambda x: x and x.lower() == "refresh"})
    has_meta_refresh = meta_refresh is not None
    if has_meta_refresh:
        issues.append("Meta-refresh redirect found — page auto-redirects without user interaction")

    # --- Suspicious Script Patterns ---
    scripts = soup.find_all("script")
    script_text = " ".join(s.get_text() for s in scripts if not s.get("src")).lower()
    
    has_obfuscated_js = (
        script_text.count("eval(") > 2 or
        script_text.count("unescape(") > 1 or
        script_text.count("fromcharcode") > 1 or
        script_text.count("atob(") > 2
    )
    if has_obfuscated_js:
        issues.append("Obfuscated JavaScript detected — code is intentionally hidden")

    # --- Popup / Alert Triggers ---
    has_popup_triggers = (
        "window.open(" in script_text or
        "alert(" in script_text or
        "confirm(" in script_text or
        "onbeforeunload" in script_text
    )
    if has_popup_triggers:
        issues.append("Popup or alert triggers found in JavaScript")

    # --- Inline Event Handlers ---
    inline_events = soup.find_all(lambda tag: any(
        attr.startswith("on") for attr in tag.attrs
    ))
    inline_event_count = len(inline_events)
    if inline_event_count > 20:
        issues.append(f"High number of inline event handlers ({inline_event_count}) — unusual for legitimate sites")

    # --- Status Code ---
    final_status = response.status_code
    
    # --- Scoring ---
    behavior_score = 100

    # Redirect penalties
    if redirect_count > 5:
        behavior_score -= 40
    elif redirect_count > 3:
        behavior_score -= 25
    elif redirect_count > 1:
        behavior_score -= 10

    # Load time penalties
    if load_time_ms > 5000:
        behavior_score -= 15
    elif load_time_ms > 3000:
        behavior_score -= 8

    # Other signals
    if has_meta_refresh:
        behavior_score -= 20
    if has_obfuscated_js:
        behavior_score -= 25
    if has_popup_triggers:
        behavior_score -= 10
    if inline_event_count > 20:
        behavior_score -= 10

    behavior_score = max(0, min(100, behavior_score))

    if behavior_score >= 70:
        label = "Normal"
    elif behavior_score >= 40:
        label = "Suspicious"
    else:
        label = "Highly Suspicious"

    return {
        "behavior_score": behavior_score,
        "behavior_label": label,
        "redirect_count": redirect_count,
        "redirect_chain": redirect_chain,
        "load_time_ms": int(load_time_ms),
        "final_status": final_status,
        "has_meta_refresh": has_meta_refresh,
        "has_obfuscated_js": has_obfuscated_js,
        "has_popup_triggers": has_popup_triggers,
        "inline_event_count": inline_event_count,
        "issues": issues
    }
