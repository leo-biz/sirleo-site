# Sir Leo Site — Changelog

All updates, features, and fixes tracked here in reverse order.

---

## v2.3 — 2026-04-30
**Test environment data tagging**
- `hub.js` — detects non-production hostname, flags submissions with `is_test: true` in data field
- `notify.js` — auto-created session offers get `private_notes: '[TEST]'` when submission is flagged
- Full flow still runs on dev — tags let you filter/delete test data in Supabase

## v2.2 — 2026-04-30
**Pre-deploy fixes**
- `build.html` — guard `Stripe()` init with null check so empty key doesn't crash page JS in local dev
- `TESTING.md` — redacted admin password from public repo

## v2.1 — 2026-04-30
**Session Offers — full lifecycle tracking**
- `session_offers` Supabase table (run `supabase/session_offers.sql`)
- Auto-created as draft on every form submission via notify.js
- `create-session.js` — admin-protected POST/PATCH for session offers
- `get-session.js` — public, fetches offer by ID, tracks view_count + viewed_at, blocks paid sessions
- `confirm-payment.js` — called from pay-success, verifies Stripe payment, marks offer as paid
- `build.html` — loads offer by `?id=UUID`, pre-populates duration/add-ons/notes, blocks if already paid
- `pay-success.html` — calls confirm-payment on load to mark session paid
- `create-checkout.js` — passes offer_id through to success URL and metadata
- Admin: Sessions page with pipeline stats (draft/sent/viewed/paid/completed/revenue)
- Admin: SessionOfferEditor in every lead drawer — create or edit offer, Save Draft or Save & Copy Link
- Admin: timeline (created/sent/viewed/paid/scheduled/completed) + view count per offer
- Admin nav: Sessions item with live badge count of active (non-completed) offers

## v2.0 — 2026-04-30
**Stripe Checkout Integration**
- `create-checkout.js` Netlify function — creates Stripe Checkout Session with line items
- Deposit (50%) and pay-in-full both supported as separate line item sets
- Session metadata captured: client name, duration, add-ons, notes, pay type
- `build.html` pay button calls function → redirects to Stripe hosted checkout
- `pay-success.html` — branded confirmation page, personalized with `?client=Name`
- `/pay-success` redirect added to netlify.toml
- Stripe publishable key wired in frontend; secret key reads from `STRIPE_SECRET_KEY` env var
- Requires: `netlify env:set STRIPE_SECRET_KEY sk_live_...` to activate

## v1.9 — 2026-04-29
**Hide Pricing from nav**
- Pricing link removed from main site nav (page still accessible via direct URL)

## v1.8 — 2026-04-29
**Version badge, light mode fixes, Pricing nav link**
- Version badge now shows `v1.8` (reads from CHANGELOG) instead of raw git SHA
- Main site nav: "Pricing" link added → `/pricing`
- Admin light mode: tag and status dot colors darkened for contrast on cream background
- Admin light mode: login input border fixed (was hardcoded white, now uses `--border2` CSS var)
- Pricing page light mode: card borders visible (was `rgba(255,255,255,0.07)`, now dark)

## v1.7 — 2026-04-29
**Admin: Send Links in Lead Drawer**
- "Send Links" section added to lead drawer (appears after Quick Actions)
- Session Builder button generates `https://sirleo.com/build?client=FirstName` from lead's name
- One-tap copy to clipboard with "✓ Copied" confirmation
- URL displayed inline so it can be manually selected/shared
- Payment Link button stubbed (disabled, "soon") — will activate when Stripe is wired

## v1.6 — 2026-04-29
**Pricing Page + Session Builder**
- `pricing.html` — membership tier page with Single/Monthly/Annual toggle
- Three tiers: Initiate (single session), Devotee (2/mo, featured), Consecrated (4/mo)
- Price data attributes drive JS toggle — no page reload needed
- `build.html` — session builder page Sir Leo sends post-call as `/build?client=Name`
- Duration radio cards: Initiation (90min), Immersion (2hr), Extended Rite (3hr)
- Add-on checkboxes: Fire Play, Rope Bondage, Impact Artistry, Sensory Deprivation, Documentation, Extended Aftercare
- Live running total; fixed summary bar with deposit (50%) / pay-in-full toggle
- Pay button wired with TODO for Stripe — alerts until keys are added
- `/pricing` and `/build` clean-URL redirects added to netlify.toml
- All prices are placeholders — to be updated after consultation

## v1.5 — 2026-04-29
**Cal.com Scheduling + book.html Supabase Wiring**
- Cal.com popup integrated into book.html — after submission, confirm screen shows "Schedule Consultation Call" button opening 15min cal.com booking
- book.html now saves all form answers + selections to Supabase submissions table on submit
- Contacts CRM upserted on every book.html submission
- UTM/referrer source attribution applied to book.html submissions
- Stripe integration deferred pending pricing structure decision

