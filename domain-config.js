/**
 * PixelFizz Unified Dual-Domain Engine
 * Automatically detects whether the user is browsing on pixelfizz.in or pixelfizz.co.uk
 * (or testing via ?region=uk / ?domain=uk) and dynamically aligns:
 *  - Contact emails (hello@pixelfizz.in vs hello@pixelfizz.co.uk)
 *  - Contact phone & WhatsApp (+91 78780 39395 vs +44 7767 196624)
 *  - Location priority & hero badges (Winchester, UK vs Vapi, India)
 *  - Trust copy & regional currency presets (£ GBP vs ₹ INR / $ USD)
 *  - Self-referential canonical tags for flawless multi-region SEO
 */

(function () {
  'use strict';

  const DOMAINS = {
    in: {
      code: 'in',
      domain: 'pixelfizz.in',
      label: 'India · pixelfizz.in',
      email: 'hello@pixelfizz.in',
      phoneDisplay: '+91 78780 39395',
      phoneTel: '+917878039395',
      waLink: 'https://wa.me/917878039395',
      heroBadge: 'Digital Engineering Agency &nbsp;·&nbsp; Vapi, India &amp; Winchester, UK',
      heroTrust: 'Trusted by 30+ growing brands across India, the UK &amp; beyond',
      primaryLocation: 'Vapi, Gujarat, India 🇮🇳',
      secondaryLocation: 'Winchester, Hampshire, UK 🇬🇧',
      currency: '₹',
      minBudget: '₹1,50,000 / $2,000'
    },
    uk: {
      code: 'uk',
      domain: 'pixelfizz.co.uk',
      label: 'United Kingdom · pixelfizz.co.uk',
      email: 'hello@pixelfizz.co.uk',
      phoneDisplay: '+44 7767 196624',
      phoneTel: '+447767196624',
      waLink: 'https://wa.me/447767196624',
      heroBadge: 'Digital Engineering Agency &nbsp;·&nbsp; Winchester, UK &amp; Vapi, India',
      heroTrust: 'Trusted by 30+ growing brands across the UK, Europe &amp; beyond',
      primaryLocation: 'Winchester, Hampshire, UK 🇬🇧',
      secondaryLocation: 'Vapi, Gujarat, India 🇮🇳',
      currency: '£',
      minBudget: '£1,750 / $2,200'
    }
  };

  // Determine active domain
  function detectDomain() {
    const params = new URLSearchParams(window.location.search);
    const queryRegion = params.get('region') || params.get('domain');
    if (queryRegion) {
      const normalized = queryRegion.toLowerCase();
      if (normalized === 'uk' || normalized === 'gb' || normalized === 'co.uk') {
        return 'uk';
      }
      if (normalized === 'in' || normalized === 'india') {
        return 'in';
      }
    }

    const host = window.location.hostname.toLowerCase();
    if (host.endsWith('pixelfizz.co.uk') || host === 'pixelfizz.co.uk' || host.includes('.co.uk')) {
      return 'uk';
    }
    if (host.endsWith('pixelfizz.in') || host === 'pixelfizz.in') {
      return 'in';
    }

    // Default to .in
    return 'in';
  }

  const activeRegion = detectDomain();
  const config = DOMAINS[activeRegion];

  window.PixelFizzDomain = {
    active: activeRegion,
    config: config,
    all: DOMAINS
  };

  // Apply domain parameters to the DOM
  function applyDomain() {
    document.documentElement.setAttribute('data-domain', activeRegion);

    // 1. Update self-referential canonical tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    canonical.href = `https://${config.domain}${currentPath}`;

    // 2. Ensure multi-region hreflang tags exist
    let hreflangIn = document.querySelector('link[rel="alternate"][hreflang="en-IN"]');
    if (!hreflangIn) {
      hreflangIn = document.createElement('link');
      hreflangIn.rel = 'alternate';
      hreflangIn.hreflang = 'en-IN';
      document.head.appendChild(hreflangIn);
    }
    hreflangIn.href = `https://pixelfizz.in${currentPath}`;

    let hreflangUk = document.querySelector('link[rel="alternate"][hreflang="en-GB"]');
    if (!hreflangUk) {
      hreflangUk = document.createElement('link');
      hreflangUk.rel = 'alternate';
      hreflangUk.hreflang = 'en-GB';
      document.head.appendChild(hreflangUk);
    }
    hreflangUk.href = `https://pixelfizz.co.uk${currentPath}`;

    let hreflangDefault = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
    if (!hreflangDefault) {
      hreflangDefault = document.createElement('link');
      hreflangDefault.rel = 'alternate';
      hreflangDefault.hreflang = 'x-default';
      document.head.appendChild(hreflangDefault);
    }
    hreflangDefault.href = `https://pixelfizz.in${currentPath}`;

    // 3. Update Email Links & Mentions
    document.querySelectorAll('[data-domain-target="email-link"], a[href^="mailto:hello@pixelfizz."]').forEach(el => {
      el.href = `mailto:${config.email}`;
      if (el.textContent.includes('pixelfizz.')) {
        el.textContent = config.email;
      }
    });

    // 4. Update Phone Numbers & Call Links (+44 7767 196624 for UK)
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
      el.href = `tel:${config.phoneTel}`;
      if (el.textContent.includes('+91') || el.textContent.includes('+44')) {
        el.textContent = config.phoneDisplay;
      }
    });

    // 5. Update WhatsApp Chat Links
    document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
      el.href = config.waLink;
    });

    // 6. Update Hero Badges & Trust Text
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) {
      heroBadge.innerHTML = `<span class="badge-dot"></span>${config.heroBadge}`;
    }

    const heroTrust = document.querySelector('.hero-trust');
    if (heroTrust) {
      heroTrust.innerHTML = config.heroTrust;
    }

    // 7. Footer Locations Alignment
    const footerCols = document.querySelectorAll('.foot-top > div');
    footerCols.forEach(col => {
      const title = col.querySelector('.foot-col-title');
      if (title && title.textContent.trim() === 'Locations') {
        const linksList = col.querySelector('.foot-links');
        if (linksList) {
          const emailLink = linksList.querySelector('a[href^="mailto:"]');
          if (emailLink) {
            emailLink.href = `mailto:${config.email}`;
            emailLink.textContent = config.email;
          }
          const phoneLink = linksList.querySelector('a[href^="tel:"]');
          if (phoneLink) {
            phoneLink.href = `tel:${config.phoneTel}`;
            phoneLink.textContent = config.phoneDisplay;
          }
          const waLink = linksList.querySelector('a[href*="wa.me"]');
          if (waLink) {
            waLink.href = config.waLink;
          }

          // If UK, ensure UK location is displayed first
          if (activeRegion === 'uk') {
            const listItems = Array.from(linksList.querySelectorAll('li'));
            const ukLi = listItems.find(li => li.textContent.includes('Winchester'));
            const inLi = listItems.find(li => li.textContent.includes('Vapi'));
            if (ukLi && inLi) {
              linksList.insertBefore(ukLi, inLi);
            }
          }
        }
      }
    });
  }

  // Execute on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDomain);
  } else {
    applyDomain();
  }
})();
