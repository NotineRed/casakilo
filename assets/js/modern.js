/**
 * Casa Kilò - Modern JavaScript
 * Ultra-modern ES6+ with animations, dark mode, clipboard API
 */

(function() {
    'use strict';

    // Constants
    const EMAIL = 'giammi20000@gmail.com';
    const PHONE = '+39 329 834 1368';
    const WHATSAPP_LINK = 'https://wa.me/393298341368?text=Ciao%20Casa%20Kilò%2C%20vorrei%20info%20e%20disponibilit%C3%A0';
    
    // DOM Elements
    const loader = document.querySelector('.loader');
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const themeToggle = document.getElementById('themeToggle');
    const backToTop = document.getElementById('backToTop');
    const bookingForm = document.getElementById('bookingForm');
    const copyEmailBtn = document.getElementById('copyEmail');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    // State
    let currentImageIndex = 0;
    let galleryImages = [];
    
    // Cookie Consent State
    const COOKIE_CONSENT_KEY = 'casakilo_cookie_consent';
    const COOKIE_CONSENT_DATE = 'casakilo_cookie_date';
    let theme = localStorage.getItem('theme') || 'light';
    
    /**
     * Initialize App
     */
    function init() {
        setupLoader();
        setupTheme();
        setupNavigation();
        setupScrollEffects();
        setupAnimations();
        setupGallery();
        setupForms();
        setupButtons();
        setupCookieBanner();
        updateYear();
    }
    
    /**
     * Loader
     */
    function setupLoader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500);
        });
    }
    
    /**
     * Theme Management
     */
    function setupTheme() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon();
        
        // Theme toggle listener
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                theme = theme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                updateThemeIcon();
                
                // Smooth transition
                document.documentElement.style.transition = 'background 0.3s ease, color 0.3s ease';
                setTimeout(() => {
                    document.documentElement.style.transition = '';
                }, 300);
            });
        }
    }
    
    function updateThemeIcon() {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
    
    /**
     * Navigation
     */
    function setupNavigation() {
        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }
        
        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navToggle) navToggle.classList.remove('active');
                if (navMenu) navMenu.classList.remove('active');
            });
        });
        
        // Active link on scroll
        const sections = document.querySelectorAll('section[id]');
        
        function setActiveLink() {
            const scrollY = window.scrollY;
            
            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    if (navLink) navLink.classList.add('active');
                }
            });
        }
        
        window.addEventListener('scroll', setActiveLink, { passive: true });
        setActiveLink();
    }
    
    /**
     * Scroll Effects
     */
    function setupScrollEffects() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            // Navbar style on scroll
            if (navbar) {
                if (currentScroll > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
            
            // Back to top button
            if (backToTop) {
                if (currentScroll > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
        
        // Back to top click
        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
    
    /**
     * Animations - Custom AOS-like implementation
     */
    function setupAnimations() {
        const animatedElements = document.querySelectorAll('[data-aos]');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
    
    /**
     * Gallery & Lightbox
     */
    function setupGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryImages = Array.from(galleryItems).map(item => item.querySelector('img'));
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentImageIndex = index;
                openLightbox(galleryImages[index].src);
            });
        });
        
        // Lightbox controls
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                lightboxImg.src = galleryImages[currentImageIndex].src;
            });
        }
        
        if (lightboxNext) {
            lightboxNext.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                lightboxImg.src = galleryImages[currentImageIndex].src;
            });
        }
        
        // Close on background click
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox || !lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                lightboxPrev?.click();
            } else if (e.key === 'ArrowRight') {
                lightboxNext?.click();
            }
        });
        
        // Lazy loading for images
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports lazy loading
            lazyImages.forEach(img => {
                img.src = img.src;
            });
        } else {
            // Fallback for older browsers
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.src;
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    function openLightbox(src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    /**
     * Forms
     */
    function setupForms() {
        if (bookingForm) {
            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(bookingForm);
                const data = Object.fromEntries(formData);
                
                // Create message for clipboard
                const message = `🏛️ RICHIESTA PRENOTAZIONE - CASA KILÒ\n\n` +
                    `📅 Check-in: ${data.checkIn}\n` +
                    `📅 Check-out: ${data.checkOut}\n` +
                    `👥 Ospiti: ${data.guests}\n` +
                    `👤 Nome: ${data.fullName}\n` +
                    `📧 Email: ${data.email}\n` +
                    `${data.message ? `💬 Messaggio: ${data.message}\n` : ''}\n` +
                    `\n📧 Invia a: ${EMAIL}`;
                
                try {
                    await copyToClipboard(message);
                    
                    // Visual feedback
                    const submitBtn = bookingForm.querySelector('button[type="submit"]');
                    const originalHTML = submitBtn.innerHTML;
                    
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Richiesta copiata!</span>';
                    submitBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalHTML;
                        submitBtn.style.background = '';
                        bookingForm.reset();
                    }, 3000);
                    
                } catch (err) {
                    alert(message);
                }
            });
        }
        
        // Auto-set min dates for check-in/out
        const checkInInput = document.getElementById('checkIn');
        const checkOutInput = document.getElementById('checkOut');
        
        if (checkInInput) {
            const today = new Date().toISOString().split('T')[0];
            checkInInput.min = today;
            
            checkInInput.addEventListener('change', () => {
                if (checkOutInput) {
                    const checkIn = new Date(checkInInput.value);
                    const nextDay = new Date(checkIn);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkOutInput.min = nextDay.toISOString().split('T')[0];
                }
            });
        }
    }
    
    /**
     * Buttons & Actions
     */
    function setupButtons() {
        // Copy Email Button
        if (copyEmailBtn) {
            copyEmailBtn.addEventListener('click', async () => {
                try {
                    await copyToClipboard(EMAIL);
                    
                    const icon = copyEmailBtn.querySelector('i');
                    const span = copyEmailBtn.querySelector('span');
                    const originalText = span.textContent;
                    
                    icon.className = 'fas fa-check';
                    span.textContent = 'Email copiata!';
                    copyEmailBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                    copyEmailBtn.style.color = 'white';
                    copyEmailBtn.style.borderColor = '#28a745';
                    
                    setTimeout(() => {
                        icon.className = 'fas fa-copy';
                        span.textContent = originalText;
                        copyEmailBtn.style.background = '';
                        copyEmailBtn.style.color = '';
                        copyEmailBtn.style.borderColor = '';
                    }, 2500);
                    
                } catch (err) {
                    alert(`Email: ${EMAIL}`);
                }
            });
        }
        
        // Book Now Button
        const bookNowBtn = document.getElementById('bookNow');
        if (bookNowBtn) {
            bookNowBtn.addEventListener('click', () => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // View Gallery Button
        const viewGalleryBtn = document.getElementById('viewGallery');
        if (viewGalleryBtn) {
            viewGalleryBtn.addEventListener('click', () => {
                document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // View Map Button
        const viewMapBtn = document.getElementById('viewMap');
        if (viewMapBtn) {
            viewMapBtn.addEventListener('click', () => {
                // Could open Google Maps or integrate a map API
                window.open(`https://www.google.com/maps/search/Palermo,+Italia`, '_blank');
            });
        }
    }
    
    /**
     * Utility: Copy to Clipboard
     */
    async function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
            } catch (err) {
                throw new Error('Copy failed');
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }
    
    /**
     * Update Year
     */
    function updateYear() {
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    /**
     * Smooth scroll for anchor links
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for navbar height
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    /**
     * Performance: Passive event listeners
     */
    function addPassiveListeners() {
        const passiveEvents = ['scroll', 'wheel', 'touchstart', 'touchmove'];
        
        passiveEvents.forEach(event => {
            document.addEventListener(event, () => {}, { passive: true });
        });
    }
    
    /**
     * Error handling for images
     */
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.style.opacity = '0.3';
            this.style.filter = 'grayscale(1)';
        });
    });
    
    /**
     * Cookie Consent Banner
     */
    function setupCookieBanner() {
        // Check if user has already made a choice
        const cookieConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        
        if (cookieConsent === null) {
            // User hasn't made a choice yet, show banner
            showCookieBanner();
        }
    }
    
    function showCookieBanner() {
        // Create cookie banner HTML
        const bannerHTML = `
            <div class="cookie-banner" id="cookieBanner">
                <div class="cookie-content">
                    <div class="cookie-text">
                        <h3><i class="fas fa-cookie-bite"></i> Utilizzo dei Cookie</h3>
                        <p>
                            Utilizziamo cookie tecnici essenziali per il funzionamento del sito. 
                            Senza accettare i cookie, alcune funzionalità come l'invio dei moduli non saranno disponibili.
                            <a href="privacy-policy.html" target="_blank">Leggi l'informativa completa</a>
                        </p>
                    </div>
                    <div class="cookie-actions">
                        <button class="cookie-btn cookie-btn-decline" id="cookieDecline">
                            Rifiuta
                        </button>
                        <button class="cookie-btn cookie-btn-accept" id="cookieAccept">
                            Accetta Cookie
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert banner into DOM
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        
        // Get elements
        const banner = document.getElementById('cookieBanner');
        const acceptBtn = document.getElementById('cookieAccept');
        const declineBtn = document.getElementById('cookieDecline');
        
        // Show banner with animation
        setTimeout(() => {
            banner.classList.add('show');
        }, 1000);
        
        // Accept button
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
            localStorage.setItem(COOKIE_CONSENT_DATE, new Date().toISOString());
            hideCookieBanner(banner);
        });
        
        // Decline button
        declineBtn.addEventListener('click', () => {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
            localStorage.setItem(COOKIE_CONSENT_DATE, new Date().toISOString());
            hideCookieBanner(banner);
        });
    }
    
    function hideCookieBanner(banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.classList.add('hidden');
        }, 500);
    }
    
    function checkCookieConsent() {
        const cookieConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        return cookieConsent === 'accepted';
    }
    
    // Export for use in forms
    window.checkCookieConsent = checkCookieConsent;
    
    // Initialize app on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Add passive listeners
    addPassiveListeners();
    
})();
