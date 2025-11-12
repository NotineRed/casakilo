// Basic JS for Casa Vacanze Kilò (senza login/registrazione)
(function() {
    const BOOKING_URL = "https://www.booking.com/hotel/it/casa-vacanze-kilo.it.html?chal_t=1762723522366&force_referer=https%3A%2F%2Fwww.google.com%2F";
    const EMAIL = "giammi20000@gmail.com";
    const PHONE = "+39 329 834 1368";
    const WHATSAPP_LINK = "https://wa.me/393298341368?text=Ciao%20Casa%20Kil%C3%B2%2C%20vorrei%20info%20e%20disponibilit%C3%A0";
    const ADDRESS = "Via [inserisci via], Palermo, Italia"; // Da aggiornare

    // Dati dinamici
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
    const bookingLink = document.getElementById('bookingLink');
    if (bookingLink) bookingLink.href = BOOKING_URL;
    const whatsappLink = document.getElementById('whatsappLink');
    if (whatsappLink) whatsappLink.href = WHATSAPP_LINK;
    const emailLink = document.getElementById('emailLink');
    if (emailLink) emailLink.href = `mailto:${EMAIL}`;
    const footerEmail = document.getElementById('footerEmail');
    if (footerEmail) footerEmail.href = `mailto:${EMAIL}`;
    const phoneLink = document.getElementById('phoneLink');
    if (phoneLink) phoneLink.href = `tel:${PHONE.replace(/\s+/g,'')}`;
    const address = document.getElementById('address');
    if (address) address.textContent = ADDRESS;
    const emailBook = document.getElementById('emailBook');
    if (emailBook) emailBook.href = `mailto:${EMAIL}`;

    // Mobile nav
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('menu');
    if (toggle && menu) toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => { if (menu) menu.classList.remove('open'); }));

    // Richiesta rapida -> invio a endpoint PHP (PHPMailer)
    const form = document.getElementById('requestForm');
    if (form) form.addEventListener('submit', async(e) => {
        e.preventDefault();
        const msg = document.getElementById('requestMsg');
        if (msg) msg.textContent = '';
        if (!checkCaptcha('request')) return;
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());
        try {
            const url = new URL('server/send-contact.php', window.location.href).pathname;
            const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await r.json().catch(() => ({}));
            if (!r.ok || data.error) throw new Error(data.error || 'Errore invio');
            if (msg) msg.textContent = 'Richiesta inviata! Ti risponderemo via email.';
            form.reset();
            setCaptcha('request');
        } catch (err) {
            if (msg) msg.textContent = 'Errore: ' + (err && err.message || 'invio non riuscito');
        }
    });

    // Lightbox galleria
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
        galleryImages.forEach(img => img.addEventListener('click', () => { lbImg.src = img.src;
            lbImg.alt = img.alt || 'Anteprima';
            lightbox.classList.add('open'); }));
    }

    // Fallback immagini
    function attachFallback(img) {
        const list = (img.getAttribute('data-try') || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!list.length) return;
        let idx = 0;
        const tryNext = () => { if (idx >= list.length) { img.style.display = 'none'; return; } const next = list[idx++]; if (img.src.endsWith(next)) { tryNext(); return; }
            img.src = next; };
        img.addEventListener('error', tryNext);
    }
    document.querySelectorAll('img').forEach(img => { attachFallback(img);
        img.addEventListener('error', () => { img.style.display = 'none'; }); });

    // Reveal on scroll
    try {
        const revealTargets = document.querySelectorAll('h2, .feature-card, .grid-3 .service, .gallery img, .reviews .review, .form-card, .cta-wrap .btn, .map-wrap');
        revealTargets.forEach(el => el.classList.add('reveal'));
        const io = new IntersectionObserver((entries, obs) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('show');
                    obs.unobserve(entry.target); } }); }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(el => io.observe(el));
    } catch {}

    // Scroll progress + header shrink
    try {
        const bar = document.createElement('div');
        bar.className = 'scroll-progress';
        document.body.appendChild(bar);
        const header = document.querySelector('.site-header');
        const update = () => { const h = document.documentElement.scrollHeight - window.innerHeight; const y = window.scrollY || window.pageYOffset; const p = h > 0 ? (y / h) : 0;
            bar.style.transform = `scaleX(${Math.min(1,Math.max(0,p))})`; if (header) header.classList.toggle('shrink', y > 12); };
        addEventListener('scroll', update, { passive: true });
        addEventListener('resize', update);
        update();
    } catch {}

    // Captcha semplice (per richiesta)
    function setCaptcha(prefix) { const a = Math.floor(2 + Math.random() * 8); const b = Math.floor(2 + Math.random() * 8); const q = document.getElementById(prefix + 'CaptchaQ'); const input = document.getElementById(prefix + 'CaptchaInput'); if (q) q.textContent = `Quanto fa ${a} + ${b}?`; if (input) input.dataset.answer = String(a + b); }

    function checkCaptcha(prefix) { const input = document.getElementById(prefix + 'CaptchaInput'); if (!input) return true; const ok = input.value.trim() === (input.dataset.answer || ''); if (!ok) { alert('Verifica anti-spam non corretta. Riprova.');
            setCaptcha(prefix); } return ok; }
    setCaptcha('request');
})();