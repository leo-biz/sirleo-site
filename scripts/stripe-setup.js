// Run once to create all Stripe products + prices in both environments
// Usage:
//   export STRIPE_SETUP_KEY_TEST=rk_test_...
//   export STRIPE_SETUP_KEY_LIVE=rk_live_...
//   node scripts/stripe-setup.js

const testKey = process.env.STRIPE_SETUP_KEY_TEST;
const liveKey = process.env.STRIPE_SETUP_KEY_LIVE;

if (!testKey || !liveKey) {
  console.error('Missing keys. Export both before running:');
  console.error('  export STRIPE_SETUP_KEY_TEST=rk_test_...');
  console.error('  export STRIPE_SETUP_KEY_LIVE=rk_live_...');
  process.exit(1);
}

const Stripe = require('../netlify/functions/node_modules/stripe');

const PACKAGES = [
  {
    id: 'sensual-surrender',
    name: 'Sensual Surrender',
    description: 'Erotic massage, silk, feather, soft restraint — sensation over intensity. 1 hour.',
    price: 200_00,
  },
  {
    id: 'mr-naughty-nasty',
    name: 'Mr. Naughty & Nasty',
    description: 'Choking, toys, and escalating kink. Erotic and edged — pleasure with teeth. 1 hour.',
    price: 300_00,
  },
  {
    id: 'the-sadistic-devil',
    name: 'The Sadistic Devil',
    description: 'Full sadistic expression. Designed for those who crave the dark end of the spectrum. 1 hour.',
    price: 400_00,
  },
];

const ADDONS = [
  { id: 'fire-play',           name: 'Add-on: Fire Play',           price: 100_00 },
  { id: 'rope-bondage',        name: 'Add-on: Rope Bondage',        price:  75_00 },
  { id: 'sensory-deprivation', name: 'Add-on: Sensory Deprivation', price:  40_00 },
  { id: 'session-photography', name: 'Add-on: Session Photography', price: 100_00 },
  { id: 'extended-aftercare',  name: 'Add-on: Extended Aftercare',  price:  60_00 },
  { id: 'time-extension',      name: 'Add-on: Time Extension',      price:  75_00 },
  { id: 'orgasmic-edition',    name: 'Add-on: Orgasmic Edition',    price: 150_00 },
];

async function createProduct(stripe, item) {
  const product = await stripe.products.create({
    name: item.name,
    description: item.description || item.name,
    metadata: { sl_id: item.id },
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: item.price,
    currency: 'usd',
    metadata: { sl_id: item.id },
  });
  return { id: item.id, name: item.name, price_id: price.id, amount: item.price / 100 };
}

async function setupEnv(label, key) {
  const stripe = Stripe(key);
  console.log(`\n── ${label} ──────────────────────────────\n`);

  console.log('Session packages:');
  const packages = {};
  for (const pkg of PACKAGES) {
    const result = await createProduct(stripe, pkg);
    packages[result.id] = result.price_id;
    console.log(`  ✓ ${result.name} ($${result.amount}) → ${result.price_id}`);
  }

  console.log('\nAdd-ons:');
  const addons = {};
  for (const addon of ADDONS) {
    const result = await createProduct(stripe, addon);
    addons[result.id] = result.price_id;
    console.log(`  ✓ ${result.name} ($${result.amount}) → ${result.price_id}`);
  }

  return { packages, addons };
}

async function main() {
  const test = await setupEnv('TEST', testKey);
  const live = await setupEnv('LIVE', liveKey);

  console.log('\n══════════════════════════════════════════');
  console.log('Paste these into create-checkout.js:\n');
  console.log('// Test price IDs');
  console.log('const TEST_PRICE_IDS = ' + JSON.stringify(test, null, 2) + ';\n');
  console.log('// Live price IDs');
  console.log('const LIVE_PRICE_IDS = ' + JSON.stringify(live, null, 2) + ';');
  console.log('══════════════════════════════════════════\n');
}

main().catch(err => { console.error(err.message); process.exit(1); });
