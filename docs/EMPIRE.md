# Sir Leo — Empire Overview

Last updated: 2026-05-02

---

## Brand Identity

**Sir Leo** — Chicago-based professional dominant, fire artist, and experience curator.
- **Domain:** sirblackleo.com
- **Phone:** (773) 234-8238
- **Email:** sir.black.leo@gmail.com
- **Location:** Chicago, IL (serves Chicago + suburbs: Evanston, Oak Park, Naperville, Schaumburg)
- **Social:** @sir_black_leo (Instagram) · facebook.com/sirblackleo · fetlife.com/Sir__Leo
- **Tagline:** "Embrace your darkest desires."
- **Positioning:** Dark luxury. Consent-forward. Elevated. Not performance for its own sake — the architecture of transformation.

---

## Revenue Streams

### 1. Private Sessions — `/sessions`

All sessions are 1 hour, private, end with full aftercare.

| Package | Price | Description |
|---|---|---|
| Sensual Surrender | $200 | Erotic massage, silk, feather, soft restraint — sensation over intensity |
| Mr. Naughty & Nasty | $300 | Choking, toys, escalating kink — erotic and edged *(Most Chosen)* |
| The Sadistic Devil | $400 | Full sadistic expression — heavy end of the spectrum |

Impact scales with tier (light → medium → heavy). Not a separate add-on.

**Add-ons:**

| Name | Price | Notes |
|---|---|---|
| Fire Play | +$100 | Higher skill/risk |
| Rope Bondage | +$75 | |
| Sensory Deprivation | +$40 | |
| Session Photography | +$100 | Private photos, yours to keep |
| Extended Aftercare | +$60 | Extra 30 min |
| Time Extension | +$75 | +30 min |
| Orgasmic Edition | +$150 | Controlled release — on his terms, not yours |

**Booking flow:**
1. Intake conversation (understand experience, limits, desires)
2. $100 deposit secures the date — balance due day-of
3. Show up — private location, full aftercare included

### 2. Group Events — `/events`

Bachelorette parties, birthday celebrations, girls' nights, anniversaries, private parties.

**What's included:**
- Fire Artistry — live fire cupping, flame work, theatrical demonstration
- Kink Showcase — bondage demos, sensation play, power dynamics
- Guest of Honor Treatment — full evening built around whoever deserves the spotlight

**How it works:** Inquire → Customize → Show up.

### 3. Education — `/education`

Three levels of depth. Gender-neutral framing; no gender requirements.

**Awareness & Education**
- Introductory education for corporate, wellness, creative, and private groups
- Kink literacy, consent frameworks, language, etiquette, and safety basics
- Appropriate for people who need fluency without becoming practitioners

**Craft & Practice**
- Hands-on practice for people who want to develop technique
- Impact, restraint, sensation, negotiation, aftercare, and scene structure
- Cohort or private instruction depending on fit and goals

**Professional Practice**
- Application-based training for people building paid/private work
- Technique, ethics, client screening, pricing, boundaries, operations, and supervised development
- Selective by design; not open to everyone

---

## Multi-Packs & Memberships (Post-Session Only)

Not on primary booking flow — pitched after the first session only.

**Multi-Packs (credit-based):**
- 3-credit pack: $540 (10% off — saves $60)
- 5-credit pack: $850 (15% off — saves $150)
Credits apply to any tier; pay the difference to upgrade.

**Memberships (application-based, 3-month minimum):**

| Tier | Credits/mo | Monthly | 3-mo Upfront | Perks |
|---|---|---|---|---|
| Devoted | 2 | $320/mo | $864 (1 mo free) | Priority scheduling, text access |
| Consecrated | 4 | $600/mo | $1,620 (1 mo free) | Everything + custom ritual design, first pick of new offerings |

**Nudge strategy (light, non-pushy):**
1. Session builder bottom: *"Book regularly? Returning clients save up to 25% — ask after your first session."*
2. Post-booking confirmation: *"Clients who return often explore membership — no pressure, just something to consider."*
3. Day 2 follow-up P.S.: *"Multi-session packs and membership available for returning clients. Reply to learn more."*

**Why application-based + 3-month minimum:** prevents single-month perk farming; financial commitment filters casual sign-ups.

---

## Audience Segments

| Segment | Hub Panel | Landing Page | Description |
|---|---|---|---|
| Curious Individuals & Couples | `serve-individuals` | `/sessions` | Private sessions, power/sensation/surrender |
| Event Organizers & Producers | `serve-organizers` | `/events` | Bachelorette, birthday, private group events |
| Artists, Collaborators & Visionaries | `serve-artists` | `/events` | Creative collaboration, fire art, performance |
| Learners & Practitioners | `serve-learners` | `/education` | Education, practice, professional training |

