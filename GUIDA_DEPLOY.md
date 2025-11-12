# 🚀 Guida Deploy Casa Kilò su Netlify

## ✅ File Creati
Ho creato le Netlify Functions per sostituire PHP:
- `netlify/functions/register.js` - Registrazione utenti
- `netlify/functions/login.js` - Login utenti  
- `netlify/functions/verify.js` - Verifica email
- `netlify/functions/send-code.js` - Invio codici (già esistente)

---

## 📝 STEP DA SEGUIRE

### **1. Crea Account Supabase (Database)**
1. Vai su [supabase.com](https://supabase.com)
2. Registrati gratuitamente
3. Crea un nuovo progetto (scegli regione vicina, es. Frankfurt)
4. Vai su **SQL Editor** e esegui questo codice:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  verify_token TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verify_token ON users(verify_token);
```

5. Vai su **Settings** > **API**
6. Copia questi valori:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public key** (chiave pubblica)

---

### **2. Crea Account Brevo (Email)**
1. Vai su [brevo.com](https://www.brevo.com) (ex Sendinblue)
2. Registrati gratuitamente (300 email/giorno gratis)
3. Vai su **SMTP & API** > **API Keys**
4. Crea una nuova API key e copiala

---

### **3. Deploy su Netlify**

#### A. Connetti GitHub a Netlify
1. Vai su [netlify.com](https://netlify.com)
2. Registrati/Login (puoi usare il tuo account GitHub)
3. Click su **Add new site** > **Import an existing project**
4. Scegli **GitHub** e autorizza Netlify
5. Seleziona il repository **casakilo**
6. Impostazioni build:
   - **Build command:** lascia vuoto
   - **Publish directory:** `.` (punto)
7. Click **Deploy**

#### B. Configura le Variabili d'Ambiente
1. Nel tuo sito Netlify, vai su **Site settings** > **Environment variables**
2. Aggiungi queste variabili (click **Add a variable**):

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = la_tua_chiave_anon_public
BREVO_API_KEY = la_tua_api_key_brevo
FROM_EMAIL = no-reply@tuodominio.com
FROM_NAME = Casa Vacanze Kilò
APP_URL = https://tuosito.netlify.app
```

**IMPORTANTE:** Sostituisci `tuosito` con il nome effettivo che Netlify ti assegna (es. `casakilo-abc123.netlify.app`)

3. Click **Save**
4. Vai su **Deploys** e click **Trigger deploy** > **Clear cache and deploy**

---

### **4. Aggiorna il Frontend** (lo faccio io dopo)
Devo modificare i file JavaScript per chiamare le nuove API:
- Cambio `server/login.php` → `/.netlify/functions/login`
- Cambio `server/register.php` → `/.netlify/functions/register`
- Cambio `server/verify.php` → `/.netlify/functions/verify`

---

## 🎯 Riepilogo Costi
- **Netlify:** GRATIS (100GB bandwidth/mese)
- **Supabase:** GRATIS (500MB database, 50.000 richieste/mese)
- **Brevo:** GRATIS (300 email/giorno)

Tutto **100% gratuito** per iniziare! 🎉

---

## ⚠️ Note Importanti

### Sicurezza Password
Le funzioni usano SHA-256 per l'hash delle password. Per produzione seria, considera:
- Usare **Supabase Auth** (gestisce tutto automaticamente)
- Oppure libreria bcrypt per Node.js

### Domini Personalizzati
Puoi collegare il tuo dominio personalizzato su Netlify:
1. **Domains** > **Add a domain**
2. Segui le istruzioni per configurare DNS

---

## 🆘 Prossimi Passi
Fammi sapere quando hai:
1. ✅ Creato account Supabase e database
2. ✅ Creato account Brevo e API key
3. ✅ Fatto deploy su Netlify
4. ✅ Configurato le variabili d'ambiente

Poi aggiorno il frontend per usare le nuove API! 🚀
