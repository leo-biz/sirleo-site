const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SITE_URL = process.env.URL || 'https://sirleo-site.netlify.app';
const DEPOSIT_PCT = 0.5;

const PACKAGES = {
  sensual: { name: 'Sensual Surrender', minutes: 60, price: 200 },
  naughty: { name: 'Mr. Naughty & Nasty', minutes: 60, price: 300 },
  sadistic: { name: 'The Sadistic Devil', minutes: 60, price: 400 },
};

const ADDONS = {
  fire: { name: 'Fire Play', desc: 'Cupping, waving, and controlled flame work', price: 100 },
  rope: { name: 'Rope Bondage', desc: 'Single column, full body, suspension elements', price: 75 },
  sensory: { name: 'Sensory Deprivation', desc: 'Blindfold, earplugs, full sensory override', price: 40 },
  photo: { name: 'Session Photography', desc: 'Private photos, yours to keep', price: 100 },
  aftercare: { name: 'Extended Aftercare', desc: 'Extra 30 min of grounding, care, and presence', price: 60 },
  time: { name: 'Time Extension', desc: 'Add 30 minutes to your session', price: 75 },
  orgasmic: { name: 'Orgasmic Edition', desc: 'Controlled release, negotiated during intake', price: 150 },
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { durationId, addonIds = [], payFull, notes, clientName, offerId } = body;
  const selectedPackage = PACKAGES[durationId];

  if (!selectedPackage) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid session package' }),
    };
  }

  const uniqueAddonIds = [...new Set(Array.isArray(addonIds) ? addonIds : [])];
  const selectedAddons = uniqueAddonIds.map(id => ADDONS[id]).filter(Boolean);

  if (selectedAddons.length !== uniqueAddonIds.length) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid add-on selected' }),
    };
  }

  const durationName = selectedPackage.name;
  const durationMinutes = selectedPackage.minutes;
  const basePrice = selectedPackage.price;
  const total = basePrice + selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const due = payFull ? total : Math.round(total * DEPOSIT_PCT);

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
    ...selectedAddons.map(a => ({
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
          name: `Deposit — ${durationName} Session${selectedAddons.length ? ' + Add-ons' : ''}`,
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
        duration_id: durationId,
        addons: selectedAddons.map(a => a.name).join(', '),
        addon_ids: uniqueAddonIds.join(','),
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
