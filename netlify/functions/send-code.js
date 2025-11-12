// Netlify Function: send-code
// Sends a verification email via Brevo (Sendinblue)
// Set environment variables in Netlify:
// - BREVO_API_KEY (required)
// - FROM_EMAIL (optional, default: no-reply@kilohost.local)
// - FROM_NAME  (optional, default: Casa Kilò)

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

  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'no-reply@kilohost.local';
  const fromName = process.env.FROM_NAME || 'Casa Kilò';

  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing BREVO_API_KEY' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const toEmail = String(payload.toEmail || '').trim();
  const toName = String(payload.toName || 'Ospite').trim();
  const code = String(payload.code || '').trim();

  if (!toEmail || !code) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing toEmail or code' }) };
  }

  const subject = 'Codice verifica – Casa Kilò';
  const text = `Ciao ${toName},\n\nQuesto è il tuo codice di verifica: ${code}\n\nInseriscilo nella schermata di verifica per completare la registrazione.`;
  const html = `<p>Ciao ${escapeHtml(toName)},</p>
  <p>Questo è il tuo codice di verifica:</p>
  <p style="font-size:20px;font-weight:700;letter-spacing:2px">${escapeHtml(code)}</p>
  <p>Inseriscilo nella schermata di verifica per completare la registrazione.</p>`;

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

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Brevo error', detail: errText }) };
    }

    const data = await resp.json();
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: data.messageId || null }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Request failed', detail: String(e) }) };
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

