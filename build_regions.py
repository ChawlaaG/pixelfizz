#!/usr/bin/env python3
"""
PixelFizz True Dual-Region Build Engine
Compiles the master template source into two separate, domain-pure distributions:
  - dist/in/ (for https://pixelfizz.in - Manish Chawla, India)
  - dist/uk/ (for https://pixelfizz.co.uk - Punit, United Kingdom)

Guarantees 100% server-side HTML accuracy for Googlebot, Bingbot, and AI crawlers:
  - Zero client-side canonical hacks.
  - Perfect self-referential canonicals & bidirectional hreflang tags on raw initial response.
  - Domain-pure JSON-LD schemas, phone numbers, WhatsApp links, and currencies.
  - Zero cloaking, zero broken links, and production .htaccess with GZIP/cache headers.
"""

import os
import shutil
import re
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
DIST = ROOT / "dist"
DIST_IN = DIST / "in"
DIST_UK = DIST / "uk"

def clean_dist():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST_IN.mkdir(parents=True, exist_ok=True)
    DIST_UK.mkdir(parents=True, exist_ok=True)
    print("Cleaned and initialized dist/in and dist/uk.")

# Helper to generate production .htaccess
def generate_htaccess(domain):
    escaped_domain = re.escape(domain)
    return rf"""# ----------------------------------------------------------------------
# PIXELFIZZ PRODUCTION .HTACCESS [{domain.upper()}]
# ----------------------------------------------------------------------

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. Enforce HTTPS
  RewriteCond %{{HTTPS}} !=on
  RewriteRule ^(.*)$ https://{domain}/$1 [R=301,L]

  # 2. Enforce Non-WWW (Canonical Host)
  RewriteCond %{{HTTP_HOST}} ^www\\.{escaped_domain}$ [NC]
  RewriteRule ^(.*)$ https://{domain}/$1 [R=301,L]

  # 3. Strip /index.html to clean directory URLs
  RewriteCond %{{THE_REQUEST}} ^[A-Z]{{3,9}}\\ /index\\.html\\ HTTP/
  RewriteRule ^index\\.html$ / [R=301,L]

  RewriteCond %{{THE_REQUEST}} ^[A-Z]{{3,9}}\\ /services/([^/]+)/index\\.html\\ HTTP/
  RewriteRule ^services/([^/]+)/index\\.html$ /services/$1/ [R=301,L]

  RewriteCond %{{THE_REQUEST}} ^[A-Z]{{3,9}}\\ /work/([^/]+)/index\\.html\\ HTTP/
  RewriteRule ^work/([^/]+)/index\\.html$ /work/$1/ [R=301,L]
</IfModule>

# 4. Block Direct Access to Sensitive Files & Folders
<FilesMatch "(^\.git|^\.env|deploy\.json|composer\.json|package\.json|\.md$|\.py$|\.log$|hostinger_vault\.json)">
  Order allow,deny
  Deny from all
</FilesMatch>

RedirectMatch 403 ^/storage/.*$
RedirectMatch 403 ^/api/.*\.js$

# 5. Production Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

# 6. Gzip / Deflate Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript
  AddOutputFilterByType DEFLATE application/javascript application/x-javascript application/json application/xml
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# 7. Browser Caching Headers (mod_expires)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
"""

# Helper to generate robots.txt
def generate_robots(domain):
    return f"""User-agent: *
Allow: /
Disallow: /api/
Disallow: /storage/

Sitemap: https://{domain}/sitemap.xml

User-agent: PerplexityBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /
"""

