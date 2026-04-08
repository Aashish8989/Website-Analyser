import re
from bs4 import BeautifulSoup

# Comprehensive list of spam/phishing/scam keywords
SPAM_KEYWORDS = [
    "click here", "free", "win", "winner", "congratulations", "you have been selected",
    "limited offer", "act now", "urgent", "verify your account", "confirm your account",
    "suspended", "login immediately", "update your information", "social security",
    "bank account", "credit card", "prize", "lottery", "100% free", "risk free",
    "no cost", "earn money", "make money fast", "work from home", "get rich",
    "buy now", "order now", "special promotion", "exclusive deal", "cheap",
    "discount", "offer expires", "hurry", "last chance", "once in a lifetime",
    "guarantee", "no obligation", "satisfaction guaranteed", "incredible deal",
    "double your", "lose weight", "miracle", "secret", "hidden", "forbidden",
    "unclaimed", "claim your", "you won", "selected winner", "cash prize",
    "investment opportunity", "100% satisfied", "as seen on"
]

AD_TAGS = ["iframe", "ins"]
AD_NETWORK_DOMAINS = [
    "doubleclick", "googlesyndication", "adservice", "adnxs", "taboola",
    "outbrain", "revcontent", "mgid", "ads.", "banner", "popup", "popunder"
]


def analyze_content(soup: BeautifulSoup, raw_html: str) -> dict:
    """Analyze page content for spam, ads, and content quality."""
    
    # Extract visible text
    body = soup.find("body")
    if body:
        for tag in body(["script", "style", "noscript", "meta"]):
            tag.decompose()
        text = body.get_text(separator=" ", strip=True)
    else:
        text = soup.get_text(separator=" ", strip=True)
    
    text_lower = text.lower()
    
    # --- Spam Keyword Detection ---
    spam_found = []
    for kw in SPAM_KEYWORDS:
        if kw.lower() in text_lower:
            spam_found.append(kw)
    spam_count = len(spam_found)

    # --- Ad Density Check ---
    ad_tag_count = sum(len(soup.find_all(tag)) for tag in AD_TAGS)
    script_tags = soup.find_all("script", src=True)
    ad_script_count = sum(
        1 for s in script_tags
        if any(ad in (s.get("src") or "").lower() for ad in AD_NETWORK_DOMAINS)
    )
    total_ad_signals = ad_tag_count + ad_script_count

    # --- Text-to-HTML Ratio ---
    html_len = max(len(raw_html), 1)
    text_len = len(text)
    text_ratio = round((text_len / html_len) * 100, 2)

    # --- Content Length ---
    word_count = len(text.split())

    # --- Scoring ---
    content_score = 100

    # Spam penalty: -5 per spam word, up to -50
    content_score -= min(spam_count * 5, 50)

    # Ad penalty: -5 per ad signal, up to -30
    content_score -= min(total_ad_signals * 5, 30)

    # Low content penalty
    if word_count < 50:
        content_score -= 20
    elif word_count < 150:
        content_score -= 10

    # Very low text ratio (mostly code/ads, little real text)
    if text_ratio < 5:
        content_score -= 15
    elif text_ratio < 10:
        content_score -= 5

    content_score = max(0, min(100, content_score))

    # Quality label
    if content_score >= 70:
        quality = "High"
    elif content_score >= 40:
        quality = "Medium"
    else:
        quality = "Low"

    return {
        "content_score": content_score,
        "content_quality": quality,
        "spam_words_found": spam_found[:10],  # Top 10 for display
        "spam_count": spam_count,
        "ad_signals": total_ad_signals,
        "word_count": word_count,
        "text_ratio": text_ratio
    }