## v1.4 — 2026-04-29
**Full Admin Dashboard**
- Full React SPA admin at `/admin` — sidebar navigation, dark luxury design
- Overview page: stats grid, recent leads feed, traffic sources + top cities bar charts
- Leads page: searchable/filterable table with inline contact links and status indicators
- Contacts page: dual view (pipeline kanban + table) — 5-stage pipeline (New → Reached Out → Responded → Converted → Closed)
- Lead detail drawer: full form answers, quick actions (text/email/call), pipeline status selector, notes editor — saves to Supabase contacts table
- Waitlist page: VIP/GA breakdown with separate tables
- Analytics page: event types, traffic sources, top cities — all CSS bar charts
- Admin API updated: handles PATCH for contact and submission updates, returns full data including analytics summary
- GitHub repo made public to fix Netlify contributor limit on free plan

## v1.3 — 2026-04-29
**Day 2 Follow-up & Admin Dashboard**
- Scheduled follow-up function (`followup.js`) — runs daily at noon CT, emails leads 44–52 hours after inquiry with no response
- `follow_up_sent` boolean column added to submissions table — prevents duplicate follow-ups
- Admin dashboard at `/admin` — password-gated, shows all leads + waitlist with stats, filters, source, follow-up status
- Admin API function (`admin-leads.js`) — server-side password check, service role key never exposed to browser
- `/admin` redirect added to netlify.toml

## v1.2 — 2026-04-29
**Notifications, Audience Sync & Attribution**
- Phone number updated to (773) 234-8238 across site, hub, vCard, and notify function
- AfterDark event label changed to "Coming Soon · Chicago" (no premature date)
- Footer version badge auto-updates on every Netlify deploy (reads git SHA/tag via build script)
- SMS notification on form submission via Google Voice email gateway — no Twilio required
- Resend audience sync: every form submission adds contact to "General" audience
- Resend contact properties: `panel_type`, `utm_source`, `tier`, `serve_type`, `converted`
- Traffic source attribution: referrer parsed as fallback when UTM params absent (`instagram`, `facebook`, `tiktok`, `google`, `direct`, etc.)
- `SL_SOURCE` window global — resolved source persisted in sessionStorage across the session
- All Supabase submissions and CRM upserts now use resolved source (UTM → referrer → direct)

## v1.1 — 2026-04-29
**Notifications & Polish**
- Email notification to Sir Leo on every form submission (Resend + Netlify function)
- Auto-reply email sent to lead on submission — branded, dark-luxury tone
- Mobile breakpoint at 480px: full-screen modals, stacked CTAs, hidden custom cursor on touch
- OG/Twitter meta tags for social sharing previews (Instagram, FetLife, Facebook)
- Favicon added
- Footer version badge (v1.0)
- Auto-popup now fires after 15s AND 50% scroll (was 2.5s on load — too aggressive)
- Waitlist modal with GA/VIP tier selection — wired to Supabase waitlist table
- AfterDark "Join the Waitlist" button now captures in-house instead of external link
- GitHub auto-deploy webhook connected (push to dev/main → Netlify deploys)
- sitemap.xml and robots.txt added

## v1.0 — 2026-04-29
**Initial Launch**
- Full static site: Hero, Philosophy, Who I Serve, Offerings, KINK AfterDark, FAQ, Connect, Footer
- Dark/light theme toggle with localStorage persistence
- Custom animated cursor
- Scroll reveal animations (hero entrance, nav, label lines, section cards)
- React hub: BookPanel wizard (6 steps), CollabPanel, ContactModal, FAQ accordion
- 4 custom "Who I Serve" modals — tailored questions per audience type
- Supabase backend: submissions, contacts CRM, analytics, events_calendar, waitlist tables
- UTM attribution on all submissions (utm_source, utm_medium, utm_campaign)
- Analytics: pageviews, click tracking, scroll depth, time on page, panel open/abandon
- Auto-upsert to contacts CRM on every submission (preserves pipeline status)
- Autofill name/email across modals from prior submission
- Session ID ties analytics to submissions for lead journey tracking
- Netlify hosting + GitHub CI/CD pipeline
- Logo processed to transparent PNG (red monogram only)

---

## Upcoming / Backlog
- Custom domain
- Admin dashboard page (password-protected lead viewer)
- Resend audience sync for broadcasts
- Performance: migrate from Babel standalone to Vite build step
- Auto-reply email sequence (Day 0 confirm → Day 2 follow-up)
