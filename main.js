document.addEventListener('DOMContentLoaded', () => {
  /* ── 1. CUSTOM CURSOR ── */
  const dot = document.getElementById('cDot');
  const ring = document.getElementById('cRing');
  
  if (dot && ring) {
    let mx = -200, my = -200; // Mouse coords
    let rx = -200, ry = -200; // Ring coords (interpolated)
    let isHovering = false;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      
      // Instantly position the center dot
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    });

    // Interpolation loop for the trailing ring
    function tick() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Event delegation for cursor hover states (more performant and handles dynamic DOM)
    document.body.addEventListener('mouseover', e => {
      const target = e.target.closest('a, button, .svc-card, .work-card, .client-pill');
      if (target && !isHovering) {
        document.body.classList.add('c-hover');
        isHovering = true;
      }
    });

    document.body.addEventListener('mouseout', e => {
      const target = e.target.closest('a, button, .svc-card, .work-card, .client-pill');
      if (target && isHovering) {
        // Check if we are moving to another hoverable element
        const related = e.relatedTarget ? e.relatedTarget.closest('a, button, .svc-card, .work-card, .client-pill') : null;
        if (!related) {
          document.body.classList.remove('c-hover');
          isHovering = false;
        }
      }
    });
  }

  /* ── 2. STICKY NAV ON SCROLL & MOBILE MENU TOGGLE ── */
  const header = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');

  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('sticky');
      } else {
        header.classList.remove('sticky');
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  if (navToggle && header) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    if (navLinks) {
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          header.classList.remove('nav-open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (header.classList.contains('nav-open') && !header.contains(e.target)) {
        header.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── 3. SCROLL REVEAL (INTERSECTION OBSERVER) ── */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          // Once revealed, we don't need to observe it anymore
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null, // viewport
      threshold: 0.1, // trigger when 10% is visible
      rootMargin: '0px 0px -40px 0px' // offset slightly to feel more organic
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // Count-up stats interaction removed to use instant B2B-optimized static rendering.

  /* ── 5. PORTFOLIO GRID FILTER ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.work-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;

        // Update active states
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        // Step 1: Add 'hide' to elements that don't match (initiates scale-down/fade-out)
        projectCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (filterValue !== 'all' && cardCat !== filterValue) {
            card.classList.add('hide');
          }
        });

        // Step 2: Toggle 'filtered-out' (display: none) after exit animation finishes
        setTimeout(() => {
          projectCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            if (filterValue === 'all' || cardCat === filterValue) {
              card.classList.remove('filtered-out');
            } else {
              card.classList.add('filtered-out');
            }
          });

          // Step 3: Trigger zoom/fade-in on the next animation frame
          requestAnimationFrame(() => {
            projectCards.forEach(card => {
              const cardCat = card.getAttribute('data-category');
              if (filterValue === 'all' || cardCat === filterValue) {
                card.classList.remove('hide');
              }
            });
          });
        }, 300); // 300ms matches transition-smooth speed
      });
    });
  }

  /* ── 6. FAQ ACCORDION INTERACTION ── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isActive = item.classList.contains('active');
      
      const parentAccordion = item.closest('.faq-accordion');
      if (parentAccordion) {
        parentAccordion.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      }
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  /* ── 7. LEAD FORM AJAX SUBMISSION & INSTANT WHATSAPP HANDLER ── */
  document.querySelectorAll('.lead-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('.btn-submit-lead');
      const statusMsg = form.querySelector('.form-status-msg');
      const waBtn = form.querySelector('.btn-whatsapp-instant');
      const origBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
      
      const formData = new FormData(form);
      const payload = {
        name: formData.get('name') || '',
        contact: formData.get('contact') || '',
        service: formData.get('service') || 'General Consultation',
        budget: formData.get('budget') || 'Standard',
        message: formData.get('message') || '',
        website_url: formData.get('website_url') || '',
        region: document.documentElement.getAttribute('data-domain') || 'in'
      };

      if (!payload.name || !payload.contact) {
        if (statusMsg) {
          statusMsg.className = 'form-status-msg error';
          statusMsg.textContent = 'Please provide both your name and work email/WhatsApp number.';
          statusMsg.style.display = 'block';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending Spec...';
      }

      try {
        const isSub = window.location.pathname.includes('/services/') || window.location.pathname.includes('/work/');
        const apiPath = isSub ? '../../contact-submit.php' : 'contact-submit.php';

        const res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.success) {
          if (statusMsg) {
            statusMsg.className = 'form-status-msg success';
            statusMsg.textContent = result.message || 'Thank you! Your project specification was received. We will reply within 24 hours.';
            statusMsg.style.display = 'block';
          }
          form.reset();

          if (result.whatsapp_url && waBtn) {
            waBtn.href = result.whatsapp_url;
            waBtn.innerHTML = 'Chat Now on WhatsApp ⚡';
          }
        } else {
          throw new Error(result.error || 'Server error occurred.');
        }
      } catch (err) {
        console.error('Lead submission error:', err);
        const isUk = payload.region === 'uk';
        const waPhone = isUk ? '447767196624' : '917878039395';
        const waText = encodeURIComponent(`Hi! I'm inquiring for ${payload.service} (Budget: ${payload.budget}). Name: ${payload.name}, Contact: ${payload.contact}`);
        const fallbackWa = `https://wa.me/${waPhone}?text=${waText}`;

        if (statusMsg) {
          statusMsg.className = 'form-status-msg success';
          statusMsg.innerHTML = `Inquiry recorded! You can also <a href="${fallbackWa}" target="_blank" style="color:#c4ff00;text-decoration:underline;">chat directly with our lead engineer on WhatsApp</a>.`;
          statusMsg.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnText;
        }
      }
    });
  });

  /* ── 8. INTERACTIVE PROJECT ESTIMATOR & INSTANT WHATSAPP CONCIERGE ── */
  function injectEstimatorWidget() {
    if (document.getElementById('estimatorDrawer') || document.querySelector('.estimator-drawer')) return;

    const isUk = (document.documentElement.getAttribute('data-domain') === 'uk');
    const currency = isUk ? '£' : '₹';
    const waPhone = isUk ? '447767196624' : '917878039395';
    const leadName = isUk ? 'Punit (UK Studio)' : 'Manish Chawla (India Studio)';

    const wrapper = document.createElement('div');
    wrapper.className = 'estimator-wrapper';
    wrapper.innerHTML = `
      <button class="chat-trigger-btn" aria-label="Open Project Estimator" id="estimatorTrigger" title="Quick Project Estimator">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="18" rx="4"/>
          <line x1="8" y1="9" x2="16" y2="9"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="12" y2="17"/>
        </svg>
        <span class="chat-btn-pulse"></span>
      </button>

      <div class="estimator-drawer" id="estimatorDrawer" aria-hidden="true">
        <div class="estimator-header">
          <div class="estimator-header-title">
            <span class="estimator-pulse"></span>
            <span>PixelFizz Project Estimator</span>
          </div>
          <button class="estimator-close" id="estimatorClose" aria-label="Close Estimator">✕</button>
        </div>

        <!-- Step 1: Service Type -->
        <div class="estimator-step active" id="estStep1">
          <div class="estimator-step-label">Step 1 of 3</div>
          <div class="estimator-question">What system are you looking to engineer?</div>
          <div class="estimator-options">
            <button class="estimator-opt-btn" data-service="High-Speed Next.js Web App">
              <span>🚀 High-Speed Next.js Web App</span><span>→</span>
            </button>
            <button class="estimator-opt-btn" data-service="Headless E-Commerce Boutique">
              <span>🛍️ Headless E-Commerce Store</span><span>→</span>
            </button>
            <button class="estimator-opt-btn" data-service="AI Voice & Workflow Automation">
              <span>🤖 24/7 AI Voice / Chat Agent</span><span>→</span>
            </button>
            <button class="estimator-opt-btn" data-service="Custom ERP / SaaS Platform">
              <span>📊 Custom ERP / SaaS Software</span><span>→</span>
            </button>
            <button class="estimator-opt-btn" data-service="Cross-Platform Mobile App">
              <span>📱 iOS & Android Mobile App</span><span>→</span>
            </button>
          </div>
        </div>

        <!-- Step 2: Budget Range -->
        <div class="estimator-step" id="estStep2">
          <div class="estimator-step-label">Step 2 of 3</div>
          <div class="estimator-question">Select your target investment tier:</div>
          <div class="estimator-options" id="estBudgetOptions">
            ${isUk ? `
              <button class="estimator-opt-btn" data-budget="£1,750 – £3,500">
                <span>£1,750 – £3,500 (Boutique Build)</span><span>→</span>
              </button>
              <button class="estimator-opt-btn" data-budget="£3,500 – £7,000">
                <span>£3,500 – £7,000 (Custom Architecture)</span><span>→</span>
              </button>
              <button class="estimator-opt-btn" data-budget="£7,000+">
                <span>£7,000+ (Full Enterprise Build)</span><span>→</span>
              </button>
            ` : `
              <button class="estimator-opt-btn" data-budget="₹1,50,000 – ₹3,00,000">
                <span>₹1,50,000 – ₹3,00,000 (Boutique Build)</span><span>→</span>
              </button>
              <button class="estimator-opt-btn" data-budget="₹3,00,000 – ₹6,00,000">
                <span>₹3,00,000 – ₹6,00,000 (Custom Architecture)</span><span>→</span>
              </button>
              <button class="estimator-opt-btn" data-budget="₹6,00,000+">
                <span>₹6,00,000+ (Full Enterprise Build)</span><span>→</span>
              </button>
            `}
          </div>
        </div>

        <!-- Step 3: Contact & Instant Dispatch -->
        <div class="estimator-step" id="estStep3">
          <div class="estimator-step-label">Step 3 of 3</div>
          <div class="estimator-question">Where should we route your estimate?</div>
          <div class="estimator-final-box" id="estSummaryBox">
            Scope: <strong id="estSummaryService"></strong><br>
            Tier: <strong id="estSummaryBudget"></strong>
          </div>
          <div class="form-group" style="margin-bottom:10px;">
            <input type="text" class="form-input" id="estName" placeholder="Your Name or Business" required />
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <input type="text" class="form-input" id="estContact" placeholder="WhatsApp Number or Work Email" required />
          </div>
          <button class="btn-submit-lead" id="estSubmitWa" style="width:100%;margin-bottom:8px;">
            Chat on WhatsApp with Lead Engineer ⚡
          </button>
          <div style="text-align:center;font-size:11px;color:var(--fg-dim);">
            Direct route to ${leadName} · 24hr response guarantee
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    const trigger = document.getElementById('estimatorTrigger');
    const drawer = document.getElementById('estimatorDrawer');
    const close = document.getElementById('estimatorClose');
    const step1 = document.getElementById('estStep1');
    const step2 = document.getElementById('estStep2');
    const step3 = document.getElementById('estStep3');
    const summaryService = document.getElementById('estSummaryService');
    const summaryBudget = document.getElementById('estSummaryBudget');
    const estName = document.getElementById('estName');
    const estContact = document.getElementById('estContact');
    const submitWa = document.getElementById('estSubmitWa');

    let selectedService = '';
    let selectedBudget = '';

    trigger.addEventListener('click', () => {
      drawer.classList.toggle('open');
      drawer.setAttribute('aria-hidden', !drawer.classList.contains('open'));
    });

    close.addEventListener('click', () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    });

    step1.querySelectorAll('.estimator-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedService = btn.getAttribute('data-service');
        step1.classList.remove('active');
        step2.classList.add('active');
      });
    });

    step2.querySelectorAll('.estimator-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedBudget = btn.getAttribute('data-budget');
        summaryService.textContent = selectedService;
        summaryBudget.textContent = selectedBudget;
        step2.classList.remove('active');
        step3.classList.add('active');
      });
    });

    submitWa.addEventListener('click', () => {
      const name = estName.value.trim() || 'Prospective Client';
      const contact = estContact.value.trim() || 'Via Web Estimator';

      const waMsg = `Hi ${leadName}! I used the PixelFizz Project Estimator:

• Name: ${name}
• Contact: ${contact}
• System: ${selectedService}
• Target Tier: ${selectedBudget}

I'd like to discuss the architecture and timeline.`;
      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`;

      const isSub = window.location.pathname.includes('/services/') || window.location.pathname.includes('/work/');
      const apiPath = isSub ? '../../contact-submit.php' : 'contact-submit.php';
      fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          contact: contact,
          service: selectedService,
          budget: selectedBudget,
          message: 'Submitted via Interactive Project Estimator Concierge',
          region: isUk ? 'uk' : 'in'
        })
      }).catch(e => console.log('Estimator logged'));

      window.open(waUrl, '_blank', 'noopener,noreferrer');
      drawer.classList.remove('open');
    });
  }

  injectEstimatorWidget();
});
