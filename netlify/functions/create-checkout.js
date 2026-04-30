const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SITE_URL = process.env.URL || 'https://sirleo-site.netlify.app';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { durationName, durationMinutes, basePrice, addons, total, due, payFull, notes, clientName, offerId } = body;

  // Build line items
  const lineItems = [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${durationName} Session (${durationMinutes} min)`,
          description: 'Private session with Sir Leo · Chicago',
        },
        unit_amount: Math.round(basePrice * 100),
      },
      quantity: 1,
    },
    ...addons.map(a => ({
      price_data: {
        currency: 'usd',
        product_data: { name: a.name, description: a.desc },
        unit_amount: Math.round(a.price * 100),
      },
      quantity: 1,
    })),
  ];

  // If deposit only, replace all line items with a single deposit line
  const checkoutItems = payFull ? lineItems : [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Deposit — ${durationName} Session${addons.length ? ' + Add-ons' : ''}`,
          description: `50% deposit to secure your session. Remainder ($${total - due}) due at session.`,
        },
        unit_amount: Math.round(due * 100),
      },
      quantity: 1,
    },
  ];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: checkoutItems,
      mode: 'payment',
      success_url: `${SITE_URL}/pay-success?session_id={CHECKOUT_SESSION_ID}&client=${encodeURIComponent(clientName || '')}${offerId ? `&offer_id=${offerId}` : ''}`,
      cancel_url: `${SITE_URL}/build${offerId ? `?id=${offerId}` : (clientName ? `?client=${encodeURIComponent(clientName)}` : '')}`,
      metadata: {
        client_name: clientName || '',
        duration: durationName,
        addons: addons.map(a => a.name).join(', '),
        notes: notes || '',
        pay_type: payFull ? 'full' : 'deposit',
        total_amount: String(total),
        offer_id: offerId || '',
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
