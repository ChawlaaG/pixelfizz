# PixelFizz - Context & Chronological Work Log

> **Last Updated**: 2026-11-16 11:00:00  
> **Status**: Active / Production Verified  

---

## 📌 1. Project Overview & Business Goals
PixelFizz is a boutique digital engineering and design agency founded by Manish Chawla (India) and Punit (UK). The studio engineers ultra-fast, high-converting websites, bespoke D2C e-commerce stores, custom API/SaaS platforms, and intelligent AI voice/automation agents.

### Core Business Objectives:
- **Dual-Market Authority**: Seamless regional positioning serving both Indian founders/enterprises (`pixelfizz.in`) and UK/European SMEs (`pixelfizz.co.uk`) with localized currencies, leadership contacts, schemas, and case study emphasis.
- **Organic Inbound Lead Engine**: High-ranking technical SEO across 11 high-intent service hubs and 6 flagship engineering case studies with semantic schema markup, regional hreflang, zero-CLS performance, and high-converting interactive estimators.
- **Zero-Failure Inquiries**: Bulletproof server-side lead dispatch via `contact-submit.php` combining email delivery, instant WhatsApp routing, and local JSON lead backups.

---

## 🛠️ 2. Tech Stack & Environment
- **Frontend Architecture**: Modern Semantic HTML5, Vanilla CSS3 (custom CSS variables, responsive bento grids, modal drawer, interactive FAQ accordions), Vanilla JavaScript (lightweight interactive concierge, custom cursor, smooth tab filtering, AJAX lead capture). Zero bloated frameworks.
- **Backend / Processing**: PHP 8.2 on Hostinger LiteSpeed/Apache. `contact-submit.php` handles POST validation, honeypot spam traps, IP rate-limiting, and dual-channel notifications (email + WhatsApp + `storage/leads.json`).
- **Build Pipeline**: Custom Python multi-region compiler (`build_regions.py`) producing static distributions (`dist/in/` and `dist/uk/`) with domain-pure canonicals, hreflang annotations, localized titles/descriptions, and regional JSON-LD schemas.
- **Hosting & Infrastructure**:
  - **Server**: Hostinger Cloud (`217.21.84.159:65002`), User `u410477256`.
  - **India Webroot**: `/home/u410477256/domains/pixelfizz.in/public_html`
  - **UK Webroot**: `/home/u410477256/domains/pixelfizz.co.uk/public_html`
  - **Credential Vault**: Centralized in `C:\Users\manis\.antigravity\hostinger_vault.json` (zero secrets in repo).
  - **Backups**: Automated pre-deploy remote tarballs in `/home/u410477256/backups/`.

---

## 🏗️ 3. Architecture & Key Files

