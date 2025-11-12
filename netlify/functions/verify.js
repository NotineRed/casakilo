// Netlify Function: verify
// Verifica l'email di un utente tramite token
// Variabili d'ambiente richieste:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - APP_URL (opzionale)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const appUrl = process.env.APP_URL || 'https://casakilo.netlify.app';

    if (!supabaseUrl || !supabaseKey) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing Supabase config' }) };
    }

    // Leggi token dalla query string
    const token = event.queryStringParameters ? event.queryStringParameters.token || '' : '';

    if (!token) {
        return {
            statusCode: 400,
            headers: {...headers, 'Content-Type': 'text/html; charset=utf-8' },
            body: htmlResponse('Errore', 'Token mancante', appUrl),
        };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Trova utente con questo token
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, verified')
            .eq('verify_token', token)
            .single();

        if (error || !user) {
            return {
                statusCode: 404,
                headers: {...headers, 'Content-Type': 'text/html; charset=utf-8' },
                body: htmlResponse('Errore', 'Token non valido o scaduto', appUrl),
            };
        }

        if (user.verified) {
            return {
                statusCode: 200,
                headers: {...headers, 'Content-Type': 'text/html; charset=utf-8' },
                body: htmlResponse('Già verificato', 'Il tuo account è già stato verificato!', appUrl, true),
            };
        }

        // Verifica l'utente
        const { error: updateError } = await supabase
            .from('users')
            .update({
                verified: true,
                verified_at: new Date().toISOString(),
                verify_token: null,
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        return {
            statusCode: 200,
            headers: {...headers, 'Content-Type': 'text/html; charset=utf-8' },
            body: htmlResponse(
                'Verifica completata!',
                `Ciao ${user.name}! Il tuo account è stato verificato con successo. Ora puoi accedere.`,
                appUrl,
                true
            ),
        };
    } catch (error) {
        console.error('Verify error:', error);
        return {
            statusCode: 500,
            headers: {...headers, 'Content-Type': 'text/html; charset=utf-8' },
            body: htmlResponse('Errore', 'Si è verificato un errore durante la verifica', appUrl),
        };
    }
}

function htmlResponse(title, message, appUrl, success = false) {
    const color = success ? '#28a745' : '#dc3545';
    const icon = success ? '✓' : '✗';
    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Casa Vacanze Kilò</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
    }
    .container {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 500px;
      text-align: center;
    }
    .icon {
      font-size: 4rem;
      color: ${color};
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: ${color};
    }
    p {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    a {
      display: inline-block;
      padding: 12px 32px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: background 0.3s;
    }
    a:hover {
      background: #5568d3;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${appUrl}">Torna alla home</a>
  </div>
</body>
</html>`;
}