---

## Digital Infrastructure

### Primary Site — sirblackleo.com
- **Stack:** Static HTML + vanilla JS + React 18 (hub modal only)
- **Hosting:** Netlify (production = `main`, dev previews = `dev` branch)
- **Repo:** github.com/leo-biz/sirleo-site
- **Backend:** Supabase (submissions, contacts CRM, analytics, waitlist, session_offers tables)
- **Email:** Resend (notifications to Sir Leo + auto-replies to leads)
- **Payments:** Stripe (Checkout, deposit + pay-in-full, test/live keys per Netlify context)
- **Version:** v2.15 (as of 2026-05-02)

**Key pages:**
- `/` — Homepage (hero, philosophy, who I serve, offerings, KINK AfterDark, contact)
- `/sessions` — Private sessions landing page
- `/events` — Group events landing page
- `/education` — Education landing page for individuals, couples, and groups
- `/pricing` — Session packages + membership tiers
- `/build` — Session builder (Sir Leo sends post-call as `/build?client=Name`)
- `/pay-success` — Stripe payment confirmation
- `/admin` — Password-protected CRM dashboard

**Hub modal (hub.js):** React SPA mounted at `#hub-root` on every page. Opens context-aware panels per audience. Panels: `book`, `serve-individuals`, `serve-organizers`, `serve-learners`, `serve-artists`, `contact`, `waitlist`, `collab`.

**Analytics tracked:** pageviews, clicks, scroll depth, time on page, panel open/abandon, UTM attribution, session ID ties analytics to submissions.

**Email follow-up sequences (followup.js):** Audience-routed by `panel_type`. 4 steps: Day 2 (44–52h), Day 5 (116–124h), Day 10 (236–244h), Day 21 (500–516h).

**Audience routing:**
- `serve-organizers` → events sequence
- `serve-learners` + `data.track = 'men'` → certify sequence
- `serve-learners` default → women sequence
- everything else → sessions sequence

### Admin Dashboard (/admin)
- Overview: stats, recent leads, traffic sources, top cities
- Leads: searchable/filterable table, inline contact links, status
- Contacts: CRM pipeline (New → Reached Out → Responded → Converted → Closed)
- Lead drawer: full answers, quick actions (text/email/call), pipeline status, notes
- Sessions: pipeline (draft/sent/viewed/paid/completed), revenue
- Session Offers: admin creates offer → client gets link → pays via Stripe

### Session Offer Flow
1. Lead submits form
2. `notify.js` auto-creates draft session offer in Supabase
3. Admin builds offer in drawer (duration, add-ons, notes) → "Save & Copy Link"
4. Client opens `/build?id=UUID` — pre-populated, pay button live
5. Stripe Checkout → `/pay-success` → `confirm-payment.js` marks offer paid

### Secondary Properties
- **sirleo-links** (`sirleo-links.netlify.app`) — Link-in-bio. Static HTML, dynamic content pulled from Google Sheet via Apps Script at runtime. Config: booking open/closed flag, event banner, Calendly URL, intake form URL.
- **sir_leo_automations** — Google Apps Script CRM. Form → ContactManager (Google Sheets) → Emailsender (Gmail confirmation). Timers.js manages triggers.
- **Black-Ops CRM** (`~/.openclaw/workspace/apps/black-ops/`) — Internal operations dashboard. FastAPI + SQLite. Contacts pipeline, tasks (Eisenhower quadrants), outreach campaigns, drip sequences. Twilio SMS. Runs on localhost:8000.

---

## KINK AfterDark (Signature Event)

Status: Coming Soon · Chicago
- Part immersive theater, part social ceremony
- General Admission (open floor) + VIP (limited access)
- Features: Immersive Performances, Interactive Stations, Fire Artistry, Impact Demonstrations, Luxury Atmosphere, Exclusive Afterparty
- Waitlist captured via hub modal → Supabase waitlist table (GA/VIP tier)

---

## Git Workflow

- All changes commit to `dev` branch
- `dev` → Netlify branch deploy (free, preview URL)
- Only merge `dev → main` when explicitly told ("merge", "go live", "ship it")
- `main` → Netlify production (sirblackleo.com) — costs 15 Netlify credits per deploy
- Every commit: bump version in `version.js` + add entry to `CHANGELOG.md`
- No Co-Authored-By trailers (Netlify deploy hook checks committer identity)
