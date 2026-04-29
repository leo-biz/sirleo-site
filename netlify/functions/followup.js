// Runs daily — sends Day 2 follow-up to leads who haven't heard back yet
const SUPABASE_URL = 'https://mwpscytkzjtkqjjqytqu.supabase.co';

exports.handler = async () => {
  const { SUPABASE_SERVICE_KEY, RESEND_API_KEY } = process.env;
  if (!SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
    return { statusCode: 500, body: 'Missing env vars' };
  }

  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };

  // Fetch submissions 44–52 hours old, with email, not yet followed up
  const cutoffStart = new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString();
  const cutoffEnd   = new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString();

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/submissions?select=id,name,email,panel_type&follow_up_sent=eq.false&email=not.is.null&created_at=gte.${cutoffStart}&created_at=lte.${cutoffEnd}`,
    { headers }
  );
  const leads = await res.json();

  if (!leads.length) return { statusCode: 200, body: 'No leads to follow up' };

  const results = await Promise.allSettled(leads.map(async (lead) => {
    const firstName = lead.name?.split(' ')[0] || '';

    const emailHtml = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a0e06;background:#f4ebd9;padding:48px 36px;border-top:3px solid #6B1A1A;">
        <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8B2020;margin-bottom:8px;">Sir Leo</p>
        <h1 style="font-size:30px;font-weight:300;font-style:italic;line-height:1.3;margin:0 0 28px;">
          ${firstName ? `${firstName},` : ''}<br>still considering?
        </h1>
        <p style="font-size:15px;line-height:2;color:#5a3e1e;margin-bottom:24px;">
          You reached out a couple days ago. Sir Leo hasn't forgotten.<br>
          If you're ready to move forward — or simply have questions — now is the time.
        </p>
        <p style="font-size:15px;line-height:2;color:#5a3e1e;margin-bottom:32px;">
          Not every inquiry leads to a session. But the ones that do begin with a decision.
        </p>
        <div style="border-top:1px solid rgba(107,26,26,0.2);padding-top:28px;margin-top:8px;font-size:13px;color:#9a7850;line-height:2;">
          <p>Text: <a href="sms:+17732348238" style="color:#6B1A1A;">(773) 234-8238</a></p>
          <p>Instagram: <a href="https://instagram.com/sir_black_leo" style="color:#6B1A1A;">@sir_black_leo</a></p>
        </div>
        <p style="margin-top:32px;font-size:11px;color:#b0a080;letter-spacing:0.1em;">Chicago · Est. 2024</p>
      </div>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Sir Leo <onboarding@resend.dev>',
        to: [lead.email],
        subject: 'Still considering?',
        html: emailHtml,
      }),
    });

    // Mark as sent
    await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${lead.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ follow_up_sent: true }),
    });
  }));

  const sent = results.filter(r => r.status === 'fulfilled').length;
  console.log(`Follow-up: sent ${sent}/${leads.length}`);
  return { statusCode: 200, body: JSON.stringify({ sent, total: leads.length }) };
};
