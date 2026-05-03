const SL_SESSION_CATALOG = {
  depositPct: 0.5,
  packages: [
    {
      id: 'sensual',
      name: 'Sensual Surrender',
      minutes: 60,
      shortDescription: '1 hour · soft & sensory',
      price: 200,
    },
    {
      id: 'naughty',
      name: 'Mr. Naughty & Nasty',
      minutes: 60,
      shortDescription: '1 hour · medium kink',
      price: 300,
    },
    {
      id: 'sadistic',
      name: 'The Sadistic Devil',
      minutes: 60,
      shortDescription: '1 hour · heavy & sadistic',
      price: 400,
    },
  ],
  addons: [
    { id: 'fire', name: 'Fire Play', desc: 'Cupping, waving, and controlled flame work', price: 100 },
    { id: 'rope', name: 'Rope Bondage', desc: 'Single column, full body, suspension elements', price: 75 },
    { id: 'sensory', name: 'Sensory Deprivation', desc: 'Blindfold, earplugs, full sensory override', price: 40 },
    { id: 'photo', name: 'Session Photography', desc: 'Private photos, yours to keep', price: 100 },
    { id: 'aftercare', name: 'Extended Aftercare', desc: 'Extra 30 min of grounding, care, and presence', price: 60 },
    { id: 'time', name: 'Time Extension', desc: 'Add 30 minutes to your session', price: 75 },
    { id: 'orgasmic', name: 'Orgasmic Edition', desc: 'Controlled release, negotiated during intake', price: 150 },
  ],
};

if (typeof module !== 'undefined') {
  module.exports = SL_SESSION_CATALOG;
}

if (typeof window !== 'undefined') {
  window.SL_SESSION_CATALOG = SL_SESSION_CATALOG;
}
