// Runs daily — sends multi-step follow-up sequences based on panel_type
// Step 0 = not started, 1 = Day 2 sent, 2 = Day 5 sent, 3 = Day 10 sent, 4 = Day 21 sent

const { sbHeaders, tableUrl } = require('./lib/supabase');
const FROM = 'Sir Leo <onboarding@resend.dev>';

// ── Audience helper ──────────────────────────────────────────────────────────
// panel_type is the source of truth; selected path refines the audience.

function audience(lead) {
  const panelType = lead.panel_type || '';
  const answers = JSON.stringify(lead.data || {}).toLowerCase();
  const wantsEducation = /education|coaching|workshop|keynote|learn/.test(answers);

  if (panelType === 'edu-person' || panelType === 'edu-group') return 'education';
  if (panelType === 'audience-organizers') return wantsEducation ? 'education' : 'events';
  if (panelType === 'serve-organizers') return 'events';
  if (panelType === 'audience-individuals') return wantsEducation ? 'education' : 'sessions';
  return 'sessions'; // serve-individuals, book, contact, anything else
}

// ── Step 1: Day 2 ────────────────────────────────────────────────────────────

function emailStep1(lead) {
  const first = lead.name?.split(' ')[0] || '';

  if (audience(lead) === 'events') return {
    subject: 'About that group experience',
    html: buildEmail(first, `
      <p>You reached out about hosting a group experience. I wanted to follow up personally.</p>
      <p>These events work best when we design them together — the energy, the activities, the vibe your group is looking for. I don't run the same show twice.</p>
      <p>If you're still in the planning phase, let's get on a quick call. Or just reply here with more details about what you have in mind.</p>
      ${contactBlock()}
    `),
  };

  if (audience(lead) === 'education') return {
    subject: 'About what you want to learn',
    html: buildEmail(first, `
      <p>You reached out about education or coaching. I wanted to follow up personally.</p>
      <p>The right format depends on what you're trying to understand, practice, or build — private coaching, couples work, a group workshop, or something custom.</p>
      <p>If you want to add anything or have questions in the meantime, just reply here.</p>
      ${contactBlock()}
    `),
  };

  return {
    subject: 'Still thinking it over?',
    html: buildEmail(first, `
      <p>You reached out a couple days ago. I haven't forgotten.</p>
      <p>If you're still considering — or have questions you haven't asked yet — now's the time. I do a brief intake conversation before every session. It's not a big deal, just a real talk to make sure we're aligned.</p>
      <p>If you're ready to move forward, I'm here.</p>
      ${contactBlock()}
    `),
  };
}

// ── Step 2: Day 5 ────────────────────────────────────────────────────────────

function emailStep2(lead) {
  const first = lead.name?.split(' ')[0] || '';

  if (audience(lead) === 'events') return {
    subject: 'What makes a group experience actually work',
    html: buildEmail(first, `
      <p>Still thinking about the event. Wanted to share something real.</p>
      <p>The experiences that land — the ones people talk about for years — aren't the ones with the most going on. They're the ones where everyone feels safe enough to actually participate. That's what I build around first.</p>
      <p>If you're figuring out dates or logistics, I'm flexible. If you want to talk through options, I'm easy to reach.</p>
      ${contactBlock()}
    `),
  };

  if (audience(lead) === 'education') return {
    subject: 'A clearer path',
    html: buildEmail(first, `
      <p>Most people don't need more random information. They need a clearer container: what to learn first, what to practice, what to avoid, and how to communicate cleanly.</p>
      <p>That's what I build education around. If you're still thinking through the right format, reply with where you're starting from.</p>
      ${contactBlock()}
    `),
  };

  return {
    subject: 'A question',
    html: buildEmail(first, `
      <p>Quick check-in. What's holding you back?</p>
      <p>Sometimes it's timing. Sometimes it's questions no one's answered yet. Sometimes it's just needing to be ready. All of that is fine — I'm not chasing anyone.</p>
      <p>But if there's something specific, tell me. That's usually the fastest way through it.</p>
      ${contactBlock()}
    `),
  };
}

// ── Step 3: Day 10 ───────────────────────────────────────────────────────────