# Specific SEO titles and meta descriptions per region
META_REGIONAL = {
    "in": {
        "index.html": {
            "title": "PixelFizz | Fast Websites, Stores & AI Tools in India",
            "desc": "PixelFizz builds ultra-fast Next.js websites, headless stores & AI tools for brands in Vapi, Surat, Mumbai, Delhi NCR & Pan-India. 95+ speed guaranteed."
        },
        "nextjs-development": {
            "title": "Next.js Web Development Agency | PixelFizz India",
            "desc": "High-performance React & Next.js web application engineering in India. Zero bloat, SSR edge-rendering & 95+ Core Web Vitals for scaling brands."
        },
        "ecommerce-boutiques": {
            "title": "Custom E-Commerce & Shopify Boutiques | PixelFizz India",
            "desc": "Custom headless e-commerce stores, Razorpay payment checkouts & automated COD verification for Indian D2C brands. Sub-second load times."
        },
        "custom-api-integrations": {
            "title": "Custom API & Database Integrations | PixelFizz India",
            "desc": "REST & GraphQL API design, CRM automation & payment gateway middleware pipelines for Indian enterprises. Eliminate data latency."
        },
        "ai-automations-agents": {
            "title": "AI Voice & Chat Automations | PixelFizz India",
            "desc": "Autonomous 24/7 AI voice and chat agents for appointment booking and lead triage. Integrated with Twilio, WhatsApp & CRM pipelines."
        },
        "performance-marketing": {
            "title": "Performance Marketing & PPC Funnels | PixelFizz India",
            "desc": "Data-driven Meta, Google & LinkedIn advertising funnels engineered with sub-second landing pages for maximum commercial ROI in India."
        },
        "mobile-apps": {
            "title": "Flutter Mobile App Development | PixelFizz India",
            "desc": "Cross-platform iOS & Android mobile application development in Flutter. Offline-first architectures, biometric security & Play Store publishing."
        },
        "saas-erp-systems": {
            "title": "Custom ERP & SaaS Software Engineering | PixelFizz India",
            "desc": "Bespoke business management ERP, touch POS & inventory control software tailored to your workflows. Eliminate spreadsheet bottlenecks."
        },
        "seo-geo-optimization": {
            "title": "Technical SEO & AI Engine Optimization | PixelFizz India",
            "desc": "Get ranked on Google Search and cited by ChatGPT & Gemini. Structured JSON-LD schema, speed audits & generative engine optimization."
        },
        "branding-corporate-identity": {
            "title": "Branding & Corporate Identity Design | PixelFizz India",
            "desc": "Strategic logo systems, typography scales & cohesive visual brand identity guidelines for scaling enterprises across India."
        },
        "cto-as-a-service": {
            "title": "Virtual CTO & Technical Consulting | PixelFizz India",
            "desc": "Fractional CTO advisory, software architecture due diligence & technical audits for founders making high-stakes technology investments."
        },
        "web3-blockchain-iot": {
            "title": "Web3, Blockchain & IoT Engineering | PixelFizz India",
            "desc": "Secure EVM smart contracts, decentralized app portals & IoT sensor telemetry pipelines engineered with hardened security."
        }
    },
    "uk": {
        "index.html": {
            "title": "PixelFizz UK | High-Speed Websites, E-Commerce & AI",
            "desc": "PixelFizz engineers high-performance Next.js websites, headless stores & AI tools for UK brands in Winchester, Hampshire & London. 95+ speed."
        },
        "nextjs-development": {
            "title": "Next.js Web Development Agency | PixelFizz UK",
            "desc": "High-performance React & Next.js engineering in Winchester & London, UK. Zero bloat, edge SSR & 95+ Core Web Vitals for British enterprises."
        },
        "ecommerce-boutiques": {
            "title": "Headless E-Commerce & Shopify Studio | PixelFizz UK",
            "desc": "Bespoke headless e-commerce boutiques and custom Shopify storefronts for UK brands. Fast checkout, Stripe billing & zero theme bloat."
        },
        "custom-api-integrations": {
            "title": "Custom API & Systems Integration | PixelFizz UK",
            "desc": "REST & GraphQL API design, CRM automation & database middleware development for UK businesses. Secure and GDPR-compliant."
        },
        "ai-automations-agents": {
            "title": "AI Voice & Telephony Automations | PixelFizz UK",
            "desc": "Autonomous 24/7 AI voice agents and customer concierge workflows for UK clinics & service providers. Twilio, Claude & ElevenLabs."
        },
        "performance-marketing": {
            "title": "Performance Marketing & PPC Studio | PixelFizz UK",
            "desc": "Data-driven Google Ads & Meta advertising funnels built with high-speed landing pages to maximize customer acquisition ROI in the UK."
        },
        "mobile-apps": {
            "title": "Cross-Platform Mobile App Studio | PixelFizz UK",
            "desc": "Custom Flutter mobile app engineering for iOS & Android. Offline-first architectures, enterprise portals & App Store publishing across the UK."
        },
        "saas-erp-systems": {
            "title": "Custom SaaS & Business Software | PixelFizz UK",
            "desc": "Tailored cloud ERP, team management portals & workflow software engineered for UK SMEs. Built on modern Postgres & cloud VPS."
        },
        "seo-geo-optimization": {
            "title": "Technical SEO & Generative AI Optimization | PixelFizz UK",
            "desc": "Technical Search Engine Optimization & GEO in the UK. Get ranked in Google Search and referenced by ChatGPT, Gemini & Perplexity."
        },
        "branding-corporate-identity": {
            "title": "Corporate Brand Identity & Design | PixelFizz UK",
            "desc": "Architectural brand identity, distinctive logo marks & design guidelines engineered for high-trust UK commercial enterprises."
        },
        "cto-as-a-service": {
            "title": "Virtual CTO & Technical Advisory | PixelFizz UK",
            "desc": "Fractional CTO consulting, software vendor due diligence & system architecture audits for UK business leaders in Winchester & London."
        },
        "web3-blockchain-iot": {
            "title": "Web3, Blockchain & IoT Engineering | PixelFizz UK",
            "desc": "Secure smart contract architecture, decentralized portals & hardware IoT telemetry systems for forward-thinking UK businesses."
        }
    }
}

