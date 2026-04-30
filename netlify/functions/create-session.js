const SUPABASE_URL = 'https://mwpscytkzjtkqjjqytqu.supabase.co';

const sbHeaders = (key) => ({
  'apikey': key, 'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json', 'Prefer': 'return=representation',
});

exports.handler = async (event) => {
  const { SUPABASE_SERVICE_KEY, ADMIN_PASSWORD } = process.env;
  const pw = event.headers['x-admin-password'];
  if (!pw || pw !== ADMIN_PASSWORD) return { statusCode: 401, body: 'Unauthorized' };

  const headers = sbHeaders(SUPABASE_SERVICE_KEY);
  const params = event.queryStringParameters || {};
  const body = JSON.parse(event.body || '{}');

  // POST — create
  if (event.httpMethod === 'POST') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/session_offers`, {
      method: 'POST', headers,
      body: JSON.stringify({ ...body, created_at: new Date().toISOString() }),
    });
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data[0] || data) };
  }

  // PATCH — update by id
  if (event.httpMethod === 'PATCH' && params.id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/session_offers?id=eq.${params.id}`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
    });
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data[0] || data) };
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
