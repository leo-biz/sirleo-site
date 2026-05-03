# Sir Leo Site — Changelog

All updates, features, and fixes tracked here in reverse order.

---

## v2.15 — 2026-05-02
**Fix test audience routing and update operating docs**
- `hub.js` — submissions now include `data.source_page` for cleaner admin, testing, and follow-up attribution
- `book.html` — direct booking submissions now include `data.source_page` and test-environment tagging
- `notify.js` — fixed Resend sync to use `RESEND_TEST_AUDIENCE_ID` for test submissions instead of always posting to production audience
- `TESTING.md` — updated stale landing-page, follow-up, pricing, and session-builder checks to match the current `/sessions`, `/events`, `/training`, `/pricing`, and `/build` flows
- `EMPIRE.md` — updated training overview and site version from the old two-track model to the current three-level training structure

## v2.14 — 2026-05-02
**Revamp events, sessions, training, pricing, build pages**
- `events.html` — removed type icons from celebration grid; cleaned alignment; renamed page framing to "Group Experiences"; added Venue & Partner section (salons, shops, studios, private clubs)
- `sessions.html` — updated hero copy to mention couples + 1-on-1; replaced hidden add-ons footnote with a full visible add-ons section; time-extension add-ons labeled with +30 min tags
- `training.html` — full rewrite: removed gender-split tabs; replaced with 3 depth levels (Awareness & Education, Craft & Practice, Professional Practice); no gender requirements; pricing notes per level
- `pricing.html` — full rewrite: restructured around session packages ($200/$300/$400) + add-ons; membership moved to a secondary callout; training pricing referenced via link; removed confusing tier toggle
- `build.html` — pay in full is now the default state (checked); deposit is opt-out

## v2.13 — 2026-05-02
**Fix modal auto-open, standardize nav, Who I Serve navigates to pages**
- `main.js` — Who I Serve cards now navigate to `/sessions?open`, `/events?open`, `/training?open` instead of opening the hub modal on the homepage
- `sessions.html`, `events.html`, `training.html` — removed unconditional hub auto-open on load; modal only auto-opens when `?open` param is present (i.e. arrived from homepage)
- `sessions.html`, `events.html`, `training.html` — nav standardized to match homepage (Offerings · Who I Serve · Events · Questions · Contact)
- `sessions.html`, `events.html`, `training.html` — added `.footer-version` span so version badge shows in all page footers

## v2.12 — 2026-05-02
**Wire hub modal into all landing pages; fix index.html Events nav**
- `training.html` — replaced standalone application form with hub CTA section; apply buttons now open `serve-learners` panel; added React/ReactDOM/Babel + hub.js dependencies; auto-opens hub on load
- `index.html` — Events nav link changed from `#afterdark` anchor to `/events` page

## v2.11 — 2026-05-02
**events.html — add birthday celebrations to SEO and page content**
- Title, meta description, OG tags — added "birthday celebrations" alongside bachelorette
- Hero subtitle — includes birthday alongside bachelorette and group events
- "Bachelorette Takeover" card — renamed to "Bachelorette & Birthday Takeover" with updated copy
- Intro paragraph — removed bachelorette-specific framing, now speaks to all group celebrations
- Inquiry form event_type field — changed from freetext to dropdown (bachelorette, birthday, private party, other)

## v2.10 — 2026-05-02
**Simplify followup.js audience routing**
- Replaced source_page/audience data field checks with panel_type as single source of truth
- Added `audience()` helper: serve-organizers → events, serve-learners + data.track=men → certify, serve-learners default → women, everything else → sessions
- Removed all dead fallback conditions for deleted pages (for-women, certify, men)

## v2.9 — 2026-05-02
**Consolidate landing pages: sessions + training**
- `sessions.html` — rewritten gender-neutral, speaks to anyone booking a private session
- `training.html` — new two-track page (Women monetize / Men certify) with tab selector and single application form
- `men.html`, `for-women.html`, `certify.html` — deleted
- `netlify.toml` — /training redirect added; /men, /for-women, /certify → 301 to /training
- `sitemap.xml` — removed old pages, added /training
- `followup.js` — updated audience routing to handle training page source_page
- `sitemap-visual.html` — updated to reflect new 3-page structure

## v2.8 — 2026-05-02
**SEO, 5 landing pages, multi-step email sequences**
- `index.html` — updated title, canonical tag, OG URLs to sirblackleo.com, LocalBusiness schema markup
- `book.html`, `pricing.html` — added full SEO meta tags (title, description, canonical, OG, Twitter Card)
- `robots.txt` — updated sitemap URL to sirblackleo.com
- `sitemap.xml` — updated domain, added all 8 pages including 5 new landing pages
- `netlify.toml` — added redirects for /events, /sessions, /men, /for-women, /certify
- `events.html` — group experiences / bachelorette landing page with inquiry form
- `sessions.html` — women's private sessions landing page with session selector
- `men.html` — men's sessions landing page with goal selector
- `for-women.html` — women monetize/findom training application page
- `certify.html` — men's BDSM provider certification application page
- `netlify/functions/followup.js` — full rewrite: 4-step sequences (Day 2/5/10/21), audience-specific emails per source_page/panel_type
- Supabase `submissions` table: added `sequence_step` integer column (default 0)

## v2.7 — 2026-05-01
**Real session packages + Stripe wired**
- `build.html` — updated packages: Sensual Surrender ($200), Mr. Naughty & Nasty ($300), The Sadistic Devil ($400), all 1 hour
- `build.html` — updated add-ons: Fire Play ($100), Rope Bondage ($75), Sensory Deprivation ($40), Session Photography ($100), Extended Aftercare ($60), Time Extension ($75), Orgasmic Edition ($150)
- Stripe products + prices created in both test and live environments
- Stripe keys set per Netlify context (live → production, test → preview/branch-deploy)
- `scripts/stripe-setup.js` — one-shot product creation script
- `scripts/setup-env.sh` — Netlify env var setup script

## v2.6 — 2026-05-01
**Test data isolation improvements**
- `notify.js` — skip Resend audience sync for test submissions (`is_test: true`) so dev contacts never land in production audiences
- `hub.js` — added error logging to `saveToSupabase` for debugging

## v2.5 — 2026-04-30
**Fix Netlify CI build failure**
- `netlify.toml` — build command now runs `npm --prefix netlify/functions install` before version script so esbuild can resolve the `stripe` module

## v2.4 — 2026-04-30
**Light mode polish**
- FAQ: replaced hardcoded dark-mode inline colors with CSS variables — title, subtitle, questions, answers, background all theme-aware
- Admin: nav hover, table row hover, search focus ring all invisible in light mode — fixed with proper light mode overrides

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
