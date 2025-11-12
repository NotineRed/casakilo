PHP Registration + Email Verification (Mailtrap)

Endpoints
- `POST server/register.php` { name, email, password }
  - Creates/updates user, generates token, sends verification email via Mailtrap.
- `GET server/verify.php?token=...`
  - Marks the user as verified and shows a small confirmation page.
- `POST server/login.php` { email, password }
  - Checks credentials; returns 403 if not verified.
- `POST server/resend.php` { email }
  - Re-sends a new verification link if not yet verified.

Quick Start (Local)
1) Install PHP 8+ with SQLite and cURL enabled (default on most distros).
2) Edit `server/config.php`:
   - Set `APP_URL` (e.g., `http://localhost:8000`).
   - Set `MAILTRAP_TOKEN`, `MAILTRAP_FROM_EMAIL`, `MAILTRAP_FROM_NAME`.
3) Start a PHP dev server from the project root:
   - `php -S localhost:8000`
   - Endpoints will be available under `http://localhost:8000/server/...`.

Testing via curl
Register:
```
curl -X POST http://localhost:8000/server/register.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Mario","email":"mario@example.com","password":"secret123"}'
```
Check your Mailtrap inbox and open the verify link.

Login:
```
curl -X POST http://localhost:8000/server/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"mario@example.com","password":"secret123"}'
```

Notes
- Database: SQLite file auto-created at `server/db.sqlite`.
- Hosting: PHP is not supported by Netlify; use a PHP-capable host (Apache/Nginx, cPanel, etc.) or run locally.
- Security: Basic only (hashing with `password_hash`). Add rate limiting/CSRF/session management as needed in production.

