// Basic JS for Casa Vacanze Kilò
(function () {
  const BOOKING_URL = "https://www.booking.com/hotel/it/casa-vacanze-kilo.it.html?chal_t=1762723522366&force_referer=https%3A%2F%2Fwww.google.com%2F";
  const EMAIL = "giammi20000@gmail.com"; // Email per prenotazioni dirette
  const PHONE = "+39 329 834 1368"; // Numero di contatto
  const WHATSAPP_LINK = "https://wa.me/393298341368?text=Ciao%20Casa%20Kil%C3%B2%2C%20vorrei%20info%20e%20disponibilit%C3%A0";
  const ADDRESS = "Via gioiamia 12, Palermo, Italia"; // Da aggiornare

  // Endpoint serverless (Netlify Function)
  // Backend endpoints: switch to PHP implementation
const SERVER_BASE = new URL('server/', window.location.href).pathname.replace(/\/$/, '');
  const API = {
    register: SERVER_BASE + '/register.php',
    login: SERVER_BASE + '/login.php',
    resend: SERVER_BASE + '/resend.php',
  };

  // Update dynamic content
  document.getElementById("year").textContent = new Date().getFullYear();
  const bookingLink = document.getElementById("bookingLink");
  const whatsappLink = document.getElementById("whatsappLink");
  const emailLink = document.getElementById("emailLink");
  const footerEmail = document.getElementById("footerEmail");
  const phoneLink = document.getElementById("phoneLink");
  const address = document.getElementById("address");
  if (bookingLink) bookingLink.href = BOOKING_URL;
  if (whatsappLink) whatsappLink.href = WHATSAPP_LINK;
  if (emailLink) emailLink.href = `mailto:${EMAIL}`;
  if (footerEmail) footerEmail.href = `mailto:${EMAIL}`;
  if (phoneLink) phoneLink.href = `tel:${PHONE.replace(/\s+/g, '')}`;
  if (address) address.textContent = ADDRESS;
  const emailBook = document.getElementById('emailBook');
  if (emailBook) emailBook.href = `mailto:${EMAIL}`;

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Smooth scroll close menu on click (mobile)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      if (menu) menu.classList.remove('open');
    });
  });

  // Booking quick request form -> email
  const form = document.getElementById('requestForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Captcha check
      if (!checkCaptcha('request')) return;
      const data = new FormData(form);
      const checkin = data.get('checkin');
      const checkout = data.get('checkout');
      const guests = data.get('guests');
      const name = data.get('name');
      const email = data.get('email');
      const subject = encodeURIComponent('Richiesta disponibilità - Casa Kilò');
      const body = encodeURIComponent(
        `Ciao Casa Kilò,%0D%0A%0D%0Avorrei informazioni e disponibilità:%0D%0A- Check-in: ${checkin}%0D%0A- Check-out: ${checkout}%0D%0A- Ospiti: ${guests}%0D%0A- Nome: ${name}%0D%0A- Email: ${email}%0D%0A%0D%0AGrazie!`
      );
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    });
  }

  // Simple lightbox for gallery
  const galleryImages = document.querySelectorAll('.gallery img');
  if (galleryImages.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<button class="close" aria-label="Chiudi">×</button><img alt="Anteprima" />';
    document.body.appendChild(lightbox);
    const lbImg = lightbox.querySelector('img');
    const close = lightbox.querySelector('.close');
    const closeLB = () => lightbox.classList.remove('open');
    close.addEventListener('click', closeLB);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLB(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLB(); });
    galleryImages.forEach(img => img.addEventListener('click', () => {
      lbImg.src = img.src;
      lbImg.alt = img.alt || 'Anteprima';
      lightbox.classList.add('open');
    }));
  }

  // Progressive image fallback: try multiple candidates from data-try
  function attachFallback(img) {
    const list = (img.getAttribute('data-try') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!list.length) return;
    let idx = 0;
    const tryNext = () => {
      if (idx >= list.length) { img.style.display = 'none'; return; }
      const next = list[idx++];
      if (img.src.endsWith(next)) { // avoid loop if already same
        tryNext(); return;
      }
      img.src = next;
    };
    img.addEventListener('error', tryNext);
  }

  document.querySelectorAll('img').forEach(img => {
    attachFallback(img);
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });

  // Subtle scroll-reveal animations for aesthetic touch
  try {
    const revealTargets = document.querySelectorAll(
      'h2, .feature-card, .grid-3 .service, .gallery img, .reviews .review, .form-card, .cta-wrap .btn, .map-wrap'
    );
    revealTargets.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } catch {}

  // Scroll progress bar and header shrink
  try {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    const header = document.querySelector('.site-header');
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY || window.pageYOffset;
      const p = h > 0 ? (y / h) : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
      if (header) header.classList.toggle('shrink', y > 12);
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  } catch {}

  // Simple local auth (demo only)
  const modal = document.getElementById('authModal');
  const openAuth = document.getElementById('openAuth');
  const openLogin = document.getElementById('openLogin');
  const openRegister = document.getElementById('openRegister');
  const closeBtn = modal ? modal.querySelector('.modal-close') : null;
  const tabs = modal ? modal.querySelectorAll('.tab') : [];
  const panels = modal ? modal.querySelectorAll('.panel') : [];
  const verifyPanel = document.getElementById('verifyPanel');
  const verifyEmailLabel = document.getElementById('verifyEmailLabel');
  const verifyCodeInput = document.getElementById('verifyCodeInput');
  const resendCodeBtn = document.getElementById('resendCode');
  const confirmCodeBtn = document.getElementById('confirmCode');
  // no visual code hint (per richiesta utente)

  const USER_KEY = 'kilo_user_v1';
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  };
  const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
  const clearUser = () => localStorage.removeItem(USER_KEY);

  function genCode() { return String(Math.floor(100000 + Math.random()*900000)); }

  async function apiPost(url, payload) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
    return data;
  }

  // Simple math captcha
  function setCaptcha(prefix) {
    const a = Math.floor(2 + Math.random()*8);
    const b = Math.floor(2 + Math.random()*8);
    const q = document.getElementById(prefix + 'CaptchaQ');
    const input = document.getElementById(prefix + 'CaptchaInput');
    if (q) q.textContent = `Quanto fa ${a} + ${b}?`;
    if (input) input.dataset.answer = String(a + b);
  }
  function checkCaptcha(prefix) {
    const input = document.getElementById(prefix + 'CaptchaInput');
    if (!input) return true;
    const ok = input.value.trim() === (input.dataset.answer || '');
    if (!ok) { alert('Verifica anti-spam non corretta. Riprova.'); setCaptcha(prefix); }
    return ok;
  }

  // initialize captchas
  setCaptcha('request');
  setCaptcha('register');

  function setActivePanel(el) {
    if (!modal) return;
    panels.forEach(p => p.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
  }

  function refreshAuthUI() {
    const u = getUser();
    if (!openAuth) return;
    if (u && u.name) {
      if (u.verified) {
        openAuth.textContent = '🚪';
        openAuth.title = `Esci (${u.name})`;
        openAuth.setAttribute('data-logged', 'true');
        openAuth.removeAttribute('data-verify');
      } else {
        openAuth.textContent = '❗';
        openAuth.title = 'Verifica email';
        openAuth.setAttribute('data-verify', 'true');
        openAuth.removeAttribute('data-logged');
      }
    } else {
      openAuth.textContent = '👤';
      openAuth.title = 'Accedi o registrati';
      openAuth.removeAttribute('data-logged');
      openAuth.removeAttribute('data-verify');
    }
  }
  refreshAuthUI();

  function openModal() { if (modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); } }
  function closeModal() { if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); } }
  if (openAuth) {
    openAuth.addEventListener('click', (e) => {
      e.preventDefault();
      // If logged, clicking logs out
      if (openAuth.getAttribute('data-logged') === 'true') {
        clearUser();
        refreshAuthUI();
        return;
      }
      openModal();
      const u = getUser();
      if (openAuth.getAttribute('data-verify') === 'true' && verifyPanel) {
        if (verifyEmailLabel && u) verifyEmailLabel.textContent = u.email;
        setActivePanel(verifyPanel);
        return;
      }
      // default to login panel
      const login = document.getElementById('loginForm');
      setActivePanel(login);
    });
  }
  // Dedicated icons: open login or register directly
  if (openLogin) openLogin.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
    const login = document.getElementById('loginForm');
    setActivePanel(login);
  });
  if (openRegister) openRegister.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
    const reg = document.getElementById('registerForm');
    setActivePanel(reg);
  });
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    const panel = modal.querySelector(`#${target === 'login' ? 'loginForm' : 'registerForm'}`);
    if (panel) panel.classList.add('active');
  }));

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (registerForm) registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkCaptcha('register')) return;
    const fd = new FormData(registerForm);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const password = String(fd.get('password') || '');
    if (password.length < 6) return alert('La password deve avere almeno 6 caratteri.');
    try {
      await apiPost(API.register, { name, email, password });
      registerForm.reset();
      if (verifyEmailLabel) verifyEmailLabel.textContent = email;
      if (verifyCodeInput) verifyCodeInput.value = '';
      openModal();
      setActivePanel(verifyPanel);
      alert('Registrazione ok. Controlla la mail per verificare.');
      setUser({ name, email, createdAt: Date.now(), verified: false });
    } catch (err) {
      alert(err.message || 'Errore registrazione');
    }
  });

  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(loginForm);
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const password = String(fd.get('password') || '');
    try {
      const res = await apiPost(API.login, { email, password });
      setUser({ id: res.user.id, name: res.user.name, email: res.user.email, verified: true });
      loginForm.reset();
      refreshAuthUI();
      closeModal();
      alert('Accesso effettuato!');
    } catch (err) {
      alert(err.message || 'Errore di accesso');
    }
  });

  // Verification actions
  if (resendCodeBtn) resendCodeBtn.addEventListener('click', async () => {
    const u = getUser();
    if (!u) return;
    try { await apiPost(API.resend, { email: u.email }); alert('Nuovo link inviato via email.'); }
    catch (err) { alert(err.message || 'Errore invio link'); }
  });

  // The PHP flow uses a link in the email; keep button as hint only
  if (confirmCodeBtn) confirmCodeBtn.addEventListener('click', () => {
    alert('Controlla la tua email e clicca il link di verifica.');
  });
})();