def transform_html(html, rel_path, region):
    domain = "pixelfizz.co.uk" if region == "uk" else "pixelfizz.in"
    other_domain = "pixelfizz.in" if region == "uk" else "pixelfizz.co.uk"
    lang = "en-GB" if region == "uk" else "en-IN"
    
    # 1. Update <html lang="...">
    html = re.sub(r'<html\s+lang=["\'][^"\']*["\']', f'<html lang="{lang}"', html)
    html = re.sub(r'<html\b(?!\s+lang)', f'<html lang="{lang}"', html)

    # 2. Derive canonical path
    # rel_path is e.g. "index.html", "services/nextjs-development/index.html", "work/kagrecha-realty/index.html"
    clean_path = rel_path.replace("index.html", "")
    if clean_path and not clean_path.endswith("/"):
        clean_path += "/"
    self_canonical = f"https://{domain}/{clean_path}"

    # Replace Canonical Tag in static HTML
    canonical_tag = f'<link rel="canonical" href="{self_canonical}" />'
    if '<link rel="canonical"' in html:
        html = re.sub(r'<link\s+rel=["\']canonical["\'][^>]*>', canonical_tag, html)
    else:
        html = html.replace('</head>', f'  {canonical_tag}\n</head>')

    # 3. Ensure Bidirectional Hreflangs
    hreflang_in = f"https://pixelfizz.in/{clean_path}"
    hreflang_uk = f"https://pixelfizz.co.uk/{clean_path}"
    
    hreflang_block = f"""  <link rel="alternate" hreflang="en-IN" href="{hreflang_in}" />
  <link rel="alternate" hreflang="en-GB" href="{hreflang_uk}" />
  <link rel="alternate" hreflang="x-default" href="{hreflang_in}" />"""
    
    # Replace existing hreflangs or insert
    html = re.sub(r'<link\s+rel=["\']alternate["\']\s+hreflang=["\'][^"\']*["\'][^>]*>\s*', '', html)
    html = html.replace(canonical_tag, canonical_tag + "\n" + hreflang_block)

    # 4. Regional Title & Description Replacement
    key = "index.html" if rel_path == "index.html" else rel_path.split("/")[1]
    if key in META_REGIONAL[region]:
        meta_info = META_REGIONAL[region][key]
        html = re.sub(r'<title>.*?</title>', f'<title>{meta_info["title"]}</title>', html)
        html = re.sub(r'<meta\s+name=["\']description["\']\s+content=["\'][^"\']*["\']\s*/?>',
                      f'<meta name="description" content="{meta_info["desc"]}" />', html)
        html = re.sub(r'<meta\s+property=["\']og:title["\']\s+content=["\'][^"\']*["\']\s*/?>',
                      f'<meta property="og:title" content="{meta_info["title"]}" />', html)
        html = re.sub(r'<meta\s+property=["\']og:description["\']\s+content=["\'][^"\']*["\']\s*/?>',
                      f'<meta property="og:description" content="{meta_info["desc"]}" />', html)
        html = re.sub(r'<meta\s+name=["\']twitter:title["\']\s+content=["\'][^"\']*["\']\s*/?>',
                      f'<meta name="twitter:title" content="{meta_info["title"]}" />', html)
        html = re.sub(r'<meta\s+name=["\']twitter:description["\']\s+content=["\'][^"\']*["\']\s*/?>',
                      f'<meta name="twitter:description" content="{meta_info["desc"]}" />', html)

    # 5. Open Graph & Twitter URL and Image Replacement
    og_img = f"https://{domain}/assets/og-uk.jpg" if region == "uk" else f"https://{domain}/assets/og-default.jpg"
    html = re.sub(r'<meta\s+property=["\']og:url["\']\s+content=["\'][^"\']*["\']\s*/?>',
                  f'<meta property="og:url" content="{self_canonical}" />', html)
    html = re.sub(r'<meta\s+name=["\']twitter:url["\']\s+content=["\'][^"\']*["\']\s*/?>',
                  f'<meta name="twitter:url" content="{self_canonical}" />', html)
    html = re.sub(r'<meta\s+property=["\']og:image["\']\s+content=["\'][^"\']*["\']\s*/?>',
                  f'<meta property="og:image" content="{og_img}" />', html)
    html = re.sub(r'<meta\s+name=["\']twitter:image["\']\s+content=["\'][^"\']*["\']\s*/?>',
                  f'<meta name="twitter:image" content="{og_img}" />', html)

    # 6. Regional Contact & Copy Replacement
    if region == "uk":
        # Phone
        html = html.replace('+91 78780 39395', '+44 7767 196624')
        html = html.replace('+917878039395', '+447767196624')
        html = html.replace('tel:+917878039395', 'tel:+447767196624')
        # WhatsApp
        html = html.replace('wa.me/917878039395', 'wa.me/447767196624')
        # Email
        html = html.replace('hello@pixelfizz.in', 'hello@pixelfizz.co.uk')
        # Hero Badge & Trust
        html = html.replace('Vapi, India &amp; Winchester, UK', 'Winchester, UK &amp; Europe')
        html = html.replace('across India, the UK &amp; beyond', 'across the UK, Europe &amp; beyond')
        html = html.replace('across India &amp; beyond', 'across the UK, Europe &amp; beyond')
        # Partner / Lead Name in Estimator & Forms
        html = html.replace('Manish Chawla', 'Punit (UK Lead)')
        # Currency & Budget dropdowns
        html = html.replace('₹1,50,000 – ₹3,00,000', '£1,750 – £3,500')
        html = html.replace('₹3,00,000 – ₹6,00,000', '£3,500 – £7,000')
        html = html.replace('₹6,00,000+', '£7,000+')
        html = html.replace('₹1,50,000+', '£1,750+')
        html = html.replace('₹', '£')
        # Schema Address & Phone
        html = html.replace('"https://pixelfizz.in/#organization"', '"https://pixelfizz.co.uk/#organization"')
        html = html.replace('"https://pixelfizz.in"', '"https://pixelfizz.co.uk"')
        html = html.replace('"telephone": "+917878039395"', '"telephone": "+447767196624"')
        html = html.replace('"email": "hello@pixelfizz.in"', '"email": "hello@pixelfizz.co.uk"')
        html = html.replace('"addressCountry": "IN"', '"addressCountry": "GB"')
        html = html.replace('"addressLocality": "Vapi"', '"addressLocality": "Winchester"')
        html = html.replace('"addressRegion": "Gujarat"', '"addressRegion": "Hampshire"')
    else:
        # India build replacements
        html = html.replace('hello@pixelfizz.co.uk', 'hello@pixelfizz.in')
        html = html.replace('+44 7767 196624', '+91 78780 39395')
        html = html.replace('+447767196624', '+917878039395')
        html = html.replace('wa.me/447767196624', 'wa.me/917878039395')
        html = html.replace('Winchester, UK &amp; Vapi, India', 'Vapi, India &amp; Global')

    # 7. Set data-domain on <html>
    html = re.sub(r'<html\s+([^>]*)data-domain=["\'][^"\']*["\']', r'<html \1', html)
    html = html.replace('<html', f'<html data-domain="{region}"')

    return html

