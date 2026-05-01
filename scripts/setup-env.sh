#!/bin/bash
# Set all Stripe env vars across Netlify contexts
# Usage:
#   export STRIPE_SK_LIVE=sk_live_...
#   export STRIPE_SK_TEST=sk_test_...
#   export STRIPE_PK_LIVE=pk_live_...
#   export STRIPE_PK_TEST=pk_test_...
#   bash scripts/setup-env.sh

set -e

if [[ -z "$STRIPE_SK_LIVE" || -z "$STRIPE_SK_TEST" || -z "$STRIPE_PK_LIVE" || -z "$STRIPE_PK_TEST" ]]; then
  echo "Error: all four vars must be exported before running this script"
  echo "  STRIPE_SK_LIVE, STRIPE_SK_TEST, STRIPE_PK_LIVE, STRIPE_PK_TEST"
  exit 1
fi

echo "Setting Stripe secret keys..."
netlify env:set STRIPE_SECRET_KEY "$STRIPE_SK_LIVE" --context production
netlify env:set STRIPE_SECRET_KEY "$STRIPE_SK_TEST" --context deploy-preview
netlify env:set STRIPE_SECRET_KEY "$STRIPE_SK_TEST" --context branch-deploy

echo "Setting Stripe publishable keys..."
netlify env:set STRIPE_PUBLISHABLE_KEY "$STRIPE_PK_LIVE" --context production
netlify env:set STRIPE_PUBLISHABLE_KEY "$STRIPE_PK_TEST" --context deploy-preview
netlify env:set STRIPE_PUBLISHABLE_KEY "$STRIPE_PK_TEST" --context branch-deploy

echo ""
echo "Done. All Stripe keys set across contexts."
echo ""
echo "Next: run the product setup script for each environment:"
echo "  STRIPE_SECRET_KEY=\$STRIPE_SK_TEST node scripts/stripe-setup.js"
echo "  STRIPE_SECRET_KEY=\$STRIPE_SK_LIVE node scripts/stripe-setup.js"