### Core Build & Deployment Tools
- [build_regions.py](file:///F:/Client%20Projects/PixelFizz/build_regions.py): Generates `dist/in` and `dist/uk` with localized meta tags, schemas, and re-ordered portfolio items.
- [validate_dist.py](file:///F:/Client%20Projects/PixelFizz/validate_dist.py): Automated 36-page SEO validator checking title lengths, description lengths, canonicals, hreflang, Open Graph, and schemas.
- [deploy_dual_domains.py](file:///F:/Client%20Projects/PixelFizz/deploy_dual_domains.py): Automated 5-Guard deployment script executing remote backups, .git purging, SFTP sync, permission hardening, and live smoke testing.
- [deploy.json](file:///F:/Client%20Projects/PixelFizz/deploy.json): Safe-deploy configuration manifest.

### Source Assets & Logic
- [index.html](file:///F:/Client%20Projects/PixelFizz/index.html): Flagship homepage template with 36 portfolio items (semantic `<h3>`), real branding links, and embedded lead form.
- [style.css](file:///F:/Client%20Projects/PixelFizz/style.css): Performance-optimized stylesheet (non-blocking font loader, drawer modal, FAQ accordions, lead form styles).
- [main.js](file:///F:/Client%20Projects/PixelFizz/main.js): Interactive Project Estimator concierge, portfolio filter without CLS shuffle, and AJAX lead form handler.
- [contact-submit.php](file:///F:/Client%20Projects/PixelFizz/contact-submit.php): Hardened PHP lead handler with honeypot, rate limiting, and WhatsApp URL generation.
- [llms.txt](file:///F:/Client%20Projects/PixelFizz/llms.txt): Authoritative AI crawler manifest documenting agency capabilities and regional contacts.
- [sitemap.xml](file:///F:/Client%20Projects/PixelFizz/sitemap.xml): 36-URL bidirectional sitemap with `xhtml:link` hreflang annotations.

### Flagship Case Studies (`work/*/index.html`)
- [kagrecha-realty](file:///F:/Client%20Projects/PixelFizz/work/kagrecha-realty/index.html): 926-property instant search & WhatsApp real estate portal.
- [sajraah-menswear](file:///F:/Client%20Projects/PixelFizz/work/sajraah-menswear/index.html): Bespoke D2C e-commerce store with Razorpay, COD, and programmatic SEO.
- [winchester-health-centre](file:///F:/Client%20Projects/PixelFizz/work/winchester-health-centre/index.html): UK private clinic & travel vaccination booking portal.
- [dm-claims-ireland](file:///F:/Client%20Projects/PixelFizz/work/dm-claims-ireland/index.html): Ireland loss assessor portal with interactive fee calculator.
- [guldaar-valley](file:///F:/Client%20Projects/PixelFizz/work/guldaar-valley/index.html): Next.js luxury wilderness resort showcase.
- [voice-ai-telephony](file:///F:/Client%20Projects/PixelFizz/work/voice-ai-telephony/index.html): 24/7 AI voice and telephony booking agent.

### Specialized Service Hubs (`services/*/index.html`)
- `ecommerce-boutiques/`: Custom D2C E-Commerce Development.
- `ai-automations-agents/`: AI Voice Agents, Chatbots & Autonomous Workflows.
- `nextjs-development/`: High-Performance Headless Web Apps.
- `saas-erp-systems/`: Enterprise SaaS Platforms & Custom Portals.
- `mobile-apps/`: React Native & Cross-Platform Mobile Apps.
- `seo-geo-optimization/`: Programmatic & Technical Organic SEO.
- `branding-corporate-identity/`: Brand Systems & Visual Design.
- `custom-api-integrations/`: Payment Gateways & CRM Webhooks.
- `cto-as-a-service/`: Fractional CTO & Architecture Leadership.
- `performance-marketing/`: High-ROI Paid Acquisition & CRO.
- `web3-blockchain-iot/`: Smart Contracts, Web3 & Edge IoT.

---

## 🕒 4. Chronological Work Log (Latest on Top)

### 📅 2026-11-16 11:00:00 - Complete Dual-Domain Technical SEO & Architecture Upgrade
- **Goal / Request**: Execute a complete Technical SEO, True Dual-Domain Separation (`pixelfizz.in` for Manish in India vs `pixelfizz.co.uk` for Punit in the UK), Portfolio Case Study overhaul, and Organic Lead Conversion upgrade.
- **What Was Done**:
  1. **Spam & Security Cleanup**: Permanently deleted the hidden/cloaked 1px text `<section id="ai-discovery-matrix">` from `index.html`. Removed broken serverless `/api/chat.js` and purged exposed `.git/` folder from remote Hostinger webroots.
  2. **Interactive Project Estimator**: Replaced the failing chat widget with a 3-step interactive Project Estimator & WhatsApp Concierge (Service -> Budget Tier -> Contact -> Instant WhatsApp / Form submission).
  3. **Dual-Region Compilation Pipeline (`build_regions.py`)**: Built an automated static compiler that splits templates into `dist/in` and `dist/uk`. Injected 100% server-side pure canonicals, bidirectional hreflang tags (`en-IN`, `en-GB`, `x-default`), localized meta tags (<= 60 char titles, 120-155 char descriptions), localized JSON-LD schemas (`Organization`, `ProfessionalService`, `WebSite`), and domain-specific `.htaccess` & `robots.txt`.
  4. **Brand Assets & Social Cards**: Generated crisp SVGs and WebP assets (`logo.svg`, `favicon.svg`, `logo.png`, `apple-touch-icon.png`, `og-default.jpg`, `og-uk.jpg`) with complete Open Graph and Twitter Card tags.
  5. **Core Web Vitals Optimization**: Removed render-blocking `@import` from `style.css`, switched to non-blocking Google Fonts loading with `defer` on scripts, and eliminated initial page load CLS shuffle.
  6. **Flagship Case Studies**: Built 6 dedicated case study landing pages under `work/*/` with metrics bars, challenge/solution architecture, `Article` schema, and embedded inquiry forms. Upgraded all 36 work titles to semantic `<h3>` tags and fixed all 4 broken staging links.
  7. **Service Hub Enrichment**: Upgraded all 11 service pages with breadcrumb navigation, `Service` + `BreadcrumbList` + `FAQPage` schemas, 4-question interactive FAQ accordions, and featured case study links.
  8. **Hardened Lead Capture**: Created `contact-submit.php` with honeypot detection, IP rate limiting, `storage/leads.json` logging, email dispatch, and instant WhatsApp deep linking. Embedded the inquiry form across `#contact`, case studies, and service pages.
  9. **Hostinger Safe Deployment**: Created automated pre-deploy backups in `/home/u410477256/backups/`, purged exposed `.git/` on `.co.uk`, synchronized `dist/in/` and `dist/uk/` via SFTP, hardened permissions (0755/0644), and verified live HTTP 200/301 responses.
- **Files Modified / Created**:
  - [build_regions.py](file:///F:/Client%20Projects/PixelFizz/build_regions.py)
  - [deploy_dual_domains.py](file:///F:/Client%20Projects/PixelFizz/deploy_dual_domains.py)
  - [validate_dist.py](file:///F:/Client%20Projects/PixelFizz/validate_dist.py)
  - [contact-submit.php](file:///F:/Client%20Projects/PixelFizz/contact-submit.php)
  - [main.js](file:///F:/Client%20Projects/PixelFizz/main.js)
  - [style.css](file:///F:/Client%20Projects/PixelFizz/style.css)
  - [index.html](file:///F:/Client%20Projects/PixelFizz/index.html)
  - [llms.txt](file:///F:/Client%20Projects/PixelFizz/llms.txt)
  - [sitemap.xml](file:///F:/Client%20Projects/PixelFizz/sitemap.xml)
  - [PROJECT_CONTEXT.md](file:///F:/Client%20Projects/PixelFizz/PROJECT_CONTEXT.md)
  - 6 Case Studies in `work/*/index.html`
  - 11 Service Hubs in `services/*/index.html`
  - Brand assets in `assets/*`
- **Key Decisions / Technical Notes**:
  - Hostinger webroot runs Apache/LiteSpeed, not Node serverless; hence PHP was selected for lead handling and client-side logic for the estimator.
  - Multi-region compilation was chosen over client-side JavaScript domain swapping to ensure search engines receive 100% region-pure HTML on first paint.
- **Next Steps / Pending Tasks**:
  - Connect Google Search Console properties for both `pixelfizz.in` and `pixelfizz.co.uk` and submit respective sitemaps.
  - Monitor lead arrivals in `storage/leads.json` and incoming WhatsApp threads.
