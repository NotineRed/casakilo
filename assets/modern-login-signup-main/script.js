function toggleTheme() {
    const root = document.documentElement;
    const themeBtn = document.getElementById('themeToggleBtn');
    const icon = themeBtn.querySelector('i');

    if (root.hasAttribute('data-theme')) {
        root.removeAttribute('data-theme');
        localStorage.setItem('selectedTheme', 'light');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('selectedTheme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Carica il tema salvato all'avvio
window.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('selectedTheme');
    const themeBtn = document.getElementById('themeToggleBtn');
    const icon = themeBtn ? themeBtn.querySelector('i') : null;

    if (savedTheme === 'dark' && icon) {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});

// Toggle tema
document.getElementById('themeBtn').addEventListener('click', function() {
    const root = document.documentElement;
    const icon = this.querySelector('i');

    if (root.hasAttribute('data-theme')) {
        root.removeAttribute('data-theme');
        icon.className = 'fas fa-moon';
    } else {
        root.setAttribute('data-theme', 'dark');
        icon.className = 'fas fa-sun';
    }
});

// Auto-format date inputs con /
function formatDateInput(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Rimuovi tutto tranne i numeri

        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        if (value.length >= 5) {
            value = value.substring(0, 5) + '/' + value.substring(5, 9);
        }

        e.target.value = value;
    });
}

// Applica il formato alle date
document.addEventListener('DOMContentLoaded', function() {
    const checkinInput = document.getElementById('checkinInput');
    const checkoutInput = document.getElementById('checkoutInput');

    if (checkinInput) formatDateInput(checkinInput);
    if (checkoutInput) formatDateInput(checkoutInput);
});

// Form submit - USA FORMSPREE (gratuito)
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const btn = document.querySelector('.submit-btn');
    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invio...';
    btn.disabled = true;

    const formData = new FormData(this);
    formData.set('telefono', formData.get('prefisso') + ' ' + formData.get('telefono'));

    // USA FORMSPREE (sostituisci YOUR_FORM_ID con il tuo ID)
    fetch('https://formspree.io/f/mwpakgqe', {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(res => {
            if (res.ok) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Inviato!';
                btn.style.background = '#4caf50';
                setTimeout(() => this.reset(), 2000);
            } else {
                throw new Error('Errore invio');
            }
        })
        .catch(() => {
            btn.innerHTML = '<i class="fas fa-times"></i> Errore';
            btn.style.background = '#f44336';
        })
        .finally(() => {
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        });
});

// Animazione smooth per gli input
document.querySelectorAll('.field-container input, .field-container select, .field-container textarea').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});