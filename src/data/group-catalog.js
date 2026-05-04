const SL_GROUP_CATALOG = {
  tiers: [
    {
      id: 'caress',
      name: 'The Caress',
      level: 'Light',
      price: 250,
      shortDescription: 'featured guest · 4 observers included · ~15 min',
      desc: 'Sensual caress, erotic oil massage, and soft sensation. An intimate opening — electric without being overwhelming.',
      observerFee: 20,
    },
    {
      id: 'edge',
      name: 'The Edge',
      level: 'Medium',
      price: 350,
      shortDescription: 'featured guest · 4 observers included · ~15 min',
      desc: 'Wax, flogging, and fire. The room shifts. This is where things get dark and beautiful.',
      observerFee: 25,
    },
    {
      id: 'dark',
      name: 'The Dark',
      level: 'Unhinged',
      price: 500,
      shortDescription: 'featured guest · 4 observers included · ~15 min',
      desc: 'Full expression. Forced orgasm. For groups that know exactly what they want and are ready for all of it.',
      observerFee: 30,
    },
  ],
  guestUpgrades: [
    { id: 'upgrade-light',    name: 'Light',    price: 25  },
    { id: 'upgrade-medium',   name: 'Medium',   price: 75  },
    { id: 'upgrade-unhinged', name: 'Unhinged', price: 150 },
  ],
  bachelorette: [
    {
      id: 'sendoff',
      name: 'The Send-Off',
      price: 350,
      shortDescription: '1 song · sensual · bride light experience · up to 6 guests',
      desc: 'A sensual opening set — teasing, electric, unforgettable. Bride featured first. Travel included.',
    },
    {
      id: 'lastnight',
      name: 'Last Night Out',
      price: 600,
      shortDescription: '2–3 songs · sensual → impact · bride medium experience · up to 8 guests',
      desc: "The full arc. Sensual into impact. Bride gets the medium treatment. This is the one they'll talk about.",
    },
  ],
  shows: [
    {
      id: 'tease',
      name: 'The Tease',
      price: 150,
      shortDescription: '1 song · sensual · crossover-friendly',
      desc: 'One song. Pure sensual energy. Works for vanilla crowds, crossover events, and collab performances.',
    },
    {
      id: 'build',
      name: 'The Build',
      price: 250,
      shortDescription: '2–3 songs · sensual → impact',
      desc: 'The arc begins. Sensual into impact. The room warms up and then catches fire.',
    },
    {
      id: 'burn',
      name: 'The Burn',
      price: 400,
      shortDescription: '3–4 songs · sensual → impact → fire',
      desc: "The full set. Sensual, impact, then fire. The room doesn't forget this one.",
    },
  ],
};

if (typeof window !== 'undefined') window.SL_GROUP_CATALOG = SL_GROUP_CATALOG;
if (typeof module !== 'undefined') module.exports = SL_GROUP_CATALOG;
