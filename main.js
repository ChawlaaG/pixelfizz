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

  /* ── 6. PRIORITY-BASED PROJECT SHUFFLING (DOMAIN-AWARE) ── */
  const grid = document.querySelector('.work-grid');
  if (grid) {
    const isUkDomain = document.documentElement.getAttribute('data-domain') === 'uk';
    const cards = Array.from(grid.querySelectorAll('.work-card'));
    
    // Group cards by priority (default to 3 if not specified)
    const groups = {};
    cards.forEach(card => {
      const rawPriority = card.getAttribute('data-priority');
      let priority = (rawPriority !== null && !isNaN(rawPriority)) ? parseInt(rawPriority, 10) : 3;
      
      // If browsing UK domain, boost cards marked with data-region="uk" or data-region="europe"
      const cardRegion = card.getAttribute('data-region');
      if (isUkDomain && (cardRegion === 'uk' || cardRegion === 'europe')) {
        priority = Math.max(0, priority - 2); // Boost to top tier 0 or 1
      }

      if (!groups[priority]) groups[priority] = [];
      groups[priority].push(card);
    });
    
    // Helper to shuffle an array in-place (Fisher-Yates)
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    
    // Sort priority keys (0, 1, 2, 3...) and shuffle within each priority tier
    const sortedPriorities = Object.keys(groups).map(Number).sort((a, b) => a - b);
    const finalOrderedCards = [];
    
    sortedPriorities.forEach(priority => {
      const shuffledGroup = shuffle(groups[priority]);
      finalOrderedCards.push(...shuffledGroup);
    });
    
    // Clear and append in the new sorted order
    grid.innerHTML = '';
    finalOrderedCards.forEach(card => grid.appendChild(card));
  }

  /* ── 7. AI CHAT AGENT WIDGET LOGIC ── */
  
  // A. Dynamic HTML Injection (modular across all subpages)
  function injectChatWidget() {
    if (document.getElementById('chatTrigger') || document.querySelector('.chat-agent-wrapper')) {
      return; // Already injected
    }
    
    const chatWrapper = document.createElement('div');
    chatWrapper.className = 'chat-agent-wrapper';
    chatWrapper.innerHTML = `
      <button class="chat-trigger-btn" aria-label="Open AI Chat Agent" id="chatTrigger">
        <svg class="chat-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="chat-btn-pulse"></span>
      </button>
      
      <div class="chat-drawer" id="chatDrawer" aria-hidden="true">
        <div class="chat-drawer-header">
          <div class="chat-header-info">
            <span class="chat-status-pulse"></span>
            <div class="chat-header-ticker">
              <span class="chat-header-text">PixelFizz Core AI Agent v1.0 [Online]</span>
            </div>
          </div>
          <button class="chat-close-btn" aria-label="Close Chat" id="chatClose">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="chat-messages" id="chatMessages"></div>
        
        <form class="chat-input-area" id="chatForm">
          <input type="text" class="chat-input-field" placeholder="Ask about services, budgets, or tech stack..." id="chatInput" required autocomplete="off" />
          <button type="submit" class="chat-send-btn" aria-label="Send Message" id="chatSend">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;
    
    document.body.appendChild(chatWrapper);
  }
  
  // Initialize widget
  injectChatWidget();
  
  const triggerBtn = document.getElementById('chatTrigger');
  const chatDrawer = document.getElementById('chatDrawer');
  const closeBtn = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  
  if (triggerBtn && chatDrawer && closeBtn && chatMessages && chatForm && chatInput) {
    let chatHistory = [];
    let isTyping = false;
    let initialGreetingSent = false;
    
    // Check if we are on a service subpage, adjust API path accordingly
    const isSubpage = window.location.pathname.includes('/services/');
    const apiEndpoint = isSubpage ? '../../api/chat' : 'api/chat';
    
    // Toggle Chat
    function toggleChat(forceState) {
      const isOpen = forceState !== undefined ? forceState : !chatDrawer.classList.contains('open');
      
      if (isOpen) {
        chatDrawer.classList.add('open');
        chatDrawer.setAttribute('aria-hidden', 'false');
        triggerBtn.setAttribute('aria-expanded', 'true');
        
        // Prevent background scrolling on mobile
        if (window.innerWidth <= 576) {
          document.body.classList.add('chat-active');
        }
        
        // Send initial greeting if not already sent
        if (!initialGreetingSent) {
          sendInitialGreeting();
        }
        
        // Focus input after slide animation
        setTimeout(() => chatInput.focus(), 400);
      } else {
        chatDrawer.classList.remove('open');
        chatDrawer.setAttribute('aria-hidden', 'true');
        triggerBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('chat-active');
      }
    }
    
    triggerBtn.addEventListener('click', () => toggleChat(true));
    closeBtn.addEventListener('click', () => toggleChat(false));
    
    // Close chat on click outside
    document.addEventListener('click', (e) => {
      if (chatDrawer.classList.contains('open') && 
          !chatDrawer.contains(e.target) && 
          !triggerBtn.contains(e.target) && 
          window.innerWidth > 576) {
        toggleChat(false);
      }
    });
    
    // Format timestamp
    function getFormattedTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Append Message to UI
    function appendMessage(role, text) {
      const msgNode = document.createElement('div');
      msgNode.className = `chat-msg chat-msg-${role === 'user' ? 'user' : 'agent'}`;
      
      // Clean HTML from user text, but allow structured text from LLM agent
      let displayHtml = text;
      if (role === 'user') {
        const temp = document.createElement('div');
        temp.textContent = text;
        displayHtml = temp.innerHTML;
      } else {
        // Convert basic markdown tags like bold (**text**), line breaks, or links to HTML
        displayHtml = text
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>')
          .replace(/#contact/g, '<a href="#contact" style="color:var(--lime);font-weight:600;">contact form</a>');
      }
      
      msgNode.innerHTML = `
        <div class="chat-msg-bubble">
          ${displayHtml}
        </div>
        <div class="chat-msg-timestamp">${getFormattedTime()}</div>
      `;
      
      chatMessages.appendChild(msgNode);
      chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
    }
    
    // Show typing indicator
    function showTypingIndicator() {
      if (document.getElementById('typingIndicator')) return;
      
      const typingNode = document.createElement('div');
      typingNode.id = 'typingIndicator';
      typingNode.className = 'typing-indicator';
      typingNode.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      `;
      
      chatMessages.appendChild(typingNode);
      chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
      isTyping = true;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
      const typingNode = document.getElementById('typingIndicator');
      if (typingNode) {
        typingNode.remove();
      }
      isTyping = false;
    }
    
    // Initial Greeting
    function sendInitialGreeting() {
      initialGreetingSent = true;
      showTypingIndicator();
      
      const isUk = document.documentElement.getAttribute('data-domain') === 'uk';
      const greeting = isUk
        ? "Hey! I'm PixelFizz's UK & Global AI Consultant. I specialize in custom Next.js architectures, headless e-commerce engineering, and automated workflow pipelines for brands across the UK, Europe, and globally.\n\nAre you looking to build a high-performance web system, custom web app, or integrate some AI agents? What project parameters are we working with today?"
        : "Hey! I'm PixelFizz's Core AI Consultant. I specialize in custom Next.js architectures, headless e-commerce engineering, and workflow automation pipelines.\n\nAre you looking to build a high-performance web system, custom web app, or integrate some AI agents? What project parameters are we working with today?";

      setTimeout(() => {
        removeTypingIndicator();
        appendMessage('agent', greeting);
      }, 1000);
    }
    
    // Form Submit Handler
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const query = chatInput.value.trim();
      if (!query || isTyping) return;
      
      chatInput.value = '';
      
      // 1. Add user message
      appendMessage('user', query);
      chatHistory.push({ role: 'user', content: query });
      
      // 2. Show typing
      showTypingIndicator();
      
      try {
        const activeRegion = document.documentElement.getAttribute('data-domain') || 'in';
        const fallbackEmail = activeRegion === 'uk' ? 'hello@pixelfizz.co.uk' : 'hello@pixelfizz.in';

        // 3. Make post request to backend route
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messages: chatHistory, region: activeRegion })
        });
        
        removeTypingIndicator();
        
        if (!response.ok) {
          throw new Error('API server connection error');
        }
        
        const data = await response.json();
        const reply = data.reply || `I encountered an error analyzing that query. Let's redirect this to ${fallbackEmail}.`;
        
        // 4. Add agent reply
        appendMessage('agent', reply);
        chatHistory.push({ role: 'assistant', content: reply });
      } catch (err) {
        console.error('Chat error:', err);
        removeTypingIndicator();
        const activeRegion = document.documentElement.getAttribute('data-domain') || 'in';
        const fallbackEmail = activeRegion === 'uk' ? 'hello@pixelfizz.co.uk' : 'hello@pixelfizz.in';
        appendMessage('agent', `Looks like my secure connection is experiencing turbulence. If you're ready to design your next tech setup, drop us a direct message at ${fallbackEmail} or scroll down to our contact form!`);
      }
    });
  }
});

