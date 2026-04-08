from urllib.parse import urlparse
from bs4 import BeautifulSoup


def analyze_structure(soup: BeautifulSoup, url: str) -> dict:
    """Analyze website structure for trust signals."""
    
    parsed = urlparse(url)
    base_domain = parsed.netloc.lower()
    scheme = parsed.scheme.lower()
    
    issues = []
    
    # --- HTTPS Check ---
    has_https = scheme == "https"
    if not has_https:
        issues.append("No HTTPS — connection is not encrypted")

    # --- Navigation Structure ---
    has_nav = bool(soup.find("nav")) or bool(soup.find("header"))
    has_footer = bool(soup.find("footer"))
    if not has_nav:
        issues.append("No navigation structure detected")

    # --- Contact / About / Privacy Links ---
    all_links = [a.get("href", "").lower() for a in soup.find_all("a", href=True)]
    
    has_contact = any("contact" in l or "support" in l for l in all_links)
    has_about = any("about" in l for l in all_links)
    has_privacy = any("privacy" in l or "policy" in l for l in all_links)
    has_terms = any("terms" in l or "tos" in l or "legal" in l for l in all_links)

    if not has_contact:
        issues.append("No contact page found")
    if not has_privacy:
        issues.append("No privacy policy detected")

    # --- Login / Payment Forms ---
    forms = soup.find_all("form")
    has_login_form = False
    has_payment_form = False
    
    for form in forms:
        form_text = str(form).lower()
        inputs = form.find_all("input")
        input_types = [i.get("type", "").lower() for i in inputs]
        input_names = [i.get("name", "").lower() for i in inputs]
        
        if "password" in input_types or "password" in " ".join(input_names):
            has_login_form = True
        if "credit" in form_text or "card" in form_text or "payment" in form_text or "cvv" in form_text:
            has_payment_form = True

    # --- External Link Ratio ---
    total_links = len(all_links)
    external_links = sum(
        1 for a in soup.find_all("a", href=True)
        if a.get("href", "").startswith("http")
        and base_domain not in a.get("href", "")
    )
    external_ratio = round((external_links / max(total_links, 1)) * 100, 1)
    
    if external_ratio > 60 and total_links > 10:
        issues.append(f"High external link ratio ({external_ratio}%) — may be link farm")

    # --- Suspicious TLD ---
    suspicious_tlds = [".xyz", ".top", ".click", ".loan", ".gq", ".tk", ".ml", ".cf", ".ga", ".bid"]
    has_suspicious_tld = any(base_domain.endswith(tld) for tld in suspicious_tlds)
    if has_suspicious_tld:
        issues.append(f"Suspicious domain extension: {base_domain}")

    # --- Scoring ---
    structure_score = 100

    if not has_https:
        structure_score -= 40
    if not has_nav:
        structure_score -= 10
    if not has_footer:
        structure_score -= 5
    if not has_contact:
        structure_score -= 10
    if not has_privacy:
        structure_score -= 10
    if not has_about:
        structure_score -= 5
    if has_suspicious_tld:
        structure_score -= 20
    if external_ratio > 60 and total_links > 10:
        structure_score -= 10

    structure_score = max(0, min(100, structure_score))

    if structure_score >= 70:
        label = "Good"
    elif structure_score >= 40:
        label = "Moderate"
    else:
        label = "Poor"

    return {
        "structure_score": structure_score,
        "structure_label": label,
        "has_https": has_https,
        "has_nav": has_nav,
        "has_footer": has_footer,
        "has_contact": has_contact,
        "has_about": has_about,
        "has_privacy": has_privacy,
        "has_terms": has_terms,
        "has_login_form": has_login_form,
        "has_payment_form": has_payment_form,
        "has_suspicious_tld": has_suspicious_tld,
        "external_link_ratio": external_ratio,
        "total_links": total_links,
        "issues": issues
    }
