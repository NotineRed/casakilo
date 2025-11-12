PHPMailer + Mailtrap (SMTP)

Prerequisiti
- PHP 8+ su XAMPP (Apache attivo)
- Composer per Windows (installer ufficiale)
- Credenziali SMTP di Mailtrap (Email Testing → SMTP Settings)

Installazione
1) Dalla root del progetto esegui:
   composer install
   (crea la cartella vendor/ con PHPMailer)
2) Apri server/config.php e imposta:
   - APP_URL (es. http://localhost/casakilo)
   - SMTP_HOST = sandbox.smtp.mailtrap.io
   - SMTP_PORT = 2525
   - SMTP_USER / SMTP_PASS = quelli della tua Inbox
   - FROM_EMAIL / FROM_NAME

Invio test
- Avvia Apache (XAMPP Control Panel → Start su Apache)
- POST JSON a http://localhost/casakilo/server/mailer.php con body:
  {"toEmail":"tuoindirizzo@inbox.mailtrap.io","toName":"Test","subject":"Prova","html":"<p>Ciao!</p>"}
  (puoi usare un client REST o curl)

Uso in altri script PHP
```php
require_once __DIR__ . '/mailer.php';
[$ok, $err] = send_mail('dest@example.com', 'Nome', 'Oggetto', '<p>Corpo HTML</p>');
if (!$ok) { /* gestisci errore $err */ }
```

Note
- Se vedi "Autoloader non trovato", esegui `composer install` nella root del progetto.
- Con Mailtrap (Email Testing) le email non escono su Internet: le trovi solo nella Inbox di test.

## Endpoint contatti
- POST `http://localhost/casakilo/server/send-contact.php` con JSON
  `{ "name": "Mario", "email": "mario@example.com", "checkin": "2025-11-20", "checkout": "2025-11-22", "guests": 2, "message": "Vorrei info" }`
