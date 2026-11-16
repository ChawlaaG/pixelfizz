import urllib.request
import re
import json

domains = ["https://pixelfizz.in/", "https://pixelfizz.co.uk/"]

for base_url in domains:
    req = urllib.request.Request(base_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="replace")
        
        canon_m = re.search(r'rel=[\'"]canonical[\'"]\s+href=[\'"]([^\'"]+)[\'"]', html)
        canonical = canon_m.group(1) if canon_m else None
        
        alts = re.findall(r'hreflang=[\'"]([^\'"]+)[\'"]\s+href=[\'"]([^\'"]+)[\'"]', html)
        
        title_m = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
        title = title_m.group(1).strip() if title_m else None
        
        desc_m = re.search(r'<meta\s+name=[\'"]description[\'"]\s+content=[\'"]([^\'"]+)[\'"]', html)
        desc = desc_m.group(1).strip() if desc_m else None

        og_img_m = re.search(r'<meta\s+property=[\'"]og:image[\'"]\s+content=[\'"]([^\'"]+)[\'"]', html)
        og_img = og_img_m.group(1).strip() if og_img_m else None
        
        # Check if cloaked matrix exists
        has_cloaked = "ai-discovery-matrix" in html
        
        print(f"\n================ {base_url} ================")
        print(f"Title ({len(title) if title else 0} chars): {title}")
        print(f"Desc  ({len(desc) if desc else 0} chars): {desc}")
        print(f"Canonical: {canonical}")
        print(f"Hreflangs: {alts}")
        print(f"OG Image: {og_img}")
        print(f"Cloaked Text Present: {has_cloaked}")

# Also test contact-submit.php on live pixelfizz.in
print("\n--- Testing contact-submit.php on live pixelfizz.in ---")
post_data = urllib.parse.urlencode({
    "name": "Live Test Verification",
    "phone": "+91 99999 99999",
    "service": "Custom E-Commerce Store",
    "budget": "₹1.5L - ₹3L",
    "message": "Automated deployment verification ping."
}).encode("utf-8")

req = urllib.request.Request(
    "https://pixelfizz.in/contact-submit.php",
    data=post_data,
    headers={
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        resp_body = resp.read().decode("utf-8", errors="replace")
        print("Response status:", resp.status)
        print("Response body:", resp_body)
except Exception as e:
    print("contact-submit.php error:", e)
