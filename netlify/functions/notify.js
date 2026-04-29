// Receives Supabase webhook on new submission → emails Sir Leo via Resend
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let payload;
  try { payload = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad JSON' }; }

  // Supabase sends { type, table, record, old_record }
  const row = payload.record || payload;
  const { name, phone, email, panel_type, utm_source, data } = row;

  const subject = `New lead: ${name || 'Unknown'} — ${panel_type || 'site'}`;

  const html = `
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

      ${data ? `<div style="margin-top:24px;padding:20px;background:#ede3cf;font-size:13px;line-height:1.8;">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8B2020;margin-bottom:12px;">Their Answers</p>
        ${Object.entries(data).filter(([k]) => k !== 'selections').map(([k, v]) =>
          `<p><strong>${k}:</strong> ${v}</p>`
        ).join('')}
        ${data.selections?.length ? `<p><strong>Path:</strong> ${data.selections.join(' → ')}</p>` : ''}
      </div>` : ''}

      <p style="margin-top:32px;font-size:12px;color:#9a7850;">
        View in <a href="https://supabase.com/dashboard/project/mwpscytkzjtkqjjqytqu/editor" style="color:#6B1A1A;">Supabase dashboard</a>
      </p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sir Leo Site <onboarding@resend.dev>',
        to: ['sir.black.leo@gmail.com'],
        subject,
        html,
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(result));

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Notify error:', err.message);
    return { statusCode: 500, body: err.message };
  }
};
