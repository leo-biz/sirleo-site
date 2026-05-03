const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sbHeaders, tableUrl } = require('./lib/supabase');

exports.handler = async (event) => {
  const { stripe_session_id, offer_id } = event.queryStringParameters || {};
  if (!stripe_session_id) return { statusCode: 400, body: 'Missing stripe_session_id' };

  try {
    const session = await stripe.checkout.sessions.retrieve(stripe_session_id);
    if (session.payment_status !== 'paid') {
      return { statusCode: 200, body: JSON.stringify({ paid: false }) };
    }

    // Update session offer if linked
    if (offer_id && process.env.SUPABASE_SERVICE_KEY) {
      const headers = sbHeaders(process.env.SUPABASE_SERVICE_KEY, { prefer: 'return=minimal' });
      await fetch(tableUrl('session_offers', `id=eq.${offer_id}`), {
        method: 'PATCH', headers,
        body: JSON.stringify({
          status: 'paid',
          paid_at: new Date().toISOString(),
          amount_paid: Math.round(session.amount_total / 100),
          pay_type: session.metadata?.pay_type || 'unknown',
          stripe_session_id,
          stripe_payment_intent: session.payment_intent,
          updated_at: new Date().toISOString(),
        }),
      });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        paid: true,
        client_name: session.metadata?.client_name || '',
        amount: Math.round(session.amount_total / 100),
        pay_type: session.metadata?.pay_type,
      }),
    };
  } catch (err) {
    console.error('confirm-payment error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
