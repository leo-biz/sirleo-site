# Sir Leo Site — Changelog

All updates, features, and fixes tracked here in reverse order.

---

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
