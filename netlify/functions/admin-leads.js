// Admin API — password-gated, handles GET (all data) + PATCH (contact/submission updates)
const { sbHeaders, tableUrl } = require('./lib/supabase');

exports.handler = async (event) => {
  const { SUPABASE_SERVICE_KEY, ADMIN_PASSWORD } = process.env;
  const provided = event.headers['x-admin-password'] || event.queryStringParameters?.p;
  if (!provided || provided !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const headers = sbHeaders(SUPABASE_SERVICE_KEY);

  // ── PATCH — update contact, submission, or session ──
  if (event.httpMethod === 'PATCH') {
    const { type, id } = event.queryStringParameters || {};
    const body = JSON.parse(event.body || '{}');
    if (!type || !id) return { statusCode: 400, body: 'Missing type or id' };

    const table = type === 'contact' ? 'contacts' : type === 'session' ? 'session_offers' : 'submissions';
    const res = await fetch(tableUrl(table, `id=eq.${id}`), {
      method: 'PATCH', headers,
      body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
    });
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
  }

  // ── GET — fetch all dashboard data ──
  const [subRes, contactRes, waitRes, analyticsRes, sessionRes] = await Promise.all([
    fetch(tableUrl('submissions', 'select=*&order=created_at.desc&limit=500'), { headers }),
    fetch(tableUrl('contacts', 'select=*&order=last_seen.desc.nullsfirst&limit=500'), { headers }),
    fetch(tableUrl('waitlist', 'select=*&order=created_at.desc&limit=500'), { headers }),
    fetch(tableUrl('analytics', 'select=event_type,utm_source:data->>utm_source,city,country,created_at&order=created_at.desc&limit=2000'), { headers }),
    fetch(tableUrl('session_offers', 'select=*&order=created_at.desc&limit=500'), { headers }),
  ]);

  const [submissions, contacts, waitlist, analytics, sessions] = await Promise.all([
    subRes.json(), contactRes.json(), waitRes.json(), analyticsRes.json(), sessionRes.json(),
  ]);

  // Analytics summary
  const now = Date.now();
  const day7 = new Date(now - 7 * 86400000).toISOString();
  const day30 = new Date(now - 30 * 86400000).toISOString();

  const recentAnalytics = Array.isArray(analytics) ? analytics : [];
  const summary = {
    pageviews_30d: recentAnalytics.filter(e => e.event_type === 'pageview' && e.created_at > day30).length,
    pageviews_7d:  recentAnalytics.filter(e => e.event_type === 'pageview' && e.created_at > day7).length,
    events_by_type: recentAnalytics.reduce((acc, e) => { acc[e.event_type] = (acc[e.event_type] || 0) + 1; return acc; }, {}),
    sources: recentAnalytics.filter(e => e.event_type === 'pageview').reduce((acc, e) => {
      const src = e.utm_source || 'direct';
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {}),
    cities: recentAnalytics.filter(e => e.event_type === 'pageview' && e.city).reduce((acc, e) => {
      const key = `${e.city}, ${e.country}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissions, contacts, waitlist, sessions: Array.isArray(sessions) ? sessions : [], analytics_summary: summary }),
  };
};
