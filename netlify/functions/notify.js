// New submission → notify Sir Leo (email + SMS) + auto-reply to lead + Resend audience sync
const { sbHeaders, tableUrl } = require('./lib/supabase');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let payload;
  try { payload = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad JSON' }; }

  const row = payload.record || payload;
  const { name, phone, email, panel_type, utm_source, data } = row;
  const firstName = name?.split(' ')[0] || '';
  const serveType = (() => {
    if (!panel_type) return '';
    if (panel_type.startsWith('audience-')) return panel_type.replace('audience-', '');
    if (panel_type.startsWith('serve-')) return panel_type.replace('serve-', '');
    if (panel_type.startsWith('edu-')) return 'education';
    return '';
  })();
  const isSessionLead = (() => {
    const answers = JSON.stringify(data || {}).toLowerCase();
    if (panel_type === 'serve-individuals' || panel_type === 'book') return true;
    if (panel_type !== 'audience-individuals') return false;
    return !/education|coaching|workshop|keynote|learn/.test(answers);
  })();

  // ── Email via Resend ──
  const sendEmail = (to, subject, html) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Sir Leo Site <onboarding@resend.dev>', to: [to], subject, html }),
    });

  // ── SMS via Google Voice email gateway ──
  const sendSMS = (body) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Sir Leo Site <onboarding@resend.dev>', to: ['17732348238@txt.voice.google.com'], subject: body, html: body }),
    });

  // ── Resend audience sync (test submissions go to test audience) ──
  const syncAudience = async () => {
    const { RESEND_AUDIENCE_KEY, RESEND_AUDIENCE_ID, RESEND_TEST_AUDIENCE_ID } = process.env;
    const audienceId = row.data?.is_test ? RESEND_TEST_AUDIENCE_ID : RESEND_AUDIENCE_ID;
    if (!RESEND_AUDIENCE_KEY || !audienceId || !email) return;
    return fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_AUDIENCE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: name?.split(' ').slice(1).join(' ') || '',
        unsubscribed: false,
        properties: {
          panel_type:  panel_type || 'unknown',
          utm_source:  utm_source || '',
          tier:        data?.tier || '',
          serve_type:  serveType,
          converted:   'false',
        },
      }),
    });
  };

  const notifyHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a0e06;background:#f4ebd9;padding:40px 36px;border-top:3px solid #6B1A1A;">
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8B2020;margin-bottom:8px;">New Inquiry</p>
      <h1 style="font-size:28px;font-weight:300;font-style:italic;margin:0 0 32px;">${name || 'Someone'} reached out.</h1>
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:2;">
        <tr><td style="color:#9a7850;width:120px;">Source</td><td><strong>${panel_type || '—'}</strong></td></tr>
        <tr><td style="color:#9a7850;">Name</td><td>${name || '—'}</td></tr>
        <tr><td style="color:#9a7850;">Phone</td><td><a href="sms:${phone}" style="color:#6B1A1A;">${phone || '—'}</a></td></tr>
        <tr><td style="color:#9a7850;">Email</td><td><a href="mailto:${email}" style="color:#6B1A1A;">${email || '—'}</a></td></tr>
        ${utm_source ? `<tr><td style="color:#9a7850;">From</td><td>${utm_source}</td></tr>` : ''}
      </table>
      ${data ? `
      <div style="margin-top:24px;padding:20px;background:#ede3cf;font-size:13px;line-height:1.8;">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8B2020;margin-bottom:12px;">Their Answers</p>
        ${Object.entries(data).filter(([k]) => k !== 'selections').map(([k,v]) => `<p><strong>${k}:</strong> ${Array.isArray(v) ? v.join(', ') : v}</p>`).join('')}
        ${data.selections?.length ? `<p><strong>Selections:</strong> ${data.selections.join(' → ')}</p>` : ''}
      </div>` : ''}
      <p style="margin-top:32px;font-size:12px;color:#9a7850;">
        <a href="https://supabase.com/dashboard/project/mwpscytkzjtkqjjqytqu/editor" style="color:#6B1A1A;">View in Supabase →</a>
      </p>
    </div>`;

  const replyHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a0e06;background:#f4ebd9;padding:48px 36px;border-top:3px solid #6B1A1A;">
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8B2020;margin-bottom:8px;">Sir Leo</p>
      <h1 style="font-size:32px;font-weight:300;font-style:italic;line-height:1.2;margin:0 0 28px;">
        ${firstName ? `${firstName},` : ''}<br>your inquiry was received.
      </h1>
      <p style="font-size:15px;line-height:2;color:#5a3e1e;margin-bottom:24px;">
        Sir Leo reviews every inquiry personally and responds within 48 hours.<br>
        Until then — consider carefully. Not every inquiry leads to a session.
      </p>
      <div style="border-top:1px solid rgba(107,26,26,0.2);padding-top:28px;margin-top:28px;font-size:13px;color:#9a7850;line-height:2;">
        <p>Text: <a href="sms:+17732348238" style="color:#6B1A1A;">(773) 234-8238</a></p>
        <p>Instagram: <a href="https://instagram.com/sir_black_leo" style="color:#6B1A1A;">@sir_black_leo</a></p>
      </div>
      <p style="margin-top:32px;font-size:11px;color:#b0a080;letter-spacing:0.1em;">Chicago · Est. 2024</p>
    </div>`;

  const smsBody = `Sir Leo — New inquiry from ${name || 'someone'} (${panel_type || 'site'}). Phone: ${phone || 'none'}. Email: ${email || 'none'}.`;

  // ── Auto-create draft session offer ──
  const createSessionOffer = async () => {
    const { SUPABASE_SERVICE_KEY } = process.env;
    if (!SUPABASE_SERVICE_KEY) return;
    return fetch(tableUrl('session_offers'), {
      method: 'POST',
      headers: sbHeaders(SUPABASE_SERVICE_KEY, { prefer: 'return=minimal' }),
      body: JSON.stringify({
        submission_id: row.id || null,
        client_name: name || null,
        client_email: email || null,
        client_phone: phone || null,
        status: 'draft',
        source: 'auto',
        created_at: new Date().toISOString(),
        ...(row.data?.is_test ? { private_notes: '[TEST]' } : {}),
      }),
    });
  };

  try {
    await Promise.allSettled([
      sendEmail('sir.black.leo@gmail.com', `New lead: ${name || 'Unknown'} — ${panel_type || 'site'}`, notifyHtml),
      email ? sendEmail(email, 'Sir Leo received your inquiry.', replyHtml) : null,
      sendSMS(smsBody),
      syncAudience(),
      isSessionLead ? createSessionOffer() : null,
    ].filter(Boolean));

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Notify error:', err.message);
    return { statusCode: 500, body: err.message };
  }
};
