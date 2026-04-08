def calculate_trust_score(content: dict, structure: dict, behavior: dict) -> dict:
    """
    Weighted trust score calculation.
    Weights: Content 30% | Structure 40% | Behavior 30%
    """
    
    c_score = content.get("content_score", 50)
    s_score = structure.get("structure_score", 50)
    b_score = behavior.get("behavior_score", 50)

    # Critical overrides — immediate high-risk flags
    critical_flags = []
    
    if not structure.get("has_https"):
        critical_flags.append("No HTTPS encryption")
    
    if behavior.get("redirect_count", 0) > 5:
        critical_flags.append(f"Excessive redirects ({behavior['redirect_count']})")
    
    if structure.get("has_suspicious_tld"):
        critical_flags.append("Suspicious domain extension")
    
    if behavior.get("has_obfuscated_js"):
        critical_flags.append("Obfuscated JavaScript present")
    
    if content.get("spam_count", 0) > 10:
        critical_flags.append(f"High spam keyword density ({content['spam_count']} keywords)")

    # Weighted score
    trust_score = round(c_score * 0.30 + s_score * 0.40 + b_score * 0.30)

    # Apply critical flag penalty
    critical_penalty = min(len(critical_flags) * 15, 40)
    trust_score = max(0, trust_score - critical_penalty)

    # Risk Level
    if trust_score >= 75:
        risk_level = "Low"
        risk_color = "safe"
        recommendation = "This website appears trustworthy. You can browse safely, but always stay cautious with personal data."
    elif trust_score >= 50:
        risk_level = "Medium"
        risk_color = "warning"
        recommendation = "This website shows some suspicious signals. Proceed with caution — avoid entering personal or financial information."
    elif trust_score >= 25:
        risk_level = "High"
        risk_color = "danger"
        recommendation = "This website shows multiple red flags. We strongly advise against sharing any personal information or making purchases."
    else:
        risk_level = "Critical"
        risk_color = "critical"
        recommendation = "This website exhibits characteristics of a scam or phishing site. Do NOT visit or interact with this site."

    # Collect all issues
    all_issues = (
        [f"⚠️ {i}" for i in structure.get("issues", [])] +
        [f"🔴 {i}" for i in behavior.get("issues", [])]
    )
    if content.get("spam_words_found"):
        all_issues.insert(0, f"🚩 Spam keywords: {', '.join(content['spam_words_found'][:5])}")

    # Strengths
    strengths = []
    if structure.get("has_https"):
        strengths.append("✅ HTTPS encryption enabled")
    if structure.get("has_contact"):
        strengths.append("✅ Contact page present")
    if structure.get("has_privacy"):
        strengths.append("✅ Privacy policy found")
    if behavior.get("redirect_count", 0) == 0:
        strengths.append("✅ No redirects — direct connection")
    if behavior.get("load_time_ms", 9999) < 1500:
        strengths.append("✅ Fast loading page")
    if content.get("spam_count", 99) == 0:
        strengths.append("✅ No spam keywords detected")
    if structure.get("has_nav"):
        strengths.append("✅ Proper navigation structure")

    return {
        "trust_score": trust_score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "recommendation": recommendation,
        "critical_flags": critical_flags,
        "all_issues": all_issues,
        "strengths": strengths,
        "breakdown": {
            "content": round(c_score),
            "structure": round(s_score),
            "behavior": round(b_score)
        }
    }
