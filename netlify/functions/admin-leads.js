// Password-gated endpoint — returns leads from Supabase for the admin dashboard
const SUPABASE_URL = 'https://mwpscytkzjtkqjjqytqu.supabase.co';

exports.handler = async (event) => {
  const { SUPABASE_SERVICE_KEY, ADMIN_PASSWORD } = process.env;

  const provided = event.headers['x-admin-password'] || event.queryStringParameters?.p;
  if (!provided || provided !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  };

  const [subRes, waitRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/submissions?select=*&order=created_at.desc&limit=200`, { headers }),
    fetch(`${SUPABASE_URL}/rest/v1/waitlist?select=*&order=created_at.desc&limit=200`, { headers }),
  ]);

  const [submissions, waitlist] = await Promise.all([subRes.json(), waitRes.json()]);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissions, waitlist }),
  };
};
