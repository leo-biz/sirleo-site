const SUPABASE_URL = 'https://mwpscytkzjtkqjjqytqu.supabase.co';

function sbHeaders(key, { prefer = 'return=representation' } = {}) {
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...(prefer ? { 'Prefer': prefer } : {}),
  };
}

function tableUrl(table, query = '') {
  const suffix = query ? (query.startsWith('?') ? query : `?${query}`) : '';
  return `${SUPABASE_URL}/rest/v1/${table}${suffix}`;
}

module.exports = { SUPABASE_URL, sbHeaders, tableUrl };
