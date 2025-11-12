// Netlify Function: register
// Registra un nuovo utente e invia email di verifica
// Variabili d'ambiente richieste:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - BREVO_API_KEY
// - FROM_EMAIL (opzionale)
// - FROM_NAME (opzionale)
// - APP_URL (opzionale)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // Variabili d'ambiente
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'no-reply@casavacanzekilò.com';
    const fromName = process.env.FROM_NAME || 'Casa Vacanze Kilò';
    const appUrl = process.env.APP_URL || 'https://casakilo.netlify.app';

    if (!supabaseUrl || !supabaseKey) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing Supabase config' }) };
    }

    if (!brevoApiKey) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing BREVO_API_KEY' }) };
    }

    // Parse body
    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');

    // Validazione
    if (!name || name.length < 2) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Nome non valido' }) };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email non valida' }) };
    }

    if (password.length < 6) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Password troppo corta (minimo 6 caratteri)' }) };
    }

    // Connetti a Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Genera token di verifica
        const verifyToken = generateToken(32);

        // Hash della password (usando crypto)
        const passwordHash = await hashPassword(password);

        // Controlla se l'utente esiste già
        const { data: existing } = await supabase
            .from('users')
            .select('id, verified')
            .eq('email', email)
            .single();

        if (existing) {
            if (existing.verified) {
                return { statusCode: 409, headers, body: JSON.stringify({ error: 'Email già registrata e verificata' }) };
            }
            // Aggiorna utente non verificato
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    name,
                    password_hash: passwordHash,
                    verify_token: verifyToken,
                    verified: false,
                })
                .eq('email', email);

            if (updateError) throw updateError;
        } else {
            // Inserisci nuovo utente
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    name,
                    email,
                    password_hash: passwordHash,
                    verify_token: verifyToken,
                    verified: false,
                });

            if (insertError) throw insertError;
        }

        // Invia email di verifica
        const verifyLink = `${appUrl}/.netlify/functions/verify?token=${verifyToken}`;
        const emailSent = await sendVerificationEmail(
            email,
            name,
            verifyLink,
            brevoApiKey,
            fromEmail,
            fromName
        );

        if (!emailSent) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Errore invio email' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ok: true,
                message: 'Registrazione ricevuta. Controlla la mail per verificare.',
            }),
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Errore durante la registrazione', detail: error.message }),
        };
    }
}

// Genera token random
function generateToken(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        token += chars[array[i] % chars.length];
    }
    return token;
}

// Hash password con SHA-256 (in produzione usa bcrypt o Supabase Auth)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Invia email di verifica tramite Brevo
async function sendVerificationEmail(toEmail, toName, verifyLink, apiKey, fromEmail, fromName) {
    const subject = 'Verifica email - Casa Vacanze Kilò';
    const html = `
    <p>Ciao ${escapeHtml(toName)},</p>
    <p>Per completare la registrazione, clicca il seguente link:</p>
    <p><a href="${escapeHtml(verifyLink)}" style="display:inline-block;padding:12px 24px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">Verifica il tuo account</a></p>
    <p>Oppure copia questo URL nel browser:<br>${escapeHtml(verifyLink)}</p>
    <p>Grazie!</p>
  `;
    const text = `Ciao ${toName},\n\nPer completare la registrazione, visita:\n${verifyLink}\n\nGrazie!`;

    try {
        const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { email: fromEmail, name: fromName },
                to: [{ email: toEmail, name: toName }],
                subject,
                textContent: text,
                htmlContent: html,
            }),
        });

        return resp.ok;
    } catch (e) {
        console.error('Email send error:', e);
        return false;
    }
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}