def build_all():
    clean_dist()

    # 1. Copy static assets & scripts to both distributions
    for target_dir, domain, region in [(DIST_IN, "pixelfizz.in", "in"), (DIST_UK, "pixelfizz.co.uk", "uk")]:
        print(f"\n--- Building {domain} [{region.upper()}] ---")

        # Copy assets folder
        shutil.copytree(ROOT / "assets", target_dir / "assets", dirs_exist_ok=True)
        # Copy style.css, main.js, domain-config.js, contact-submit.php, llms.txt, sitemap.xml
        for f in ["style.css", "main.js", "domain-config.js", "contact-submit.php", "llms.txt", "sitemap.xml"]:
            if (ROOT / f).exists():
                shutil.copy2(ROOT / f, target_dir / f)

        # Generate custom domain-specific .htaccess and robots.txt
        (target_dir / ".htaccess").write_text(generate_htaccess(domain), encoding="utf-8")
        (target_dir / "robots.txt").write_text(generate_robots(domain), encoding="utf-8")

        # Process HTML files: index.html, services/*/index.html, work/*/index.html
        html_files = [ROOT / "index.html"] + list((ROOT / "services").glob("*/index.html")) + list((ROOT / "work").glob("*/index.html"))
        
        for src_file in html_files:
            rel = src_file.relative_to(ROOT)
            dest_file = target_dir / rel
            dest_file.parent.mkdir(parents=True, exist_ok=True)

            raw_html = src_file.read_text(encoding="utf-8")
            processed_html = transform_html(raw_html, rel.as_posix(), region)
            
            # UK Work Grid Shuffling in static HTML:
            # If on UK build and building index.html, elevate UK/Europe projects to top of work-grid
            if region == "uk" and rel.as_posix() == "index.html":
                # Find work-grid and elevate UK cards
                work_grid_match = re.search(r'(<div class="work-grid">)([\s\S]*?)(</div>\s*</section>)', processed_html)
                if work_grid_match:
                    start_tag, cards_html, end_tag = work_grid_match.groups()
                    card_blocks = re.findall(r'<a\s+class="work-card\b[^"]*"[\s\S]*?</a>', cards_html)
                    uk_cards = []
                    other_cards = []
                    for c in card_blocks:
                        if 'data-region="uk"' in c or 'data-region="europe"' in c or 'Winchester' in c or 'Claims' in c or 'Connaught' in c or 'Pharma' in c:
                            uk_cards.append(c)
                        else:
                            other_cards.append(c)
                    reordered_cards = "\n        ".join(uk_cards + other_cards)
                    processed_html = processed_html.replace(cards_html, "\n        " + reordered_cards + "\n      ")
                    print("  [UK Static Optimization] Elevated UK & European flagship case studies to top of portfolio.")

            dest_file.write_text(processed_html, encoding="utf-8")
            print(f"  Generated: {dest_file.relative_to(DIST).as_posix()}")

    print("\n✅ True Dual-Region Build Complete!")
    print(f"  India Build: {DIST_IN} (Domain: pixelfizz.in)")
    print(f"  UK Build:    {DIST_UK} (Domain: pixelfizz.co.uk)")

if __name__ == "__main__":
    build_all()
