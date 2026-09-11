// Secure Backend Serverless API Route Blueprint
// Optimized for Vercel, Hostinger Node.js, or Netlify serverless runtimes.

export default async function handler(req, res) {
  // 1. Set CORS headers for security and multi-page loading
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure request is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { messages, region } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing messages array.' });
    }

    // Detect domain from headers, origin, or client payload
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
    const origin = (req.headers.origin || req.headers.referer || '').toLowerCase();
    const isUk = region === 'uk' || host.includes('pixelfizz.co.uk') || origin.includes('pixelfizz.co.uk');

    const domainUrl = isUk ? 'https://pixelfizz.co.uk' : 'https://pixelfizz.in';
    const contactEmail = isUk ? 'hello@pixelfizz.co.uk' : 'hello@pixelfizz.in';
    const contactPhone = isUk ? '+44 7767 196624' : '+91 78780 39395';
    const budgetLabel = isUk ? '£1,750 (roughly $2,200 USD)' : '$2,000 (roughly ₹1,50,000 INR)';
    const minCurrencyText = isUk ? '£1,750' : '$2,000 / ₹1,50,000';
    const regionName = isUk ? 'Winchester, UK & European market' : 'India & Global market';

    const systemPrompt = `You are the PixelFizz Core AI Agent (v1.0), a senior digital engineering consultant for PixelFizz (${domainUrl}). You represent PixelFizz across our ${regionName}.
You are witty, candid, razor-sharp, and highly opinionated about software engineering best practices. Avoid typical generic corporate AI fluff, canned enthusiasm, and "As an AI..." qualifiers. Speak like an experienced developer who tells clients the hard truth.

Your primary mission is to:
1. Consult on PixelFizz's core offerings: custom Next.js development (React, high performance), headless e-commerce boutiques (Next.js + Shopify/custom APIs), secure third-party integrations/middlewares, and custom AI agents/automations.
2. Pre-qualify the client's budget. PixelFizz only works on premium custom builds. Our minimum engagement budget is ${budgetLabel}.
3. If they inquire about pricing, rates, or getting a quote, ask them what their project budget is. 
   - If they state a budget below ${minCurrencyText}, explain politely but candidly why custom engineering cannot be done at that tier, and suggest self-serve templates (like Webflow or Shopify themes on their own).
   - If their budget is at or above ${minCurrencyText}, qualify their requirements and enthusiastically route them to submit the contact form (#contact) or email ${contactEmail} or call/WhatsApp ${contactPhone}.
4. Keep answers relatively concise, professional yet conversational, and punchy. Use technical depth (e.g. mention Core Web Vitals, server-side rendering, layout shift, payload size) to demonstrate authority.
5. If the user mentions submitting a form, direct them to the contact form at the bottom of the page using the anchor '#contact' (e.g., "submit our #contact form").`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // ── 2. INTELLIGENT RULE-BASED FALLBACK ENGINE (Offline Mock Mode) ──
      const lastUserMsg = messages[messages.length - 1].content.toLowerCase();
      let reply = "";

      if (lastUserMsg.includes('budget') || lastUserMsg.includes('price') || lastUserMsg.includes('cost') || lastUserMsg.includes('rate') || lastUserMsg.includes('fee') || lastUserMsg.includes('minimum') || lastUserMsg.includes('how much') || lastUserMsg.includes('$') || lastUserMsg.includes('₹') || lastUserMsg.includes('£') || lastUserMsg.includes('gbp') || lastUserMsg.includes('inr') || lastUserMsg.includes('usd')) {
        let specifiedSmall = false;
        const matches = lastUserMsg.match(/(\d+(?:\.\d+)?)\s*k?\b/g);
        const thresholdNum = isUk ? 1750 : 2000;
        if (matches) {
          for (const match of matches) {
            let val = parseFloat(match);
            if (match.toLowerCase().includes('k')) {
              val = val * 1000;
            }
            if (val > 0 && val < thresholdNum) {
              specifiedSmall = true;
              break;
            }
          }
        }

        if (specifiedSmall || lastUserMsg.includes('cheap') || lastUserMsg.includes('low') || lastUserMsg.includes('small budget')) {
          reply = `Candidly speaking: engineering premium, high-performance systems requires serious investment. Our minimum engagement for custom builds starts at **${minCurrencyText}**.\n\nBuilding on cheap templates leads to technical debt, layout shifts, and zero conversions. If you can target that threshold, we can build a lightning-fast custom setup that pays for itself. Otherwise, you're better off starting on a self-serve platform like Webflow or standard Shopify by yourself until you are ready to scale.`;
        } else {
          reply = `We don't do flat rates because custom engineering isn't a commodity. However, for context: our custom Next.js platforms, headless e-commerce integrations, and secure AI agent pipelines begin at **${minCurrencyText}**.\n\nWhat scope of project and budget target are you looking at? If it aligns with our minimum tier, let's discuss details. You can submit your spec via the #contact form below or email **${contactEmail}** and our lead engineer will draft a proposal.`;
        }
      } 
      else if (lastUserMsg.includes('next.js') || lastUserMsg.includes('nextjs') || lastUserMsg.includes('react') || lastUserMsg.includes('speed') || lastUserMsg.includes('performance') || lastUserMsg.includes('slow')) {
        reply = `Next.js is our core weapon. We build custom App Router setups with Server Components, fine-tuned hydration, and near-zero bundle bloat. The result? Near-instant load speeds (100/100 Core Web Vitals) and stellar SEO indexability.\n\nStandard WordPress or Webflow pages simply can't compete when it comes to search rankings and conversion efficiency. Are you looking to migrate an existing slow site, or engineer a brand-new Next.js system? Let's verify if your scope fits our ${minCurrencyText} minimum tier.`;
      }
      else if (lastUserMsg.includes('e-commerce') || lastUserMsg.includes('ecommerce') || lastUserMsg.includes('shopify') || lastUserMsg.includes('store') || lastUserMsg.includes('checkout') || lastUserMsg.includes('cart')) {
        reply = `E-commerce is where milliseconds translate directly into cash. We build custom headless Shopify storefronts using Next.js combined with Shopify's checkout engine, or custom DB sync schemas if you have complex legacy catalogs. This bypasses theme code bloat, increasing checkout page speeds by 40%+.\n\nWhat is your current transaction volume, and are you targeting our **${minCurrencyText}** custom design tier to unlock headless performance?`;
      }
      else if (lastUserMsg.includes('ai') || lastUserMsg.includes('agent') || lastUserMsg.includes('chat') || lastUserMsg.includes('bot') || lastUserMsg.includes('automation') || lastUserMsg.includes('integrate') || lastUserMsg.includes('workflow')) {
        reply = `You're chatting with our Core AI Agent right now! We build custom LLM middlewares, voice agents (via Twilio + Claude/Gemini), leads pre-qualification chat widgets, and automated scraping or database pipelines.\n\nAdding these systems saves businesses dozens of manual sales qualification hours. What process are you looking to automate? Let's check if your automation plan aligns with our ${minCurrencyText} project entry point.`;
      }
      else if (lastUserMsg.includes('contact') || lastUserMsg.includes('hire') || lastUserMsg.includes('email') || lastUserMsg.includes('hello') || lastUserMsg.includes('call') || lastUserMsg.includes('phone')) {
        reply = `Let's get your project scoping started. You can email your brief directly to **${contactEmail}**, reach our team via WhatsApp/phone at **${contactPhone}**, or fill out the secure **#contact form** at the bottom of the page.\n\nOur engineers will audit your current setup and reply with a complete performance proposal within 24 hours.`;
      }
      else {
        reply = `I'm a senior engineering consultant, not a marketing chatbot. If you want fluff, read a brochure. If you want to know about our custom Next.js architectures, secure API integrations, or how we automate lead pre-qualification, ask away.\n\nTo get a project quote, tell me a bit about your project goals and your target budget.`;
      }

      // Simulate network thinking delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.status(200).json({ reply });
    }

    // ── 3. LIVE GEMINI LLM API CALL ──
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return res.status(502).json({ error: 'Upstream LLM server returned an error.' });
    }

    const data = await response.json();
    
    // Extract reply text
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || `I encountered an error parsing that request. Please reach out to ${contactEmail} directly.`;
    
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
}
