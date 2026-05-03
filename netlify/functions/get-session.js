const { sbHeaders, tableUrl } = require('./lib/supabase');

exports.handler = async (event) => {
  const { SUPABASE_SERVICE_KEY } = process.env;
  const { id } = event.queryStringParameters || {};
  if (!id) return { statusCode: 400, body: 'Missing id' };

  const headers = sbHeaders(SUPABASE_SERVICE_KEY, { prefer: null });

  // Fetch — exclude private_notes
  const res = await fetch(
    tableUrl('session_offers', `id=eq.${id}&select=id,client_name,duration_value,duration_name,base_price,addon_ids,addon_names,total_price,deposit_amount,notes,status,view_count,viewed_at,paid_at`),
    { headers }
  );
  const rows = await res.json();
  if (!rows?.length) return { statusCode: 404, body: 'Not found' };
  const offer = rows[0];

  if (['paid', 'completed', 'cancelled'].includes(offer.status)) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer),
    };
  }

  // Track view
  const updates = { view_count: (offer.view_count || 0) + 1, updated_at: new Date().toISOString() };
  if (!offer.viewed_at) {
    updates.viewed_at = new Date().toISOString();
    if (offer.status === 'sent') updates.status = 'viewed';
  }
  await fetch(tableUrl('session_offers', `id=eq.${id}`), {
    method: 'PATCH',
    headers: sbHeaders(SUPABASE_SERVICE_KEY, { prefer: 'return=minimal' }),
    body: JSON.stringify(updates),
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ...offer, ...updates }),
  };
};
