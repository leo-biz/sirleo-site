// Runs daily — sends multi-step follow-up sequences based on audience/panel_type
// Step 0 = not started, 1 = Day 2 sent, 2 = Day 5 sent, 3 = Day 10 sent, 4 = Day 21 sent

const SUPABASE_URL = 'https://mwpscytkzjtkqjjqytqu.supabase.co';
const FROM = 'Sir Leo <onboarding@resend.dev>';

// ── Email templates per audience ────────────────────────────────────────────

function emailStep1(lead) {
  const first = lead.name?.split(' ')[0] || '';
  const src = lead.data?.source_page || lead.panel_type;

  if (src === 'events' || lead.panel_type === 'serve-organizers') {
    return {
      subject: 'About that group experience',
      html: buildEmail(first, `
        <p>You reached out about hosting a group experience. I wanted to follow up personally.</p>
        <p>These events work best when we design them together — the energy, the activities, the vibe your group is looking for. I don't run the same show twice.</p>
        <p>If you're still in the planning phase, let's get on a quick call. Or just reply here with more details about what you have in mind.</p>
        ${contactBlock()}
      `),
    };
  }

  if (src === 'training' && lead.data?.audience === 'women-monetize' || src === 'for-women' || lead.data?.audience === 'women-monetize') {
    return {
      subject: 'Your application',
      html: buildEmail(first, `
        <p>I got your application for the women's training program.</p>
        <p>I review these personally. If I think there's a fit, I'll reach out to set up a conversation — no pressure, just a real talk to see if this makes sense for where you are.</p>
        <p>In the meantime, if you have questions or want to tell me more about what you're building, just reply to this.</p>
        ${contactBlock()}
      `),
    };
  }

  if (src === 'training' && lead.data?.audience === 'men-certification' || src === 'certify' || lead.data?.audience === 'men-certification') {
    return {
      subject: 'Your certification application',
      html: buildEmail(first, `
        <p>Application received. I read through it.</p>
        <p>I'm selective about who gets into the program — not because I'm gatekeeping, but because the training only works if you're actually ready for it. I'll be in touch in the next day or two with next steps.</p>
        <p>If you want to add anything or have questions in the meantime, just reply here.</p>
        ${contactBlock()}
      `),
    };
  }

  if (src === 'men' || lead.data?.gender === 'male') {
    return {
      subject: 'Your session request',
      html: buildEmail(first, `
        <p>Got your session request. Appreciate you reaching out.</p>
        <p>Before I confirm anything, I like to have a brief conversation — just to make sure we're aligned on what you're looking for and that the session is the right fit. It's quick and straightforward.</p>
        <p>Reply here or reach out directly and we'll get that sorted.</p>
        ${contactBlock()}
      `),
    };
  }

  // Default: serve-individuals / sessions
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

function emailStep2(lead) {
  const first = lead.name?.split(' ')[0] || '';
  const src = lead.data?.source_page || lead.panel_type;

  if (src === 'events' || lead.panel_type === 'serve-organizers') {
    return {
      subject: 'What makes a group experience actually work',
      html: buildEmail(first, `
        <p>Still thinking about the event. Wanted to share something real.</p>
        <p>The experiences that land — the ones people talk about for years — aren't the ones with the most going on. They're the ones where everyone feels safe enough to actually participate. That's what I build around first.</p>
        <p>If you're figuring out dates or logistics, I'm flexible. If you want to talk through options, I'm easy to reach.</p>
        ${contactBlock()}
      `),
    };
  }

  if (src === 'training' && lead.data?.audience === 'women-monetize' || src === 'for-women' || lead.data?.audience === 'women-monetize') {
    return {
      subject: 'The part nobody talks about',
      html: buildEmail(first, `
        <p>Most women who want to do this stop before they start — not because they lack ability, but because they don't have a clear path. They're working it out alone.</p>
        <p>That's the gap the training fills. Not just technique. A whole structure you can actually build on.</p>
        <p>If you have questions about what the program involves, just ask. No pitch, just information.</p>
        ${contactBlock()}
      `),
    };
  }

  if (src === 'training' && lead.data?.audience === 'men-certification' || src === 'certify' || lead.data?.audience === 'men-certification') {
    return {
      subject: 'What separates providers who last',
      html: buildEmail(first, `
        <p>One thing I've noticed: the providers who actually build something real aren't necessarily the most skilled at the start. They're the ones who take the business side as seriously as the craft.</p>
        <p>That's what this program is built around — both. If you're still thinking through whether to move forward, I'm happy to answer specific questions.</p>
        ${contactBlock()}
      `),
    };
  }

  // Default
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

function emailStep3(lead) {
  const first = lead.name?.split(' ')[0] || '';
  const src = lead.data?.source_page || lead.panel_type;

  if (src === 'events' || lead.panel_type === 'serve-organizers') {
    return {
      subject: 'Still want to make this happen?',
      html: buildEmail(first, `
        <p>Dates book up. If you're still planning a group experience and want to lock in something, now's the time to get it on the calendar.</p>
        <p>I need about a week of lead time for a solid event. If your date is coming up, reply today and we'll move fast.</p>
        ${contactBlock()}
      `),
    };
  }

  if (src === 'training' && lead.data?.audience === 'women-monetize' || src === 'for-women' || lead.data?.audience === 'women-monetize') {
    return {
      subject: 'The next cohort',
      html: buildEmail(first, `
        <p>I'm taking the next round of training applications seriously. Spots are intentionally limited — this isn't a course you buy access to, it's a program you get accepted into.</p>
        <p>If you're still interested, now's a good time to confirm. Just reply and I'll let you know where you stand.</p>
        ${contactBlock()}
      `),
    };
  }

  if (src === 'training' && lead.data?.audience === 'men-certification' || src === 'certify' || lead.data?.audience === 'men-certification') {
    return {
      subject: 'Certification cohort update',
      html: buildEmail(first, `
        <p>Wanted to give you an update on the certification program. I'm finalizing the next cohort. It's small — intentionally. The training works because of the 1-on-1 structure.</p>
        <p>If you're still interested in being considered, confirm that here and I'll keep your application active.</p>
        ${contactBlock()}
      `),
    };
  }

  // Default
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
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${res.status} ${err}`);
  }
}

// ── Step windows (hours since created_at) ───────────────────────────────────
const STEPS = [
  { step: 1, minH: 44, maxH: 52,  fn: emailStep1 },
  { step: 2, minH: 116, maxH: 124, fn: emailStep2 },
  { step: 3, minH: 236, maxH: 244, fn: emailStep3 },
  { step: 4, minH: 500, maxH: 516, fn: emailStep4 },
];

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

  let totalSent = 0;
  let totalErrors = 0;

  for (const { step, minH, maxH, fn } of STEPS) {
    const cutoffStart = new Date(Date.now() - maxH * 60 * 60 * 1000).toISOString();
    const cutoffEnd   = new Date(Date.now() - minH * 60 * 60 * 1000).toISOString();

    const prevStep = step - 1;
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?select=id,name,email,panel_type,data&email=not.is.null&sequence_step=eq.${prevStep}&created_at=gte.${cutoffStart}&created_at=lte.${cutoffEnd}`,
      { headers }
    );
    const leads = await res.json();

    if (!Array.isArray(leads) || !leads.length) continue;

    const results = await Promise.allSettled(leads.map(async (lead) => {
      const { subject, html } = fn(lead);
      await sendEmail(RESEND_API_KEY, lead.email, subject, html);

      await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${lead.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sequence_step: step }),
      });
    }));

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const errors = results.filter(r => r.status === 'rejected').length;
    if (errors) {
      results.filter(r => r.status === 'rejected').forEach(r => console.error(`[followup] step ${step}:`, r.reason));
    }
    totalSent += sent;
    totalErrors += errors;
    console.log(`[followup] step ${step}: sent ${sent}/${leads.length}`);
  }

  return { statusCode: 200, body: JSON.stringify({ sent: totalSent, errors: totalErrors }) };
};
