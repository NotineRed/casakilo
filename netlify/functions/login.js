// Netlify Function: login
// Autentica un utente esistente
// Variabili d'ambiente richieste:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY

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

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing Supabase config' }) };
    }

    // Parse body
    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');

    // Validazione
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dati non validi' }) };
    }

    // Connetti a Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Trova utente
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, password_hash, verified')
            .eq('email', email)
            .single();

        if (error || !user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Credenziali non valide' }) };
        }

        // Verifica password
        const passwordHash = await hashPassword(password);
        if (passwordHash !== user.password_hash) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Credenziali non valide' }) };
        }

        // Verifica se email è verificata
        if (!user.verified) {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Email non verificata' }) };
        }

        // Login riuscito
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ok: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            }),
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Errore durante il login', detail: error.message }),
        };
    }
}

// Hash password con SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}