function emailStep3(lead) {
  const first = lead.name?.split(' ')[0] || '';

  if (audience(lead) === 'events') return {
    subject: 'Still want to make this happen?',
    html: buildEmail(first, `
      <p>Dates book up. If you're still planning a group experience and want to lock in something, now's the time to get it on the calendar.</p>
      <p>I need about a week of lead time for a solid event. If your date is coming up, reply today and we'll move fast.</p>
      ${contactBlock()}
    `),
  };

  if (audience(lead) === 'education') return {
    subject: 'Still want to learn this properly?',
    html: buildEmail(first, `
      <p>If you're still interested in education or a workshop, now is a good time to clarify the format.</p>
      <p>One-on-one, couples, and group work all need different containers. Reply with which direction feels closest and I'll help shape the next step.</p>
      ${contactBlock()}
    `),
  };

  return {
    subject: 'Last check-in for a while',
    html: buildEmail(first, `
      <p>I don't want to crowd your inbox. This is my last reach-out for a bit.</p>
      <p>If the timing was off, that's fine. When you're ready — whether that's next week or six months from now — I'm here. The door stays open.</p>
      <p>If something specific held you back, I'm still curious. Sometimes that conversation is useful for both of us.</p>
      ${contactBlock()}
    `),
  };
}

// ── Step 4: Day 21 ───────────────────────────────────────────────────────────

function emailStep4(lead) {
  const first = lead.name?.split(' ')[0] || '';
  return {
    subject: 'Still here',
    html: buildEmail(first, `
      <p>It's been a few weeks. I figured I'd check in one last time.</p>
      <p>No pressure, no pitch. If something changed for you — if you're ready now, or you have a new question — just reply. I read everything personally.</p>
      <p>If not, no hard feelings. You know where to find me.</p>
      ${contactBlock()}
    `),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildEmail(first, bodyHtml) {
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a0e06;background:#f4ebd9;padding:48px 36px;border-top:3px solid #6B1A1A;">
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8B2020;margin-bottom:8px;">Sir Leo</p>
      ${first ? `<p style="font-size:16px;font-style:italic;margin:0 0 20px;color:#5a3e1e;">${first},</p>` : ''}
      <div style="font-size:15px;line-height:2;color:#5a3e1e;">
        ${bodyHtml}
      </div>
      <p style="margin-top:40px;font-size:11px;color:#b0a080;letter-spacing:0.1em;">Chicago · Est. 2024 · sirblackleo.com</p>
    </div>`;
}

function contactBlock() {
  return `
    <div style="border-top:1px solid rgba(107,26,26,0.2);padding-top:20px;margin-top:24px;font-size:13px;color:#9a7850;line-height:2.2;">
      <p>Text: <a href="sms:+17732348238" style="color:#6B1A1A;">(773) 234-8238</a></p>
      <p>Instagram: <a href="https://instagram.com/sir_black_leo" style="color:#6B1A1A;">@sir_black_leo</a></p>
    </div>`;
}

async function sendEmail(apiKey, to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// ── Step windows (hours since created_at) ───────────────────────────────────

const STEPS = [
  { step: 1, minH: 44,  maxH: 52,  fn: emailStep1 },
  { step: 2, minH: 116, maxH: 124, fn: emailStep2 },
  { step: 3, minH: 236, maxH: 244, fn: emailStep3 },
  { step: 4, minH: 500, maxH: 516, fn: emailStep4 },
];

exports.handler = async () => {
  const { SUPABASE_SERVICE_KEY, RESEND_API_KEY } = process.env;
  if (!SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
    return { statusCode: 500, body: 'Missing env vars' };
  }

  const headers = sbHeaders(SUPABASE_SERVICE_KEY, { prefer: null });

  let totalSent = 0;
  let totalErrors = 0;

  for (const { step, minH, maxH, fn } of STEPS) {
    const cutoffStart = new Date(Date.now() - maxH * 60 * 60 * 1000).toISOString();
    const cutoffEnd   = new Date(Date.now() - minH * 60 * 60 * 1000).toISOString();

    const res = await fetch(
      tableUrl('submissions', `select=id,name,email,panel_type,data&email=not.is.null&sequence_step=eq.${step - 1}&created_at=gte.${cutoffStart}&created_at=lte.${cutoffEnd}`),
      { headers }
    );
    const leads = await res.json();
    if (!Array.isArray(leads) || !leads.length) continue;

    const results = await Promise.allSettled(leads.map(async (lead) => {
      const { subject, html } = fn(lead);
      await sendEmail(RESEND_API_KEY, lead.email, subject, html);
      await fetch(tableUrl('submissions', `id=eq.${lead.id}`), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sequence_step: step }),
      });
    }));

    const sent   = results.filter(r => r.status === 'fulfilled').length;
    const errors = results.filter(r => r.status === 'rejected').length;
    results.filter(r => r.status === 'rejected').forEach(r => console.error(`[followup] step ${step}:`, r.reason));
    totalSent += sent;
    totalErrors += errors;
    console.log(`[followup] step ${step}: sent ${sent}/${leads.length}`);
  }

  return { statusCode: 200, body: JSON.stringify({ sent: totalSent, errors: totalErrors }) };
};
